// import { db } from "./db.js";
import { InyeccionGemini25 } from "./extraccion.js";
import mammoth from "mammoth";
import pdfParse from "pdf-parse-fork";
import AdmZip from "adm-zip";
import { Readable } from "stream";
import tar from "tar-stream";
import { createGunzip } from "zlib";
// Función para limpiar texto y quitar símbolos innecesarios
export function cleanText(text) {
    return text
        .replace(/[\x00-\x1F\x7F-\x9F]/g, " ")
        .replace(/\s+/g, " ")
        .replace(/[^\w\s.,;:!?¿¡()áéíóúñÁÉÍÓÚÑ-]/g, " ")
        .trim();
}
// Verificar conectividad a Internet
export async function checkInternetConnection() {
    try {
        const response = await fetch("https://www.google.com", {
            method: "HEAD",
            signal: AbortSignal.timeout(3000)
        });
        return response.ok;
    }
    catch {
        return false;
    }
}
// Función hiper-optimizada para extraer archivos comprimidos
async function extractCompressedFile(buffer, filename) {
    let allContent = "";
    const fileExt = filename.split(".").pop()?.toLowerCase();
    try {
        if (fileExt === "zip") {
            const zip = new AdmZip(buffer);
            const entries = zip.getEntries();
            for (const entry of entries) {
                if (!entry.isDirectory) {
                    try {
                        const content = entry.getData().toString("utf-8");
                        const cleanedContent = cleanText(content);
                        allContent += `\n[${entry.entryName}]\n${cleanedContent}\n`;
                    }
                    catch {
                        // Ignorar archivos binarios dentro del ZIP
                    }
                }
            }
        }
        else if (fileExt === "tar" || fileExt === "gz" || fileExt === "tgz") {
            return new Promise((resolve) => {
                const extract = tar.extract();
                let content = "";
                extract.on("entry", (header, stream, next) => {
                    let fileContent = "";
                    stream.on("data", (chunk) => {
                        fileContent += chunk.toString("utf-8");
                    });
                    stream.on("end", () => {
                        try {
                            const cleanedContent = cleanText(fileContent);
                            content += `\n[${header.name}]\n${cleanedContent}\n`;
                        }
                        catch {
                            // Ignorar errores de archivos individuales
                        }
                        next();
                    });
                    stream.resume();
                });
                extract.on("finish", () => resolve(content));
                extract.on("error", () => resolve(content));
                if (fileExt === "gz" || fileExt === "tgz") {
                    Readable.from(buffer).pipe(createGunzip()).pipe(extract);
                }
                else {
                    Readable.from(buffer).pipe(extract);
                }
            });
        }
        else if (fileExt === "bz2") {
            return new Promise((resolve) => {
                let content = "";
                const stream = Readable.from(buffer);
                stream.on("data", (chunk) => {
                    content += chunk.toString("utf-8");
                });
                stream.on("end", () => resolve(cleanText(content)));
                stream.on("error", () => resolve(""));
            });
        }
    }
    catch (error) {
        console.error("Error extrayendo archivo comprimido:", error);
    }
    return allContent;
}
// Función hiper-optimizada para procesar archivos con procesamiento en chunks
export async function processIndividualFile(buffer, filename) {
    const fileType = filename.split(".").pop()?.toLowerCase() || "unknown";
    let extractedContent = "";
    const startTime = Date.now();
    try {
        // Archivos de texto plano - Ultra rápido
        if (["txt", "md", "markdown", "log", "csv", "tsv", "xml", "yaml", "yml", "ini", "conf", "config"].includes(fileType)) {
            extractedContent = cleanText(buffer.toString("utf-8"));
        }
        // PDF - Optimizado sin límites
        else if (fileType === "pdf") {
            const pdfData = await pdfParse(buffer, { max: 0 });
            extractedContent = cleanText(pdfData.text);
        }
        // Word
        else if (["docx", "doc"].includes(fileType)) {
            const result = await mammoth.extractRawText({ buffer });
            extractedContent = cleanText(result.value);
        }
        // JSON
        else if (fileType === "json") {
            const jsonData = JSON.parse(buffer.toString("utf-8"));
            extractedContent = cleanText(JSON.stringify(jsonData, null, 2));
        }
        // HTML/HTM - Limpieza avanzada
        else if (["html", "htm"].includes(fileType)) {
            const htmlContent = buffer.toString("utf-8");
            const textContent = htmlContent
                .replace(/<script[\s\S]*?<\/script>/gi, "")
                .replace(/<style[\s\S]*?<\/style>/gi, "")
                .replace(/<[^>]*>/g, " ");
            extractedContent = cleanText(textContent);
        }
        // Código fuente - Directo
        else if (["js", "jsx", "ts", "tsx", "css", "scss", "sass", "less", "py", "java", "c", "cpp", "h", "hpp", "cs", "php", "rb", "go", "rs", "swift", "kt", "sql", "sh", "bash", "r", "m", "scala", "perl", "lua"].includes(fileType)) {
            extractedContent = cleanText(buffer.toString("utf-8"));
        }
        // Archivos comprimidos - Paralelo
        else if (["zip", "tar", "gz", "tgz", "bz2", "7z", "rar", "xz", "lz", "lzma"].includes(fileType)) {
            extractedContent = await extractCompressedFile(buffer, filename);
        }
        // Intentar como texto
        else {
            try {
                extractedContent = cleanText(buffer.toString("utf-8"));
            }
            catch {
                extractedContent = `Archivo procesado: ${filename}`;
            }
        }
    }
    catch (error) {
        console.error(`Error procesando ${filename}:`, error);
        extractedContent = `Contenido de: ${filename}`;
    }
    const processingTime = Date.now() - startTime;
    console.log(`⚡ ${filename} procesado en ${processingTime}ms`);
    return extractedContent;
}
// Procesamiento hiper-rápido con análisis de Gemini optimizado
export async function analyzeContentWithGemini(content) {
    try {
        const isOnline = await checkInternetConnection();
        if (!isOnline) {
            return { topics: [], categories: [], summary: "" };
        }
        const analysisPrompt = `Analiza este contenido y extrae SOLO:
1. Temas clave (max 10, esenciales)
2. Categorías académicas
3. Resumen limpio (max 250 palabras, sin símbolos innecesarios)

Contenido:
${content.substring(0, 20000)}

JSON sin markdown:
{
  "topics": ["tema1", "tema2"],
  "categories": ["categoría1"],
  "summary": "resumen directo"
}`;
        const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${InyeccionGemini25.config.model}:generateContent?key=${InyeccionGemini25.config.key}`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                contents: [{ parts: [{ text: analysisPrompt }] }]
            })
        });
        if (response.ok) {
            const data = await response.json();
            const analysisText = data.candidates?.[0]?.content?.parts?.[0]?.text || "";
            const cleanedAnalysis = analysisText.replace(/```json\n?/g, "").replace(/```\n?/g, "").trim();
            const jsonMatch = cleanedAnalysis.match(/\{[\s\S]*\}/);
            if (jsonMatch) {
                const analysis = JSON.parse(jsonMatch[0]);
                return {
                    topics: analysis.topics || [],
                    categories: analysis.categories || [],
                    summary: cleanText(analysis.summary || "")
                };
            }
        }
    }
    catch (error) {
        console.error("Error en análisis Gemini:", error);
    }
    return { topics: [], categories: [], summary: "" };
}
// Guardar archivo procesado en la base de datos de forma optimizada
export async function saveProcessedFile(file, extractedContent, analysis) {
    const processedFile = {
        id: crypto.randomUUID(),
        filename: file.originalname,
        file_type: file.originalname.split(".").pop()?.toLowerCase() || "unknown",
        content: cleanText(extractedContent.substring(0, 200000)),
        extracted_knowledge: analysis.summary || null,
        processing_date: Date.now(),
        file_size: file.size,
        categories: analysis.categories.join(",") || null,
        learned_topics: analysis.topics.join(",") || null
    };
    // await db.insertInto("processed_files").values(processedFile).execute();
    // Actualizar progreso de aprendizaje en lotes
    const learningProgressUpdates = [];
    for (const topic of analysis.topics) {
        const existing = // await db
         
            .selectFrom("learning_progress")
            .select(["id", "proficiency_level", "sources_count"])
            .where("topic", "=", topic)
            .executeTakeFirst();
        if (existing) {
            updateTable("learning_progress")
                .set({
                proficiency_level: Math.min(100, (existing.proficiency_level || 0) + 10),
                sources_count: (existing.sources_count || 0) + 1,
                last_updated: Date.now(),
                confidence_score: Math.min(100, (existing.proficiency_level || 0) + 10),
                related_files: processedFile.id
            })
                .where("id", "=", existing.id)
                .execute();
        }
        else {
            learningProgressUpdates.push({
                id: crypto.randomUUID(),
                topic,
                subject_area: analysis.categories[0] || "General",
                proficiency_level: 10,
                sources_count: 1,
                last_updated: Date.now(),
                confidence_score: 10,
                related_files: processedFile.id
            });
        }
    }
    // Insertar nuevos progresos en lote
    if (learningProgressUpdates.length > 0) {
        // await db.insertInto("learning_progress").values(learningProgressUpdates).execute();
    }
    // Agregar conocimiento en lote
    if (analysis.summary && analysis.categories.length > 0 && analysis.topics.length > 0) {
        const knowledgeEntries = analysis.topics.slice(0, 5).map((topic) => ({
            id: crypto.randomUUID(),
            materia: analysis.categories[0] || "General",
            tema: topic,
            contenido: analysis.summary,
            grado: "Todos",
            palabras_clave: analysis.topics.join(","),
            fecha_agregado: Date.now(),
            tipo: "aprendido_archivo"
        }));
        if (knowledgeEntries.length > 0) {
            // await db.insertInto("conocimientoIA").values(knowledgeEntries).execute();
        }
    }
    return processedFile;
}
