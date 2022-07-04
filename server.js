const path = require("path");
const fs = require("fs");
const express = require("express");
const https = require("https");
const helmet = require("helmet");
const PORT = 8000;
const app = express();

app.use(helmet());

app.get("/", (req, res) => {
    res.sendFile(path.join(__dirname, "public", "index.html"));
});

app.get("/secret", (req, res) => {
    return res.send("your personal secret value is 42!");
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

