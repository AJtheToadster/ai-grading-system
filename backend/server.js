require('dotenv').config();
const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const multer = require('multer');
const { GridFSBucket } = require('mongodb');
const { Readable } = require('stream');

const app = express();
app.use(cors());
app.use(express.json());

// MongoDB Connection
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log("MongoDB Connected"))
  .catch((err) => console.error("MongoDB Connection Error:", err));

const conn = mongoose.connection;

let gridfsBucket;
conn.once('open', () => {
    console.log('MongoDB Connection Open');
    gridfsBucket = new GridFSBucket(conn.db, { bucketName: 'uploads' });
});

// Set up Multer for in-memory storage
const storage = multer.memoryStorage();
const upload = multer({ storage });

// **Custom GridFS Upload Endpoint**
app.post('/upload', upload.array('pdfs', 32), async (req, res) => {
    try {
        if (!req.files || req.files.length === 0) {
            return res.status(400).json({ message: 'No files uploaded' });
        }

        // Store each file in GridFS
        const uploadPromises = req.files.map((file) => {
            return new Promise((resolve, reject) => {
                const readableStream = new Readable();
                readableStream.push(file.buffer);
                readableStream.push(null);

                const uploadStream = gridfsBucket.openUploadStream(file.originalname);
                readableStream.pipe(uploadStream)
                    .on('error', reject)
                    .on('finish', resolve);
            });
        });

        await Promise.all(uploadPromises);
        res.json({ message: 'Essays uploaded successfully' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error uploading files', error: error.message });
    }
});

// **Retrieve all uploaded files**
app.get('/files', async (req, res) => {
    try {
        const files = await conn.db.collection('uploads.files').find().toArray();
        if (!files || files.length === 0) {
            return res.status(404).json({ message: 'No files found' });
        }
        res.json(files);
    } catch (error) {
        res.status(500).json({ message: 'Error retrieving files', error: error.message });
    }
});

// **Retrieve a file by filename**
app.get('/files/:filename', async (req, res) => {
    try {
        const file = await conn.db.collection('uploads.files').findOne({ filename: req.params.filename });

        if (!file) {
            return res.status(404).json({ message: 'File not found' });
        }

        const readstream = gridfsBucket.openDownloadStream(file._id);
        readstream.pipe(res);
    } catch (error) {
        res.status(500).json({ message: 'Error retrieving file', error: error.message });
    }
});

const PORT = process.env.PORT || 5050;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
