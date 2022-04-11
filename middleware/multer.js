import aws from "aws-sdk";
import multer from "multer";
import multerS3 from "multer-s3";

const MIME_TYPES = {
  "image/jpg": "jpg",
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/gif": "gif",
  "image/webP": "webP",
};

const s3 = new aws.S3();

const picStorage = multerS3({
  s3: s3,
  bucket: "forum-s3-bucket",
  metadata: (req, file, cb) => {
    cb(null, { fieldName: file.fieldname });
  },
  key: (req, file, cb) => {
    cb(null, Date.now().toString());
  },
});
// multer.diskStorage({
//   destination: (req, file, cb) => {
//     cb(null, "userpics/");
//   },
//   filename: (req, file, cb) => {
//     const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1e3)}`;
//     const extension = MIME_TYPES[file.mimetype];
//     cb(null, `${file.fieldname}-${uniqueSuffix}.${extension}`);
//   },
// });

export const upload = multer({ storage: picStorage }).single("image");
