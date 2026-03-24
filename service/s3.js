require('dotenv').config();
const AWS = require('aws-sdk');

const s3 = new AWS.S3({
  accessKeyId: process.env.AWS_ACCESS_KEY,
  secretAccessKey: process.env.AWS_SECRET_KEY,
  region: process.env.AWS_REGION,
});

async function uploadToS3(file) {
  const params = {
    Bucket: process.env.S3_BUCKET,
    Key: `${Date.now()}-${file.originalname}`,
    Body: file.buffer,
    ContentType: file.mimetype,
  };
console.log("Bucket:", process.env.S3_BUCKET);
  const result = await s3.upload(params).promise();
  return result.Location; 
}

module.exports ={
    uploadToS3,
}
