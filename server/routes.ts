import { Router } from "express";
import { db } from "./db.js";
import { InyeccionGemini25 } from "./extraccion.js";

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

// Agregar conocimiento masivo
router.post("/api/knowledge/bulk", async (req, res) => {
  try {
    const { entries } = req.body;
    
    const knowledgeEntries = entries.map((entry: any) => ({
      id: crypto.randomUUID(),
      materia: entry.materia,
      tema: entry.tema,
      contenido: entry.contenido,
      grado: entry.grado,
      palabras_clave: entry.palabras_clave,
      fecha_agregado: Date.now(),
      tipo: entry.tipo || "manual"
    }));

    await db.insertInto("conocimientoIA").values(knowledgeEntries).execute();
    res.json({ success: true, count: knowledgeEntries.length });
  } catch (error) {
    console.error("Error adding bulk knowledge:", error);
    res.status(500).json({ error: "Failed to add bulk knowledge" });
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

// Obtener todas las sesiones de chat
router.get("/api/chat/sessions", async (req, res) => {
  try {
    const sessions = await db
      .selectFrom("chat_sessions")
      .selectAll()
      .orderBy("updated_at", "desc")
      .execute();
    res.json(sessions);
  } catch (error) {
    console.error("Error fetching chat sessions:", error);
    res.status(500).json({ error: "Failed to fetch chat sessions" });
  }
  return;
});

// Obtener mensajes de una sesión
router.get("/api/chat/sessions/:id/messages", async (req, res) => {
  try {
    const messages = await db
      .selectFrom("chat_messages")
      .selectAll()
      .where("session_id", "=", req.params.id)
      .orderBy("timestamp", "asc")
      .execute();
    res.json(messages);
  } catch (error) {
    console.error("Error fetching session messages:", error);
    res.status(500).json({ error: "Failed to fetch messages" });
  }
  return;
});

// Eliminar sesión de chat
router.delete("/api/chat/sessions/:id", async (req, res) => {
  try {
    await db.deleteFrom("chat_messages").where("session_id", "=", req.params.id).execute();
    await db.deleteFrom("chat_sessions").where("id", "=", req.params.id).execute();
    res.json({ success: true });
  } catch (error) {
    console.error("Error deleting chat session:", error);
    res.status(500).json({ error: "Failed to delete session" });
  }
  return;
});

// Endpoint para generar imágenes con Gemini
router.post("/api/generate-image", async (req, res) => {
  try {
    const { prompt, relatedTopic } = req.body;
    
    console.log("Generando imagen con prompt:", prompt);
    
    // Verificar conectividad a Internet
    const isOnline = await checkInternetConnection();
    
    if (!isOnline) {
      res.status(503).json({ error: "Se requiere conexión a Internet para generar imágenes" });
      return;
    }
    
    // Usar Gemini para mejorar el prompt y generar una imagen educativa
    const enhancedPromptResponse = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/${InyeccionGemini25.config.model}:generateContent?key=${InyeccionGemini25.config.key}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [{
            parts: [{
              text: `Crea un prompt detallado en inglés para generar una imagen educativa sobre: "${prompt}". El prompt debe ser descriptivo, claro y apropiado para un contexto académico. Devuelve SOLO el prompt mejorado, sin explicaciones adicionales.`
            }]
          }]
        })
      }
    );
    
    if (!enhancedPromptResponse.ok) {
      res.status(500).json({ error: "Error al procesar el prompt" });
      return;
    }
    
    const enhancedData = await enhancedPromptResponse.json();
    const enhancedPrompt = enhancedData.candidates?.[0]?.content?.parts?.[0]?.text || prompt;
    
    console.log("Prompt mejorado:", enhancedPrompt);
    
    // Generar una imagen SVG educativa simple como placeholder
    // En producción, aquí se integraría con un servicio de generación de imágenes real
    const svgImage = generateEducationalSVG(prompt, relatedTopic);
    const base64Image = Buffer.from(svgImage).toString("base64");
    const imageData = `data:image/svg+xml;base64,${base64Image}`;
    
    const generatedImage = {
      id: crypto.randomUUID(),
      prompt: enhancedPrompt,
      image_data: imageData,
      created_at: Date.now(),
      related_topic: relatedTopic || null,
      size: "1024x1024"
    };
    
    // Guardar en la base de datos
    await db.insertInto("generated_images").values(generatedImage).execute();
    
    res.json({ 
      success: true, 
      imageId: generatedImage.id,
      imageData: generatedImage.image_data,
      enhancedPrompt: enhancedPrompt
    });
  } catch (error) {
    console.error("Error generando imagen:", error);
    res.status(500).json({ error: "Error en la generación de imagen" });
  }
  return;
});

