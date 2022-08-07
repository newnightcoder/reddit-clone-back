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
