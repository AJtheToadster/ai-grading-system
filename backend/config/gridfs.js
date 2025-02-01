const mongoose = require("mongoose");
const { GridFSBucket } = require("mongodb");

let gridfsEssayBucket;
let gridfsRubricBucket;
const conn = mongoose.connection;

conn.once("open", () => {
    console.log("🔗 MongoDB Connection Open");
    gridfsEssayBucket = new GridFSBucket(conn.db, { bucketName: "essays" });
    gridfsRubricBucket = new GridFSBucket(conn.db, { bucketName: "rubrics" });
});

const getGridFSEssayBucket = () => {
    if (!gridfsEssayBucket) throw new Error("GridFS Essay Bucket not initialized");
    return gridfsEssayBucket;
};

const getGridFSRubricBucket = () => {
    if (!gridfsRubricBucket) throw new Error("GridFS Rubric Bucket not initialized");
    return gridfsRubricBucket;
};

module.exports = { getGridFSEssayBucket, getGridFSRubricBucket };