// Función para generar SVG educativo
function generateEducationalSVG(topic: string, relatedTopic?: string): string {
  const colors = ["#4F46E5", "#7C3AED", "#EC4899", "#10B981", "#F59E0B"];
  const randomColor = colors[Math.floor(Math.random() * colors.length)];
  
  return `
    <svg width="1024" height="1024" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="grad1" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" style="stop-color:${randomColor};stop-opacity:0.8" />
          <stop offset="100%" style="stop-color:${randomColor};stop-opacity:0.3" />
        </linearGradient>
      </defs>
      <rect width="1024" height="1024" fill="url(#grad1)"/>
      <circle cx="512" cy="300" r="150" fill="white" opacity="0.2"/>
      <circle cx="300" cy="600" r="100" fill="white" opacity="0.15"/>
      <circle cx="750" cy="650" r="120" fill="white" opacity="0.18"/>
      <text x="512" y="480" font-family="Arial, sans-serif" font-size="48" font-weight="bold" 
            fill="white" text-anchor="middle">${topic.substring(0, 30)}</text>
      <text x="512" y="540" font-family="Arial, sans-serif" font-size="24" 
            fill="white" opacity="0.9" text-anchor="middle">${relatedTopic ? relatedTopic.substring(0, 40) : "Imagen educativa"}</text>
      <path d="M 412 600 L 512 650 L 612 600 L 612 700 L 512 750 L 412 700 Z" 
            fill="white" opacity="0.3" stroke="white" stroke-width="2"/>
      <circle cx="512" cy="650" r="15" fill="white"/>
      <text x="512" y="850" font-family="Arial, sans-serif" font-size="18" 
            fill="white" opacity="0.7" text-anchor="middle">Generado por ValeAI</text>
    </svg>
  `;
}

// Obtener imágenes generadas
router.get("/api/generated-images", async (req, res) => {
  try {
    const images = await db
      .selectFrom("generated_images")
      .selectAll()
      .orderBy("created_at", "desc")
      .limit(50)
      .execute();
    res.json(images);
  } catch (error) {
    console.error("Error fetching generated images:", error);
    res.status(500).json({ error: "Failed to fetch images" });
  }
  return;
});

// Verificar conectividad a Internet
async function checkInternetConnection(): Promise<boolean> {
  try {
    const response = await fetch("https://www.google.com", {
      method: "HEAD",
      signal: AbortSignal.timeout(3000)
    });
    return response.ok;
  } catch {
    return false;
  }
}

// Chat con la IA usando Gemini 2.5 (con detección online/offline)
router.post("/api/chat", async (req, res) => {
  try {
    const { message, imageUrl, sessionId } = req.body;
    
    let currentSessionId = sessionId;
    
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
    
    // Verificar si hay Internet disponible
    const isOnline = await checkInternetConnection();
    
    // Usar Gemini 2.5 Flash para generar respuesta (solo si hay Internet)
    let aiResponse = "";
    try {
      if (!isOnline) {
        throw new Error("Sin conexión a Internet - usando modo offline");
      }
      
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
      console.error("Error llamando a Gemini (modo offline activado):", geminiError);
      
      // MODO OFFLINE - Buscar en conocimiento local
      const searchTerms = message.toLowerCase().split(" ");
      const relevantKnowledge = knowledge.filter(k => 
        searchTerms.some(term => 
          k.materia.toLowerCase().includes(term) ||
          k.tema.toLowerCase().includes(term) ||
          k.contenido.toLowerCase().includes(term) ||
          k.palabras_clave.toLowerCase().includes(term)
        )
      );
      
      if (relevantKnowledge.length > 0) {
        // Construir respuesta desde base de conocimiento local
        const topResults = relevantKnowledge.slice(0, 3);
        aiResponse = `📚 **Modo Offline Activado**\n\nEncontré información relevante en mi base de conocimiento:\n\n`;
        
        topResults.forEach((k, idx) => {
          aiResponse += `**${idx + 1}. ${k.tema}** (${k.materia})\n${k.contenido}\n\n`;
        });
        
        aiResponse += `💡 *Nota: Estoy trabajando en modo offline usando mi conocimiento integrado. Para respuestas más detalladas, conecta a Internet.*`;
      } else {
        aiResponse = `🔌 **Modo Offline**\n\nNo encontré información específica sobre "${message}" en mi base de conocimiento local.\n\nPuedes:\n• Conectarte a Internet para obtener información actualizada\n• Agregar este contenido manualmente en el Gestor de Conocimiento\n• Reformular tu pregunta con términos más generales\n\n💪 Estoy aquí para ayudarte cuando tengas conexión.`;
      }
    }
    
    // Guardar en sesión de chat
    if (!currentSessionId) {
      // Crear nueva sesión
      currentSessionId = crypto.randomUUID();
      const sessionTitle = message.length > 50 ? message.substring(0, 50) + "..." : message;
      
      await db.insertInto("chat_sessions").values({
        id: currentSessionId,
        title: sessionTitle,
        created_at: Date.now(),
        updated_at: Date.now(),
        message_count: 2
      }).execute();
    } else {
      // Actualizar sesión existente
      const session = await db
        .selectFrom("chat_sessions")
        .select("message_count")
        .where("id", "=", currentSessionId)
        .executeTakeFirst();
      
      await db
        .updateTable("chat_sessions")
        .set({
          updated_at: Date.now(),
          message_count: (session?.message_count || 0) + 2
        })
        .where("id", "=", currentSessionId)
        .execute();
    }
    
    // Guardar mensajes
    const userMessageId = crypto.randomUUID();
    const assistantMessageId = crypto.randomUUID();
    
    await db.insertInto("chat_messages").values({
      id: userMessageId,
      session_id: currentSessionId,
      type: "user",
      content: message,
      image_url: imageUrl || null,
      timestamp: Date.now()
    }).execute();
    
    await db.insertInto("chat_messages").values({
      id: assistantMessageId,
      session_id: currentSessionId,
      type: "assistant",
      content: aiResponse,
      image_url: null,
      timestamp: Date.now()
    }).execute();
    
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
    
    res.json({ response: aiResponse, conversationId: conversation.id, sessionId: currentSessionId });
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
