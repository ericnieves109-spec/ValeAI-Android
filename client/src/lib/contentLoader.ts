import { saveContent, saveMedia, AcademicContent, MediaFile } from "./indexedDB";

// Sample academic content for INEM Kennedy grades 9-11
const sampleContent: AcademicContent[] = [
  {
    id: "math-9-1",
    grade: "9",
    subject: "Matemáticas",
    topic: "Ecuaciones Lineales",
    content: "Una ecuación lineal es una igualdad matemática entre dos expresiones algebraicas que involucra una o más variables elevadas a la primera potencia. La forma general es: ax + b = 0, donde 'a' y 'b' son constantes y 'x' es la variable.\n\nPasos para resolver:\n1. Aislar la variable en un lado de la ecuación\n2. Realizar operaciones inversas\n3. Simplificar\n\nEjemplo: 2x + 5 = 13\nSolución:\n2x = 13 - 5\n2x = 8\nx = 4",
    mediaIds: [],
    keywords: ["ecuaciones", "lineales", "álgebra", "matemáticas", "resolver"],
    timestamp: Date.now(),
  },
  {
    id: "phys-10-1",
    grade: "10",
    subject: "Física",
    topic: "Leyes de Newton",
    content: "Las tres leyes de Newton fundamentan la mecánica clásica:\n\n1. Primera Ley (Inercia): Un objeto en reposo permanece en reposo y un objeto en movimiento continúa en movimiento con velocidad constante, a menos que actúe sobre él una fuerza neta.\n\n2. Segunda Ley (F=ma): La fuerza neta sobre un objeto es igual a su masa multiplicada por su aceleración. F = m × a\n\n3. Tercera Ley (Acción-Reacción): Por cada acción hay una reacción igual y opuesta.\n\nEstas leyes explican el movimiento de todos los objetos en nuestro universo cotidiano.",
    mediaIds: [],
    keywords: ["newton", "física", "movimiento", "fuerzas", "mecánica", "inercia"],
    timestamp: Date.now(),
  },
  {
    id: "chem-11-1",
    grade: "11",
    subject: "Química",
    topic: "Tabla Periódica",
    content: "La tabla periódica organiza los elementos químicos según su número atómico, configuración electrónica y propiedades químicas.\n\nEstructura:\n- Períodos: Filas horizontales (1-7)\n- Grupos: Columnas verticales (1-18)\n- Bloques: s, p, d, f según orbitales\n\nClasificación principal:\n- Metales: Buenos conductores, maleables, dúctiles\n- No metales: Malos conductores, quebradizos\n- Metaloides: Propiedades intermedias\n\nGrupos importantes:\n- Grupo 1: Alcalinos (muy reactivos)\n- Grupo 17: Halógenos (muy reactivos)\n- Grupo 18: Gases nobles (inertes)",
    mediaIds: [],
    keywords: ["tabla periódica", "química", "elementos", "metales", "grupos", "períodos"],
    timestamp: Date.now(),
  },
  {
    id: "bio-9-1",
    grade: "9",
    subject: "Biología",
    topic: "La Célula",
    content: "La célula es la unidad básica de la vida. Todos los organismos vivos están compuestos por células.\n\nTipos de células:\n\n1. Procariotas:\n- Sin núcleo definido\n- ADN disperso en citoplasma\n- Ejemplo: Bacterias\n\n2. Eucariotas:\n- Núcleo definido con membrana nuclear\n- Organelos especializados\n- Ejemplo: Células animales y vegetales\n\nPartes principales:\n- Membrana celular: Controla entrada/salida\n- Citoplasma: Medio interno\n- Núcleo: Contiene material genético\n- Mitocondrias: Producen energía\n- Ribosomas: Síntesis de proteínas",
    mediaIds: [],
    keywords: ["célula", "biología", "procariota", "eucariota", "organelos", "membrana"],
    timestamp: Date.now(),
  },
  {
    id: "hist-10-1",
    grade: "10",
    subject: "Historia",
    topic: "Independencia de Colombia",
    content: "El proceso de independencia de Colombia fue un movimiento social y político que liberó al país del dominio español.\n\nFechas clave:\n\n20 de julio de 1810: Grito de Independencia\n- Episodio del florero de Llorente\n- Formación de la Junta Suprema de Gobierno\n\n7 de agosto de 1819: Batalla de Boyacá\n- Victoria definitiva sobre los españoles\n- Comandada por Simón Bolívar\n\nPersonajes importantes:\n- Simón Bolívar: Libertador\n- Francisco de Paula Santander: Hombre de las Leyes\n- Antonio Nariño: Precursor\n- Policarpa Salavarrieta: Heroína\n\nCausas:\n- Influencia de la Ilustración\n- Independencia de Estados Unidos\n- Revolución Francesa\n- Crisis política española",
    mediaIds: [],
    keywords: ["independencia", "colombia", "historia", "bolívar", "boyacá", "1810", "1819"],
    timestamp: Date.now(),
  },
];

export async function loadInitialContent(
  onProgress: (current: number, total: number) => void
): Promise<void> {
  const total = sampleContent.length;

  for (let i = 0; i < sampleContent.length; i++) {
    await saveContent(sampleContent[i]);
    onProgress(i + 1, total);
    // Simulate network delay
    await new Promise((resolve) => setTimeout(resolve, 300));
  }

  console.log(`✓ Loaded ${total} academic content items to IndexedDB`);
}

export async function clearAllData(): Promise<void> {
  const dbRequest = indexedDB.deleteDatabase("ValeAI");
  return new Promise((resolve, reject) => {
    dbRequest.onsuccess = () => {
      console.log("✓ Database cleared");
      resolve();
    };
    dbRequest.onerror = () => reject(dbRequest.error);
  });
}
