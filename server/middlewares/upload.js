import multer from "multer";
import { CloudinaryStorage } from "multer-storage-cloudinary";
import cloudinary from "../config/cloudinary.js";

const storage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: "cityhelp/complaints",
    allowed_formats: ["jpg", "png", "jpeg","heic"],
  },
});

export const upload = multer({ storage });
