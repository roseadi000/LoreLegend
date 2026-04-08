

const { S3Client, PutObjectCommand } = require("@aws-sdk/client-s3");
const { fromEnv } = require("@aws-sdk/credential-providers");

// Create S3 client using environment variables
const s3 = new S3Client({
  region: process.env.AWS_REGION,
  credentials: fromEnv(), // uses AWS_ACCESS_KEY + AWS_SECRET_KEY automatically
});

async function uploadToS3(file) {
  const key = `${Date.now()}-${file.originalname}`;

  const params = {
    Bucket: process.env.S3_BUCKET,
    Key: key,
    Body: file.buffer,
    ContentType: file.mimetype,
  };

  console.log("Bucket:", process.env.S3_BUCKET);

  const command = new PutObjectCommand(params);
  await s3.send(command);

  // Construct the public URL manually (v3 does not return Location)
  return `https://${process.env.S3_BUCKET}.s3.${process.env.AWS_REGION}.amazonaws.com/${key}`;
}

module.exports = {
  uploadToS3,
};
