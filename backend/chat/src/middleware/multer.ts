import multer from "multer";
import fs from "fs";
import path from "path";

const storage = multer.memoryStorage();

export const upload=multer({storage: storage, limits: {fileSize: 5 * 1024 * 1024}, fileFilter: (req, file, cb)=>{
    if(file.mimetype.startsWith("image/")){
        cb(null, true);
    }else{
        cb(new Error("Only image files are allowed!"));
    }
}});