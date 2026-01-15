import { Kysely, SqliteDialect } from "kysely";
import SQLite from "better-sqlite3";
import path from "path";

const DATA_DIR = process.env.DATA_DIRECTORY || path.join(process.cwd(), "data");
const dbPath = path.join(DATA_DIR, "database.sqlite");

interface ConocimientoIA {
  id: string;
  materia: string;
  tema: string;
  contenido: string;
  grado: string;
  palabras_clave: string;
  fecha_agregado: number;
  tipo: string;
}

interface Conversacion {
  id: string;
  pregunta: string;
  respuesta: string;
  contexto: string | null;
  imagen_url: string | null;
  fecha: number;
  util: number;
}

interface ChatSession {
  id: string;
  title: string;
  created_at: number;
  updated_at: number;
  message_count: number;
}

interface ChatMessage {
  id: string;
  session_id: string;
  type: string;
  content: string;
  image_url: string | null;
  timestamp: number;
}

interface GeneratedImage {
  id: string;
  prompt: string;
  image_data: string;
  created_at: number;
  related_topic: string | null;
  size: string;
}

interface ProcessedFile {
  id: string;
  filename: string;
  file_type: string;
  content: string;
  extracted_knowledge: string | null;
  processing_date: number;
  file_size: number;
  categories: string | null;
  learned_topics: string | null;
}

interface LearningProgress {
  id: string;
  topic: string;
  subject_area: string;
  proficiency_level: number;
  sources_count: number;
  last_updated: number;
  confidence_score: number;
  related_files: string | null;
}

interface Database {
  conocimientoIA: ConocimientoIA;
  conversaciones: Conversacion;
  chat_sessions: ChatSession;
  chat_messages: ChatMessage;
  generated_images: GeneratedImage;
  processed_files: ProcessedFile;
  learning_progress: LearningProgress;
}

const sqliteDb = new SQLite(dbPath);

export const db = new Kysely<Database>({
  dialect: new SqliteDialect({ database: sqliteDb }),
  log: ["query", "error"]
});
