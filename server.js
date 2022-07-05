const path = require("path");
const fs = require("fs");
const express = require("express");
const https = require("https");
const helmet = require("helmet");
const passport = require("passport");
const { Strategy } = require("passport-google-oauth20");
require("dotenv").config();

const PORT = 3000;
const OAUTH_OPTIONS = {
    callbackURL: "/auth/google/callback",
    clientID: process.env.CLIENT_ID,
    clientSecret: process.env.CLIENT_SECRET
};

function verifyCallback(accessToken, refreshToken, profile, done) {
    console.log("google profile:", profile);
    //done(null, profile);
};

passport.use(new Strategy(OAUTH_OPTIONS, verifyCallback));
const app = express();

app.use(helmet());
app.use(passport.initialize());

function checkLoggedIn(req, res, next) {
    const isLoggedIn = true;

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
        session: false
    }),
    (req, res) => {
        console.log("google called us back!");
    }
);

app.get("/auth/logout", (req, res) => {

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