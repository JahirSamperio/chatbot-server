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
        const lowercaseMessage = normalizeText(message);
        const sections = pdfContent.split(/\n(?=[A-Z¿][a-záéíóú]|¿Cómo funciona\?)/);

        const availableMethods = [
            "Modelado basado en conocimiento",
            "Redes Neuronales Artificiales",
            "Lógica Difusa",
            "Algoritmos Genéticos",
            "Modelos de Agentes Inteligentes",
            "Machine Learning (Aprendizaje Automático)",
            "Modelos de Optimización Matemática",
            "Modelos de Sistemas Dinámicos",
            "Modelado Basado en Casos",
            "Modelos de Simulación",
            "Modelos Híbridos"
        ];

        const requestedMethod = availableMethods.find(method =>
            lowercaseMessage.includes(normalizeText(method))
        );



        const getMethodDetails = (method) => {
            const startIndex = sections.findIndex(section => section.toLowerCase().includes(method.toLowerCase()));

            if (startIndex === -1) {
                return "No se encontró información sobre este método.";
            }

            // Tomar la sección actual + algunas posteriores para capturar toda la información relevante
            const methodSection = sections.slice(startIndex, startIndex + 6).join("\n");

            const methodDetails = {
                descripcion: '',
                funcionamiento: '',
                ventajas: '',
                desventajas: '',
                aplicaciones: '',
                ejemplos: '',
                modelo: ''
            };


            const lines = methodSection.split('\n').map(line => line.trim()).filter(line => line !== '');
            let currentCategory = null;

            lines.forEach(line => {
                // Normalizar la línea para quitar acentos y convertir a minúsculas
                const normalizedLine = line
                    .toLowerCase()
                    .normalize("NFD")
                    .replace(/[\u0300-\u036f]/g, ""); // Quitar acentos

                // Eliminar espacios extra y caracteres no alfanuméricos al inicio
                const cleanedLine = normalizedLine.replace(/[^a-z0-9áéíóúüñ]+/g, ' ').trim();

                if (cleanedLine.startsWith('descripcion')) {
                    currentCategory = 'descripcion';
                } else if (cleanedLine.startsWith('como funciona')) {
                    currentCategory = 'funcionamiento';
                } else if (cleanedLine.startsWith('ventajas')) {
                    currentCategory = 'ventajas';
                } else if (cleanedLine.startsWith('desventajas')) {
                    currentCategory = 'desventajas';
                } else if (cleanedLine.startsWith('aplicaciones')) {
                    currentCategory = 'aplicaciones';
                } else if (cleanedLine.startsWith('ejemplos')) {
                    currentCategory = 'ejemplos';
                }

                if (currentCategory) {
                    methodDetails[currentCategory] += ` ${line}`.trim();
                } else {
                    const modeloCompleto = lines
                    const modelo = modeloCompleto.join(', ')
                    methodDetails.modelo = modelo;
                }
            });

            return methodDetails;
        };

        if (requestedMethod) {

            const methodDetails = getMethodDetails(requestedMethod);


            let reply;
            if (lowercaseMessage.includes("ventajas")) {
                reply = methodDetails.ventajas.trim()
                    ? `Aquí tienes algunas ventajas de ${requestedMethod}: ${methodDetails.ventajas.trim()}`
                    : `No encontré ventajas específicas para ${requestedMethod}, pero en general, este método puede tener beneficios dependiendo del contexto en el que se use.`;
            } else if (lowercaseMessage.includes("desventajas")) {
                reply = methodDetails.desventajas.trim()
                    ? `Algunas desventajas de ${requestedMethod} son: ${methodDetails.desventajas.trim()}`
                    : `No encontré desventajas específicas para ${requestedMethod}, pero como todo método, puede tener limitaciones según su aplicación.`;
            } else if (lowercaseMessage.includes("aplicaciones")) {
                reply = methodDetails.aplicaciones.trim()
                    ? `Este método se usa en varios casos, como: ${methodDetails.aplicaciones.trim()}`
                    : `No tengo información exacta sobre las aplicaciones de ${requestedMethod}, pero normalmente se usa en contextos donde se requiere manejar incertidumbre o datos imprecisos.`;
            } else if (lowercaseMessage.includes("ejemplos")) {
                reply = methodDetails.ejemplos.trim()
                    ? `Aquí tienes algunos ejemplos de ${requestedMethod} en acción: ${methodDetails.ejemplos.trim()}`
                    : `No encontré ejemplos específicos, pero si me das más contexto, puedo ayudarte a encontrar algunos casos donde se aplique.`;
            } else if (lowercaseMessage.includes("cómo funciona")) {
                reply = methodDetails.funcionamiento.trim()
                    ? `Así funciona ${requestedMethod}: ${methodDetails.funcionamiento.trim()}`
                    : `No tengo detalles exactos sobre cómo funciona ${requestedMethod}, pero generalmente implica el uso de reglas lógicas y matemáticas para manejar datos inciertos.`;
            } else {
                reply = methodDetails.modelo.trim()
                    ? `Aquí tienes una explicación de ${requestedMethod}: ${methodDetails.modelo.trim()}`
                    : `Parece que no tengo información detallada sobre ${requestedMethod}, pero dime qué necesitas saber y te ayudaré.`;
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
        return res.json({ reply: relevantSection.trim() + 'Sicawn' });

    } catch (error) {
        return res.status(500).json({ reply: "Error en el chatbot: " + error.message });
    }
};

const normalizeText = (text) => {
    return text
        .normalize("NFD") // Descompone los caracteres con acentos en sus partes base
        .replace(/[\u0300-\u036f]/g, "") // Elimina los signos diacríticos (acentos)
        .toLowerCase(); // Convierte el texto a minúsculas
};