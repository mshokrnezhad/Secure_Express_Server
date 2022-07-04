const path = require("path");
const express = require("express");
const PORT = 8000;
const app = express();

app.get("/", (req, res) => {
    res.sendFile(path.join(__dirname, "public", "index.html"));
});

app.get("/secret", (req, res) => {
    return res.send("your personal secret value is 42!");
});

app.listen(PORT, () => {
    console.log(`listening on port ${PORT}`);
});