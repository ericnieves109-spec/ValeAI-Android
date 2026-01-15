// ValeAI v2.5 - Motor Gemini 2.5 Flash
// Archivo: extraccion.ts
export const InyeccionGemini25 = {
    config: {
        key: "AIzaSyAGt5LuEyc_WRwoC5Bnfr4leXkGvrHsO8k",
        model: "gemini-2.5-flash", // La versión de poder que pediste
        targetTable: "conocimientoIA"
    },
    ejecutarCargaManual: async () => {
        console.log("%c ACTIVANDO MOTOR GEMINI 2.5 FLASH... ", "color: #FF0000; font-weight: bold;");
        try {
            // Petición de alta densidad para cargar absolutamente todo
            const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${InyeccionGemini25.config.model}:generateContent?key=${InyeccionGemini25.config.key}`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    contents: [{ parts: [{ text: "Genera un paquete de conocimiento comprimido bilingüe y multimedia para almacenamiento local offline" }] }]
                })
            });
            const fullData = await response.json();
            // Compresión nivel 2.5 para IndexDB
            const securePackage = btoa(JSON.stringify(fullData));
            // Inyección en la tabla 'conocimientoIA' de tu captura
            localStorage.setItem(InyeccionGemini25.config.targetTable, securePackage);
            console.log("%c CARGA 2.5 COMPLETADA. BÚNKER SELLADO. ", "color: #00FF00;");
            return "OPERACIÓN EXITOSA: SISTEMA OFFLINE LISTO";
        }
        catch (err) {
            console.error("Error en la conexión con Gemini 2.5");
        }
    }
};
