import multer from "multer";
import { FileFilterCallback } from "multer";
import { Request } from "express";
import path from "path";

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/");
  },
  filename: (req, file, cb) => {
    cb(null, `${Date.now()}-${file.originalname}`);
  },
});

const upload = multer({
  storage: storage,
  fileFilter: (
    req: Request,
    file: Express.Multer.File,
    cb: FileFilterCallback
  ) => {
    checkFileType(file, cb);
  },
  limits: { fileSize: 1024 * 1024 * 5 },
});

function checkFileType(
  file: Express.Multer.File,
  cb: FileFilterCallback
): void {
  // Allowed extensions
  const filetypes = /jpeg|jpg|png|gif/;

  // Check extension
  const extname = filetypes.test(path.extname(file.originalname).toLowerCase());

  // Check MIME type
  const mimetype = filetypes.test(file.mimetype);

  if (mimetype && extname) {
    return cb(null, true);
  } else {
    cb(new Error("Error: Images Only!"));
  }
}

export { upload };
