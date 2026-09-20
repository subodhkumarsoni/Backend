
const { MongoClient } = require("mongodb");

const url = process.env.MONGO_URL;
const client = new MongoClient(url);

async function connectDB() {
    await client.connect();
    console.log("MongoDB connected");

    return client.db("project_01");
}

module.exports = connectDB;