const path = require("path");
const fs = require("fs");
const express = require("express");
const https = require("https");
const helmet = require("helmet");
const passport = require("passport");
const { Strategy } = require("passport-google-oauth20");
const cookieSession = require("cookie-session");
require("dotenv").config();

const PORT = 3000;
const CONFIG = {
    CLIENT_ID: process.env.CLIENT_ID,
    CLIENT_SECRET: process.env.CLIENT_SECRET,
    COOKIE_KEY_1: process.env.COOKIE_KEY_1,
    COOKIE_KEY_2: process.env.COOKIE_KEY_2
};
const OAUTH_OPTIONS = {
    callbackURL: "/auth/google/callback",
    clientID: CONFIG.CLIENT_ID,
    clientSecret: CONFIG.CLIENT_SECRET
};

function verifyCallback(accessToken, refreshToken, profile, done) {
    console.log("google profile:", profile);
    done(null, profile);
};

passport.use(new Strategy(OAUTH_OPTIONS, verifyCallback));
passport.serializeUser((user, done) => {
    done(null, user.id);
});
passport.deserializeUser((id, done) => {
    done(null, id);
});

const app = express();

app.use(helmet());
app.use(cookieSession({
    name: "session",
    maxAge: 24 * 60 * 60 * 1000,
    keys: [CONFIG.COOKIE_KEY_1, CONFIG.COOKIE_KEY_2]
}));
app.use(passport.initialize());
app.use(passport.session());

function checkLoggedIn(req, res, next) {
    const isLoggedIn = req.isAuthentica && req.user;

    if (!isLoggedIn) {
        return res.status(401).json({
            error: "first log in!"
        });
    }

    next();
};

app.get("/auth/google", passport.authenticate("google", {
    scope: ["email"]
}));

app.get("/auth/google/callback",
    passport.authenticate("google", {
        failureRedirect: "/failure",
        successRedirect: "/",
        session: true
    }),
    (req, res) => {
        console.log("google called us back!");
    }
);

app.get("/auth/logout", (req, res) => {
    req.logOut();
    return res.redirect("/");
});

app.get("/secret", checkLoggedIn, (req, res) => {
    return res.send("your personal secret value is 42!");
});

app.get("/", (req, res) => {
    return res.sendFile(path.join(__dirname, "public", "index.html"));
});

app.get("/failure", (req, res) => {
    return res.send("failed to log in!");
});

/* app.listen(PORT, () => {
    console.log(`listening on port ${PORT}`);
}); */

https.createServer({
    key: fs.readFileSync("key.pem"),
    cert: fs.readFileSync("cert.pem")
}, app).listen(PORT, () => {
    console.log(`listening on port ${PORT}`);
});