let mongoose = require('mongoose');
const redis = require("redis"),
    client = redis.createClient({ "host": "localhost", "port": "6379" });

// MongoDB
mongoose.Promise = global.Promise;
mongoose.connect('mongodb://localhost:27017/chichat');
let db = mongoose.connection;

module.exports = {
    MongoDB: db,
    RedisDB: client
};