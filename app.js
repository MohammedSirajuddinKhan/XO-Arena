const express = require("express");
const path = require("path");
const session = require("express-session");
const passport = require("passport");
const flash = require("connect-flash");
const cookieParser = require("cookie-parser");
const helmet = require("helmet");
const rateLimit = require("express-rate-limit");
const MongoStore = require("connect-mongo").default;

require("dotenv").config();

const connectDB = require("./config/db");
const passportConfig = require("./config/passport");

const authRoutes = require("./routes/authRoutes");
const gameRoutes = require("./routes/gameRoutes");
const userRoutes = require("./routes/userRoutes");
const adminRoutes = require("./routes/adminRoutes");
const errorMiddleware = require("./middlewares/errorMiddleware");

const app = express();

connectDB();
passportConfig();

let sessionStore;
if (process.env.MONGO_URI) {
  sessionStore = MongoStore.create({
    mongoUrl: process.env.MONGO_URI,
    crypto: {
      secret: process.env.SESSION_SECRET || "xoarena-dev-secret",
    },
  });

  sessionStore.on("error", (error) => {
    console.error("Session store error:", error.message);
  });
}

app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

app.set("trust proxy", 1);
app.use(
  helmet({
    contentSecurityPolicy: false,
  }),
);
app.use(
  rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 300,
    standardHeaders: true,
    legacyHeaders: false,
  }),
);
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(cookieParser());
app.use((req, res, next) => {
  const clean = (value) => {
    if (!value || typeof value !== "object") return;
    Object.keys(value).forEach((key) => {
      if (key.startsWith("$") || key.includes(".")) {
        delete value[key];
      } else {
        clean(value[key]);
      }
    });
  };

  clean(req.body);
  clean(req.params);
  next();
});
app.use(express.static(path.join(__dirname, "public")));

app.use(
  session({
    secret: process.env.SESSION_SECRET || "xoarena-dev-secret",
    resave: false,
    saveUninitialized: false,
    store: sessionStore,
    cookie: {
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      maxAge: 1000 * 60 * 60 * 24 * 7,
    },
  }),
);

app.use(flash());
app.use(passport.initialize());
app.use(passport.session());

app.use((req, res, next) => {
  res.locals.currentUser = req.user;
  res.locals.guestUser = req.session.guestUser;
  res.locals.currentPlayer = req.user || req.session.guestUser;
  res.locals.success = req.flash("success");
  res.locals.error = req.flash("error");
  next();
});

app.get("/healthz", (req, res) => {
  res.status(200).json({
    status: "ok",
    uptime: process.uptime(),
  });
});

app.use("/", authRoutes);
app.use("/", gameRoutes);
app.use("/", userRoutes);
app.use("/", adminRoutes);

app.use(errorMiddleware);

module.exports = app;
