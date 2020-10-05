const express = require("express");
const { join } = require("path");
const nunjucks = require("nunjucks");
const mongoose = require("mongoose");
const { getMain, createMessage, deleteMessage, updateMessage } = require("./controllers/messages.controller.js");

mongoose.connect('mongodb://localhost:27017/test', {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    useCreateIndex: true
});
mongoose.set("debug", true);

mongoose.connection.on("error", (e) => {
    console.error("MongoDB connection error", e);
    process.exit(1);
});

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(join(__dirname, "client")));

nunjucks.configure(join(__dirname, "templates"), {
    autoescape: true,
    express: app,
    watch: true
});

app.get("/", getMain);
app.post("/messages", createMessage);
app.put("/messages/:id", updateMessage);
app.delete("/messages/:id", deleteMessage);

app.listen(3000, () => {
    console.log("Web server start on port 3000.");
});