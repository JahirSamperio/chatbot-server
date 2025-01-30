import multer from "multer";
import { uploadFile } from "../../config/multer-config.js";

const uploadSingleFile = uploadFile.single('file');

const upload = multer({ dest: "uploads/" }); // Carpeta temporal para subir PDFs


export const errorHandlingFile = (req, res, next) => {
    uploadSingleFile(req, res, (err) => {
        if(!req.file) {
            return res.status(400).json({ error: 'No se ha subido ningun archivo'})
        }
        if (err instanceof multer.MulterError) {
            switch(err.code) {
                case 'LIMIT_FILE_SIZE': 
                    return res.status(400).json({ error: 'El archivo excede el tamaño máximo permitido' })
                case 'LIMIT_UNEXPECTED_FILE':
                    return res.status(400).json({ error: 'Número inesperado de archvios'})
                case 'LIMIT_FILE_COUNT':
                    return res.status(400).json({ error: 'Has subido demasiado archivos'})
                default: 
                    return res.status(400).json({ error: err.message });
            }
        }
        if (err) {
            return res.status(400).send({ msg: err.message })
        }
        next();
    });
}