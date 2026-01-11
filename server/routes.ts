import { Router } from "express";
import { db } from "./db";
import { v4 as uuidv4 } from "uuid";

const router = Router();

// Get all knowledge
router.get("/api/conocimiento", async (req, res) => {
  try {
    const conocimiento = await db
      .selectFrom("conocimientoIA")
      .selectAll()
      .orderBy("fecha_agregado", "desc")
      .execute();
    
    console.log(`Retrieved ${conocimiento.length} knowledge entries`);
    res.json(conocimiento);
  } catch (error) {
    console.error("Error fetching knowledge:", error);
    res.status(500).json({ error: "Error al obtener conocimiento" });
  }
});

// Add new knowledge
router.post("/api/conocimiento", async (req, res) => {
  try {
    const { materia, tema, contenido, grado, palabras_clave } = req.body;
    
    if (!materia || !tema || !contenido || !grado) {
      res.status(400).json({ error: "Todos los campos son requeridos" });
      return;
    }

    const id = uuidv4();
    const fecha_agregado = Date.now();

    await db
      .insertInto("conocimientoIA")
      .values({
        id,
        materia,
        tema,
        contenido,
        grado,
        palabras_clave: Array.isArray(palabras_clave) ? palabras_clave.join(",") : palabras_clave || "",
        fecha_agregado,
        tipo: "manual"
      })
      .execute();

    console.log(`Added new knowledge: ${tema} (${materia})`);
    res.json({ id, success: true });
  } catch (error) {
    console.error("Error adding knowledge:", error);
    res.status(500).json({ error: "Error al agregar conocimiento" });
  }
});

// Delete knowledge
router.delete("/api/conocimiento/:id", async (req, res) => {
  try {
    const { id } = req.params;

    await db
      .deleteFrom("conocimientoIA")
      .where("id", "=", id)
      .execute();

    console.log(`Deleted knowledge entry: ${id}`);
    res.json({ success: true });
  } catch (error) {
    console.error("Error deleting knowledge:", error);
    res.status(500).json({ error: "Error al eliminar conocimiento" });
  }
});

// Search knowledge
router.get("/api/conocimiento/buscar", async (req, res) => {
  try {
    const { q } = req.query;
    
    if (!q || typeof q !== "string") {
      res.status(400).json({ error: "Query parameter required" });
      return;
    }

    const query = q.toLowerCase();

    const resultados = await db
      .selectFrom("conocimientoIA")
      .selectAll()
      .execute();

    const filtered = resultados.filter((item) => {
      return (
        item.tema.toLowerCase().includes(query) ||
        item.contenido.toLowerCase().includes(query) ||
        item.materia.toLowerCase().includes(query) ||
        item.palabras_clave.toLowerCase().includes(query)
      );
    });

    console.log(`Search for "${q}" returned ${filtered.length} results`);
    res.json(filtered);
  } catch (error) {
    console.error("Error searching knowledge:", error);
    res.status(500).json({ error: "Error al buscar conocimiento" });
  }
});

// Save conversation for learning
router.post("/api/conversaciones", async (req, res) => {
  try {
    const { pregunta, respuesta, contexto, imagen_url } = req.body;

    const id = uuidv4();
    const fecha = Date.now();

    await db
      .insertInto("conversaciones")
      .values({
        id,
        pregunta,
        respuesta,
        contexto: contexto || null,
        imagen_url: imagen_url || null,
        fecha,
        util: 1
      })
      .execute();

    console.log(`Saved conversation: ${pregunta.substring(0, 50)}...`);
    res.json({ id, success: true });
  } catch (error) {
    console.error("Error saving conversation:", error);
    res.status(500).json({ error: "Error al guardar conversación" });
  }
});

// Get conversation history
router.get("/api/conversaciones", async (req, res) => {
  try {
    const conversaciones = await db
      .selectFrom("conversaciones")
      .selectAll()
      .orderBy("fecha", "desc")
      .limit(100)
      .execute();

    console.log(`Retrieved ${conversaciones.length} conversations`);
    res.json(conversaciones);
  } catch (error) {
    console.error("Error fetching conversations:", error);
    res.status(500).json({ error: "Error al obtener conversaciones" });
  }
});

export default router;
