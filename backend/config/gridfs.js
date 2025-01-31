const mongoose = require("mongoose");
const { GridFSBucket } = require("mongodb");

let gridfsBucket;
const conn = mongoose.connection;

conn.once("open", () => {
    console.log("🔗 MongoDB Connection Open");
    gridfsBucket = new GridFSBucket(conn.db, { bucketName: "essays" });
    gridfsBucket = new GridFSBucket(conn.db, { bucketName: "rubrics" });
});

const getGridFSBucket = () => {
    if (!gridfsBucket) throw new Error("GridFSBucket not initialized");
    return gridfsBucket;
};

module.exports = { getGridFSBucket };
