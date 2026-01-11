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
    
    // Detectar saludos y conversación casual
    const saludos = ["hola", "hello", "hi", "hey", "buenos días", "buenas tardes", "buenas noches", "qué tal", "cómo estás"];
    const despedidas = ["adiós", "chao", "hasta luego", "nos vemos", "bye", "hasta pronto"];
    const agradecimientos = ["gracias", "thank you", "te agradezco", "muchas gracias"];
    
    const mensajeLower = message.toLowerCase().trim();
    
    // Respuestas con personalidad
    if (saludos.some(s => mensajeLower.includes(s))) {
      const respuestaSaludo = [
        "¡Hola! 😊 Soy ValeAI, tu asistente académico. ¿En qué puedo ayudarte hoy?",
        "¡Hola! Me alegra verte por aquí. ¿Qué tema te gustaría explorar?",
        "¡Hey! 👋 Estoy lista para ayudarte con cualquier duda académica que tengas.",
        "¡Hola! ¿Listo para aprender algo nuevo hoy? Cuéntame qué necesitas."
      ];
      const respuesta = respuestaSaludo[Math.floor(Math.random() * respuestaSaludo.length)];
      res.json({ response: respuesta, conversationId: crypto.randomUUID() });
      return;
    }
    
    if (despedidas.some(d => mensajeLower.includes(d))) {
      const respuestaDespedida = [
        "¡Hasta luego! Fue un placer ayudarte. Vuelve cuando necesites más apoyo. 📚",
        "¡Nos vemos! Espero haberte ayudado. Aquí estaré cuando me necesites. ✨",
        "¡Adiós! Sigue aprendiendo y explorando. ¡Éxito en tus estudios! 🚀"
      ];
      const respuesta = respuestaDespedida[Math.floor(Math.random() * respuestaDespedida.length)];
      res.json({ response: respuesta, conversationId: crypto.randomUUID() });
      return;
    }
    
    if (agradecimientos.some(a => mensajeLower.includes(a))) {
      const respuestaGracias = [
        "¡De nada! Para eso estoy aquí. 😊 ¿Necesitas ayuda con algo más?",
        "¡Con gusto! Me encanta poder ayudarte. ¿Qué más puedo hacer por ti?",
        "¡No hay de qué! Siempre es un placer asistirte en tu aprendizaje. 💡"
      ];
      const respuesta = respuestaGracias[Math.floor(Math.random() * respuestaGracias.length)];
      res.json({ response: respuesta, conversationId: crypto.randomUUID() });
      return;
    }
    
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
      const personalidadPrompt = `Eres ValeAI, una asistente académica amigable, entusiasta y motivadora. Tu objetivo es ayudar a estudiantes a aprender de forma clara y comprensible. 

Características de tu personalidad:
- Amable y cercana, como una amiga que ayuda a estudiar
- Usa emojis ocasionalmente para ser más expresiva (pero sin exagerar)
- Explica conceptos de forma simple antes de profundizar
- Motiva al estudiante con frases positivas
- Si no sabes algo, lo admites con honestidad y ofreces alternativas
- Haces preguntas para asegurarte de que el estudiante entendió

Contexto de conocimiento disponible:
${localContext}

Pregunta del usuario: ${message}

Responde de forma clara, educativa y con tu personalidad característica en español.`;

      const geminiPayload: any = {
        contents: [{
          parts: [{
            text: personalidadPrompt
          }]
        }]
      };

      // Si hay imagen, agregarla al contexto
      if (imageUrl) {
        geminiPayload.contents[0].parts.push({
          inline_data: {
            mime_type: "image/jpeg",
            data: imageUrl.split(",")[1] // Remover el prefijo data:image
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
                   "Hmm, parece que tuve un pequeño problema procesando eso. ¿Podrías intentar preguntármelo de otra forma? 🤔";
    } catch (geminiError) {
      console.error("Error llamando a Gemini:", geminiError);
      
      // Respuesta de fallback con personalidad
      if (localContext.length > 0) {
        aiResponse = `¡Encontré algo en mi base de conocimiento local! 📚\n\nBasándome en lo que sé sobre "${message}", aquí está la información:\n\n${localContext.substring(0, 500)}...\n\n¿Te ayuda esto? Si necesitas más detalles, pregúntame específicamente. 😊`;
      } else {
        aiResponse = `Parece que aún no tengo información sobre "${message}" en mi base de datos. 😅\n\nPero hey, ¡podemos agregarlo juntos! Ve al Gestor de Conocimiento y añade contenido sobre este tema. Así podré ayudarte mejor la próxima vez. 💪`;
      }
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
