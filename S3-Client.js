const express = require("express");
const cors = require('cors');
const multer = require('multer');
const multerS3 = require('multer-s3')
const AWS = require('aws-sdk')
require('dotenv').config();

const app = express()

const s3 = new AWS.S3({
    accessKeyId: process.env.ACCESSKEY, // Fix key names
    secretAccessKey: process.env.ACCESSSECURITYKEY,
    region: process.env.REGION
});

const BUCKET = process.env.BUCKET;

const upload = multer({
    storage: multerS3({
      s3: s3,
      bucket: BUCKET,
      key: (req, file, cb) => {
        cb(null, `uploads/${Date.now()}-${file.originalname}`); 
      },
    }),
  });
  
  app.post("/upload", upload.single("file"), (req, res) => {
    if (!req.file) {
      return res.status(400).send("No file uploaded.");
    }
    res.send({
      message: "File uploaded successfully!",
      fileUrl: req.file.location, 
    });
  });

app.get('/list', async (req, res) => {
    try {
        const read = await s3.listObjectsV2({ Bucket: BUCKET }).promise();
        const R = read.Contents.map((item) => item.Key);
        res.send(R);
    } catch (error) {
        console.log("Error fetching S3 objects:", error);
        res.status(500).send("Error fetching S3 objects");
    }
});

app.listen(3001, () => {
    console.log("Server running on port 3001");
});