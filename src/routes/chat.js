import { Router } from "express";
import { subirArchivo, chatbot } from "../controllers/chat.js";
import { errorHandlingFile } from "../middlewares/errors/multerErrorHandler.js";
import multer from "multer";

const router = Router();

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'uploads/')
    },
    filename: function (req, file, cb) {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9)
        cb(null, file.fieldname + '-' + uniqueSuffix + '.pdf')
    }
})

const upload = multer({ storage: storage })

router.post('/upload', upload.single('file'), subirArchivo);
router.post('/chat', chatbot);

export default router;