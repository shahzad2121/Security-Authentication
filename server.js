const https = require("https");
const express = require("express");
const path = require("path");
const fs = require("fs");
const { default: helmet } = require("helmet");
const passport = require("passport");
const { Strategy } = require("passport-google-oauth20");


require("dotenv").config();



const config = {
  CLIENT_ID: process.env.CLIENT_ID,
  CLIENT_SECRET: process.env.CLIENT_SECRET,
  COOKIE_KEY_1: process.env.COOKIE_KEY_1,
  COOKIE_KEY_2: process.env.COOKIE_KEY_2,
};

const AUTH_OPTIONS = {
  callbackURL: "/auth/google/callback",
  clientID: config.CLIENT_ID,
  clientSecret: config.CLIENT_SECRET,
};

function verifyCallback(accessToken, refreshToken, profile, done) {
  console.log("Google profile", profile);
  done(null, profile);
}

passport.use(new Strategy(AUTH_OPTIONS, verifyCallback));
const app = express();

app.use(passport.initialize());

app.use(helmet());

function isLoggedIn() {
  const loggedIn = true;

  if (!loggedIn) {
    res.send(404, error("you are not logged in"));
  } else {
    next();
  }
}

app.get(
  "/auth/google",
  passport.authenticate("google", {
    scope: ["email"],
  })
);
app.get(
  "/auth/google/callback",
  passport.authenticate("google", {
    failureRedirect: "/failure",
    successRedirect: "/",
    session: true,
  }),
  (req, res) => {
    console.log("Google called us back!");
  }
);
app.use("/auth/logout", (req, res, next) => {});
app.get("/", (req, res) => {
  return res.sendFile(path.join(__dirname, "public", "index.html"));
});
app.get("/secret", (req, res) => {
  return res.send("you got pranked");
});

https
  .createServer(
    {
      cert: fs.readFileSync("cert.pem"),
      key: fs.readFileSync("key.pem"),
    },
    app
  )
  .listen(3000, () => {
    console.log("listening at port 3000...");
  });
