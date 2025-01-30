import pdfParse from "pdf-parse";
import fs from "fs";

let pdfContent = null;

export const subirArchivo = async (req, res) => {
    try {
        const file = req.file || { path: process.env.PDF_FILE };
        if (!file) {
            return res.status(400).json({ error: "No se envió ningún archivo" });
        }

        // Leer y extraer el contenido del PDF
        const dataBuffer = fs.readFileSync(file.path);
        const pdfData = await pdfParse(dataBuffer);
        pdfContent = pdfData.text;

        // Si es un archivo subido, elimínalo después de procesarlo
        if (req.file) {
            fs.unlinkSync(file.path);
        }

        res.json({ message: "PDF procesado con éxito", content: pdfContent.substring(0, 200) + "..." });
    } catch (error) {
        console.error('Error al procesar el PDF:', error);
        res.status(500).json({ error: "Error al procesar el PDF: " + error.message });
    }
}

export const chatbot = async (req, res) => {
    const { message } = req.body;

    if (!message) {
        return res.status(400).json({ reply: "No se envió ningún mensaje" });
    }

    if (!pdfContent) {
        return res.status(400).json({ reply: "No se ha cargado ningún PDF aún" });
    }

    try {
        const lowercaseMessage = message.toLowerCase();
        const sections = pdfContent.split(/\n(?=[A-Z][a-z])/);

        const getMethodDetails = (method) => {
            const methodSection = sections.find(section => section.toLowerCase().includes(method.toLowerCase()));
            if (!methodSection) {
                return "No se encontró información sobre este método.";
            }

            const methodDetails = {
                descripcion: '',
                funcionamiento: '',
                ventajas: '',
                desventajas: '',
                aplicaciones: '',
                ejemplos: ''
            };

            const lines = methodSection.split('\n').filter(line => line.trim() !== '');
            let currentCategory = null;

            lines.forEach(line => {
                const lineLower = line.toLowerCase();

                if (lineLower.includes('descripción')) {
                    currentCategory = 'descripcion';
                } else if (lineLower.includes('cómo funciona')) {
                    currentCategory = 'funcionamiento';
                } else if (lineLower.includes('ventajas')) {
                    currentCategory = 'ventajas';
                } else if (lineLower.includes('desventajas')) {
                    currentCategory = 'desventajas';
                } else if (lineLower.includes('aplicaciones')) {
                    currentCategory = 'aplicaciones';
                } else if (lineLower.includes('ejemplos')) {
                    currentCategory = 'ejemplos';
                }

                if (currentCategory) {
                    methodDetails[currentCategory] += ` ${line}`;
                }
            });

            return methodDetails;
        };

        // Buscar método específico
        const requestedMethod = lowercaseMessage.includes('modelado basado en casos') ? 'Modelado Basado en Casos' : null;

        if (requestedMethod) {
            const methodDetails = getMethodDetails(requestedMethod);
            
            let reply;
            if (lowercaseMessage.includes("ventajas")) {
                reply = methodDetails.ventajas.trim() || "No se encontraron ventajas específicas para este método.";
            } else if (lowercaseMessage.includes("desventajas")) {
                reply = methodDetails.desventajas.trim() || "No se encontraron desventajas específicas para este método.";
            } else if (lowercaseMessage.includes("aplicaciones")) {
                reply = methodDetails.aplicaciones.trim() || "No se encontraron aplicaciones específicas para este método.";
            } else if (lowercaseMessage.includes("ejemplos")) {
                reply = methodDetails.ejemplos.trim() || "No se encontraron ejemplos específicos para este método.";
            } else if (lowercaseMessage.includes("cómo funciona")) {
                reply = methodDetails.funcionamiento.trim() || "No se encontró información sobre cómo funciona este método.";
            } else {
                reply = Object.entries(methodDetails)
                    .filter(([_, value]) => value.trim() !== '')
                    .map(([key, value]) => `${key.charAt(0).toUpperCase() + key.slice(1)}: ${value.trim()}`)
                    .join("\n\n");
            }
            return res.json({ reply });
        }

        // Buscar sección relevante si no se encontró un método específico
        const relevantSection = sections.find(section =>
            lowercaseMessage.split(' ').some(word =>
                section.toLowerCase().includes(word)
            )
        );

        if (!relevantSection) {
            return res.json({ reply: "Lo siento, no encontré información relevante en el PDF para responder a tu pregunta." });
        }

        return res.json({ reply: relevantSection.trim() });

    } catch (error) {
        return res.status(500).json({ reply: "Error en el chatbot: " + error.message });
    }
};


