import multer from "multer";

const picStorage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "/userpics");
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, `${file.fieldname}-${uniqueSuffix}`);
  },
});

export const upload = multer({ storage: picStorage });
