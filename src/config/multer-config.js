import multer from "multer";

const storage = multer.memoryStorage();

// *Filtro para archivos
const pdfFilter = (req, file, cb) => {
    // Tipos MIME permitidos
    if (file.mimetype === 'application/pdf') {
        cb(null, true);
    } else {
        cb(new Error('Solo se aceptan archivos PDF'), false);
    }
};
const uploadFile = multer({
    storage: storage,
    fileFilter: pdfFilter,
    limits: { 
        fileSize: 10 * 1024 * 1024 
    } //Limite de 5 MB
});

export {
    uploadFile
};

