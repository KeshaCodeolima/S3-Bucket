const express = require("express");
const cors = require('cors');
const AWS = require('aws-sdk');
const fileUpload = require('express-fileupload');
require('dotenv').config();

const app = express();
app.use(cors());

app.use(fileUpload());

const s3 = new AWS.S3({
  accessKeyId: process.env.ACCESSKEY, // Fix key names
  secretAccessKey: process.env.ACCESSSECURITYKEY,
  region: process.env.REGION
});

const BUCKET = process.env.BUCKET;

app.post("/upload", (req, res) => {

  if (!req.files || !req.files.file) {  // Check if req.files and req.files.file exist
    return res.status(400).send("No file uploaded.");
  }

  const file = req.files.file;
  const params = {
    Bucket: process.env.BUCKET,
    Key: `${Date.now()}-${file.name}`, // Correct: Backticks around the expression,
    Body: file.data,
  };

  s3.upload(params, (err, data) => {
    if (err) {
      console.error("Direct Upload Error: ", err);
      return res.status(500).send("upload failed: " + err.message);
    } else {
      console.log("Direct Upload SuccessFully: ", data);
      res.send("File Upload Successfully!" + data.Location);
    }
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

app.get('/delete/:key', (req, res) => {
  const key = req.params.key;
  const params = {
    Bucket: BUCKET,
    Key: key
  };

  s3.deleteObject(params, (err, data) => {
    if (err) {
      console.error("Error Deleting File: ", err);
      res.status(500).send("Error Deleting File: " + err.message);
    } else {
      console.log("File Deleted Successfully:", data);
      res.json("File Deleted Successfully!");
    }
  });
});

app.listen(3001, () => {
  console.log("Server running on port 3001");
});