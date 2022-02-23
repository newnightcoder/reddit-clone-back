import multer from "multer";

const MIME_TYPES = {
  "image/jpg": "jpg",
  "image/jpeg": "jpg",
  "image/png": "png",
};

const picStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "userpics/");
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1e3)}`;
    const extension = MIME_TYPES[file.mimetype];
    cb(null, `${file.fieldname}-${uniqueSuffix}.${extension}`);
  },
});

export const upload = multer({ storage: picStorage }).single("image");
