const express = require("express");

const app = express();
const port = process.env.PORT || 8000;

app.get("/test", (req, res) => {
    res.send({ status: "ok" });
});

app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});