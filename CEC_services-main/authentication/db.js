const mongoose = require("mongoose");

function connectDB() {
    console.log("Connecting to DB...");
    return mongoose.connect("mongodb://db-service:27017/ecommerce");
}

module.exports = connectDB;
