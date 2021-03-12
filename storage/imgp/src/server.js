const config = require("config.json")("./config.json");
const express = require("express");
const imageproxy = require("./imageproxy");
const profileimage = require("./profileimage");
const app = express();

app.use("/", imageproxy);
app.use("/profileimage", profileimage);

app.listen(8000, () => {
  console.log("Server started on port 8000!");
});
