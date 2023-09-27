const express = require("express");
const { sensorRouter } = require("./routers/sensorRouter");

const app = express();
const port = process.env.PORT || 8000;

app.get("/test", (req, res) => {
    res.send({ status: "ok" });
});

app.use(sensorRouter);

app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});