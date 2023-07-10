import aws from "aws-sdk";
import multer from "multer";
import multerS3 from "multer-s3";

const MIME_TYPES = {
  "image/jpg": "jpg",
  "image/jpeg": "jpeg",
  "image/png": "png",
  "image/gif": "gif",
  "image/webP": "webP",
};

const s3Config = {
  accessKeyId: process.env.MY_AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.MY_AWS_SECRET_ACCESS_KEY,
};

// const s3 = new aws.S3(s3Config);
// config passed to S3 client for cyclic.sh deployment because AWS env variables are reserved for cyclic because the app environment sets its own credentials (cyclic has its own connexion to make to aws S3 and DB)
const s3 = new aws.S3();

const picStorage = multerS3({
  s3: s3,
  bucket: "forum-s3-bucket",
  acl: "public-read",
  metadata: function (req, file, cb) {
    cb(null, { fieldName: file.fieldname });
  },
  key: function (req, file, cb) {
    cb(null, Date.now().toString());
  },
});

export const upload = (req, res, next) => {
  const createUpload = multer({ storage: picStorage }).single("image");
  createUpload(req, res, (err) => {
    if (err instanceof multer.MulterError) {
      console.log("error multer duude!!!!!", err);
    } else if (err) {
      console.log("error upload", err);
    }
    console.log("FILE IN MULTER", req.file);
    next();
  });
};
