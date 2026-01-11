import { Router } from "express";
import { db } from "./db";
import { InyeccionGemini25 } from "./extraccion";

const router = Router();

// Ejecutar carga inicial de Gemini 2.5
router.post("/api/gemini/cargar", async (req, res) => {
  try {
    console.log("Iniciando carga manual de Gemini 2.5 Flash...");
    const result = await InyeccionGemini25.ejecutarCargaManual();
    res.json({ success: true, message: result });
  } catch (error) {
    console.error("Error en carga Gemini:", error);
    res.status(500).json({ error: "Failed to load Gemini data" });
  }
  return;
});

// Obtener todo el conocimiento
router.get("/api/knowledge", async (req, res) => {
  try {
    const knowledge = await db.selectFrom("conocimientoIA").selectAll().execute();
    res.json(knowledge);
  } catch (error) {
    console.error("Error fetching knowledge:", error);
    res.status(500).json({ error: "Failed to fetch knowledge" });
  }
  return;
});

// Agregar nuevo conocimiento
router.post("/api/knowledge", async (req, res) => {
  try {
    const { materia, tema, contenido, grado, palabras_clave, tipo } = req.body;
    
    const newKnowledge = {
      id: crypto.randomUUID(),
      materia,
      tema,
      contenido,
      grado,
      palabras_clave,
      fecha_agregado: Date.now(),
      tipo: tipo || "manual"
    };

    await db.insertInto("conocimientoIA").values(newKnowledge).execute();
    res.json(newKnowledge);
  } catch (error) {
    console.error("Error adding knowledge:", error);
    res.status(500).json({ error: "Failed to add knowledge" });
  }
  return;
});

// Eliminar conocimiento
router.delete("/api/knowledge/:id", async (req, res) => {
  try {
    await db.deleteFrom("conocimientoIA").where("id", "=", req.params.id).execute();
    res.json({ success: true });
  } catch (error) {
    console.error("Error deleting knowledge:", error);
    res.status(500).json({ error: "Failed to delete knowledge" });
  }
  return;
});

// Chat con la IA usando Gemini 2.5
router.post("/api/chat", async (req, res) => {
  try {
    const { message, imageUrl } = req.body;
    
    // Buscar conocimiento relevante en la base de datos local
    const knowledge = await db
      .selectFrom("conocimientoIA")
      .selectAll()
      .execute();
    
    // Construir contexto desde el conocimiento local
    const localContext = knowledge
      .map(k => `${k.materia} - ${k.tema}: ${k.contenido}`)
      .join("\n");
    
    // Usar Gemini 2.5 Flash para generar respuesta
    let aiResponse = "";
    try {
      const geminiPayload: any = {
        contents: [{
          parts: [{
            text: `Contexto de conocimiento:\n${localContext}\n\nPregunta del usuario: ${message}\n\nResponde de forma clara y educativa en español.`
          }]
        }]
      };

      // Si hay imagen, agregarla al contexto
      if (imageUrl) {
        geminiPayload.contents[0].parts.push({
          inline_data: {
            mime_type: "image/jpeg",
            data: imageUrl
          }
        });
      }

      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/${InyeccionGemini25.config.model}:generateContent?key=${InyeccionGemini25.config.key}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(geminiPayload)
        }
      );

      const data = await response.json();
      aiResponse = data.candidates?.[0]?.content?.parts?.[0]?.text || 
                   "Lo siento, no pude procesar tu pregunta en este momento.";
    } catch (geminiError) {
      console.error("Error llamando a Gemini:", geminiError);
      aiResponse = `Basándome en el conocimiento local sobre "${message}", aquí está la información disponible: ${localContext.substring(0, 500)}...`;
    }
    
    // Guardar la conversación para que la IA aprenda
    const conversation = {
      id: crypto.randomUUID(),
      pregunta: message,
      respuesta: aiResponse,
      contexto: localContext,
      imagen_url: imageUrl || null,
      fecha: Date.now(),
      util: 1
    };
    
    await db.insertInto("conversaciones").values(conversation).execute();
    
    res.json({ response: aiResponse, conversationId: conversation.id });
  } catch (error) {
    console.error("Error in chat:", error);
    res.status(500).json({ error: "Failed to process chat" });
  }
  return;
});

// Marcar conversación como útil/no útil (para aprendizaje)
router.patch("/api/chat/:id/feedback", async (req, res) => {
  try {
    const { util } = req.body;
    await db
      .updateTable("conversaciones")
      .set({ util })
      .where("id", "=", req.params.id)
      .execute();
    res.json({ success: true });
  } catch (error) {
    console.error("Error updating feedback:", error);
    res.status(500).json({ error: "Failed to update feedback" });
  }
  return;
});

export default router;
