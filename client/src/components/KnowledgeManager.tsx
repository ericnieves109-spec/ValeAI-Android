import * as React from "react";
import { Card } from "./ui/card";
import { Input } from "./ui/input";
import { Button } from "./ui/button";
import { Label } from "./ui/label";
import { Trash2, Plus, BookOpen, X, Zap } from "lucide-react";

interface Knowledge {
  id: string;
  materia: string;
  tema: string;
  contenido: string;
  grado: string;
  palabras_clave: string;
  fecha_agregado: number;
  tipo: string;
}

export function KnowledgeManager() {
  const [knowledge, setKnowledge] = React.useState<Knowledge[]>([]);
  const [isAdding, setIsAdding] = React.useState(false);
  const [loading, setLoading] = React.useState(false);
  const [formData, setFormData] = React.useState({
    materia: "",
    tema: "",
    contenido: "",
    grado: "9",
    palabras_clave: ""
  });

  React.useEffect(() => {
    loadKnowledge();
  }, []);

  async function loadKnowledge() {
    try {
      const response = await fetch("/api/knowledge");
      if (response.ok) {
        const data = await response.json();
        setKnowledge(data);
        console.log(`Loaded ${data.length} knowledge entries`);
      }
    } catch (error) {
      console.error("Error loading knowledge:", error);
    }
  }

  async function handleGeminiLoad() {
    setLoading(true);
    try {
      const response = await fetch("/api/gemini/cargar", {
        method: "POST",
        headers: { "Content-Type": "application/json" }
      });
      const result = await response.json();
      console.log("Gemini 2.5 cargado:", result);
      alert("✅ Motor Gemini 2.5 Flash cargado exitosamente");
      loadKnowledge();
    } catch (error) {
      console.error("Error cargando Gemini:", error);
      alert("❌ Error al cargar Gemini 2.5");
    } finally {
      setLoading(false);
    }
  }

  async function handleAddEducationContent() {
    setLoading(true);
    try {
      const educationData = [
        // Modalidades y Especialidades - Rama Industrial
        {
          materia: "Información General",
          tema: "Modalidades - Rama Industrial",
          contenido: "La Rama Industrial del colegio ofrece las siguientes especialidades: Mecatrónica (integración de sistemas mecánicos y electrónicos), Sistemas (Programación y Diseño Web), Dibujo Técnico (Diseño Industrial), Electricidad y Electrónica, y Química Industrial. Estas modalidades preparan a los estudiantes para carreras técnicas y profesionales en el sector industrial.",
          grado: "10",
          palabras_clave: "modalidades, industrial, mecatrónica, sistemas, programación, diseño web, dibujo técnico, electricidad, electrónica, química industrial"
        },
        // Modalidades - Rama de Ciencias y Salud
        {
          materia: "Información General",
          tema: "Modalidades - Rama de Ciencias y Salud",
          contenido: "La Rama de Ciencias y Salud incluye las modalidades de: Salud (preparación para carreras médicas y de enfermería), Gestión Ambiental (estudio de ecosistemas y conservación), y Ciencias Naturales y Matemáticas (enfoque en biología, química, física y matemáticas avanzadas). Estas modalidades preparan estudiantes para carreras universitarias en ciencias de la salud y ciencias exactas.",
          grado: "10",
          palabras_clave: "ciencias, salud, gestión ambiental, ciencias naturales, matemáticas, medicina, biología"
        },
        // Modalidades - Rama de Humanidades y Artes
        {
          materia: "Información General",
          tema: "Modalidades - Rama de Humanidades y Artes",
          contenido: "La Rama de Humanidades y Artes ofrece: Humanidades (Letras y Lenguas con énfasis en literatura, idiomas y comunicación), Educación Artística (especialidades en Música, Artes Plásticas y Danzas), y Educación Física, Recreación y Deporte. Estas modalidades desarrollan habilidades creativas, comunicativas y deportivas.",
          grado: "10",
          palabras_clave: "humanidades, artes, letras, lenguas, música, artes plásticas, danzas, educación física, deporte"
        },
        // Modalidades - Rama Comercial
        {
          materia: "Información General",
          tema: "Modalidades - Rama Comercial",
          contenido: "La Rama Comercial del colegio ofrece la modalidad de Comercio con especialización en Gestión Administrativa y Contable. Los estudiantes aprenden sobre contabilidad, administración de empresas, finanzas, marketing y emprendimiento, preparándose para carreras en el sector empresarial y comercial.",
          grado: "10",
          palabras_clave: "comercio, gestión administrativa, contabilidad, administración, finanzas, emprendimiento, negocios"
        },
        // Área de Matemáticas
        {
          materia: "Matemáticas",
          tema: "Plan de Estudios - Matemáticas",
          contenido: "El área de Matemáticas incluye las siguientes materias: Álgebra (estudio de ecuaciones, polinomios y funciones), Geometría (figuras, áreas, volúmenes y relaciones espaciales), Trigonometría (funciones trigonométricas y sus aplicaciones), Cálculo (límites, derivadas e integrales) y Estadística (probabilidad, análisis de datos y estadística descriptiva e inferencial).",
          grado: "9",
          palabras_clave: "álgebra, geometría, trigonometría, cálculo, estadística, ecuaciones, funciones, probabilidad"
        },
        // Área de Lenguaje
        {
          materia: "Lenguaje",
          tema: "Plan de Estudios - Lenguaje",
          contenido: "El área de Lenguaje comprende: Lengua Castellana (gramática, ortografía, literatura, comprensión lectora y producción textual) e Inglés como segunda lengua (gramática, vocabulario, conversación y comprensión auditiva). En algunas ramas se incluye también Francés como tercera lengua.",
          grado: "9",
          palabras_clave: "lengua castellana, inglés, francés, gramática, literatura, idiomas, comprensión lectora"
        },
        // Área de Ciencias
        {
          materia: "Ciencias",
          tema: "Plan de Estudios - Ciencias Naturales",
          contenido: "El área de Ciencias comprende: Biología (estudio de seres vivos, células, ecosistemas, genética y evolución), Química (estructura atómica, enlaces químicos, reacciones, estequiometría y química orgánica) y Física (mecánica, energía, ondas, termodinámica, electricidad y magnetismo).",
          grado: "9",
          palabras_clave: "biología, química, física, células, átomos, energía, ecosistemas, reacciones químicas"
        },
        // Área de Sociales
        {
          materia: "Ciencias Sociales",
          tema: "Plan de Estudios - Ciencias Sociales",
          contenido: "El área de Ciencias Sociales incluye: Historia (eventos históricos mundiales y colombianos), Geografía (relieve, clima, recursos naturales, geografía física y humana), Democracia y Constitución, Ciencias Políticas (sistemas de gobierno, participación ciudadana) y Economía (conceptos básicos de economía, microeconomía y macroeconomía).",
          grado: "9",
          palabras_clave: "historia, geografía, democracia, política, economía, constitución, sociedad"
        },
        // Área Técnica/Tecnológica
        {
          materia: "Tecnología",
          tema: "Plan de Estudios - Tecnología e Informática",
          contenido: "El área Técnica/Tecnológica incluye: Tecnología (innovación, diseño tecnológico, resolución de problemas) e Informática (programación, ofimática, manejo de software, bases de datos y diseño web). Además, cada modalidad tiene talleres específicos según su especialización (talleres de mecatrónica, programación, diseño, electricidad, etc.).",
          grado: "9",
          palabras_clave: "tecnología, informática, programación, diseño web, ofimática, software, talleres técnicos"
        },
        // Área de Desarrollo Humano
        {
          materia: "Desarrollo Humano",
          tema: "Plan de Estudios - Desarrollo Humano",
          contenido: "El área de Desarrollo Humano comprende: Filosofía (pensamiento crítico, corrientes filosóficas, lógica), Ética y Valores (formación moral, principios éticos, valores ciudadanos), Religión (educación religiosa, espiritualidad, valores cristianos) y Educación Física (deporte, actividad física, salud y bienestar).",
          grado: "9",
          palabras_clave: "filosofía, ética, valores, religión, educación física, deporte, pensamiento crítico"
        }
      ];

      const response = await fetch("/api/knowledge/bulk", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ entries: educationData })
      });

      if (response.ok) {
        const result = await response.json();
        console.log(`Added ${result.count} education entries`);
        alert(`✅ Se agregaron ${result.count} entradas sobre modalidades y materias`);
        loadKnowledge();
      }
    } catch (error) {
      console.error("Error adding education content:", error);
      alert("❌ Error al agregar contenido educativo");
    } finally {
      setLoading(false);
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    try {
      const response = await fetch("/api/knowledge", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData)
      });

      if (response.ok) {
        console.log("Knowledge added successfully");
        setFormData({
          materia: "",
          tema: "",
          contenido: "",
          grado: "9",
          palabras_clave: ""
        });
        setIsAdding(false);
        loadKnowledge();
      }
    } catch (error) {
      console.error("Error adding knowledge:", error);
    }
  }

  async function handleDelete(id: string) {
    if (!confirm("¿Estás seguro de eliminar este conocimiento?")) {
      return;
    }

    try {
      const response = await fetch(`/api/knowledge/${id}`, {
        method: "DELETE"
      });

      if (response.ok) {
        console.log("Knowledge deleted successfully");
        loadKnowledge();
      }
    } catch (error) {
      console.error("Error deleting knowledge:", error);
    }
  }

  return (
    <div className="container mx-auto p-4 max-w-6xl">
      <div className="mb-6 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <BookOpen className="w-8 h-8 text-red-600" />
          <div>
            <h2 className="text-2xl font-bold text-white">Gestor de Conocimiento</h2>
            <p className="text-sm text-gray-400">{knowledge.length} entradas disponibles</p>
          </div>
        </div>

        <div className="flex gap-2">
          <Button
            onClick={handleAddEducationContent}
            disabled={loading}
            className="bg-green-600 hover:bg-green-700 text-white"
          >
            <BookOpen className="w-4 h-4 mr-2" />
            {loading ? "Cargando..." : "Cargar Plan de Estudios"}
          </Button>
          <Button
            onClick={handleGeminiLoad}
            disabled={loading}
            className="bg-red-600 hover:bg-red-700 text-white"
          >
            <Zap className="w-4 h-4 mr-2" />
            {loading ? "Cargando..." : "Cargar Gemini 2.5"}
          </Button>
          <Button
            onClick={() => setIsAdding(!isAdding)}
            className="bg-red-600 hover:bg-red-700 text-white"
          >
            {isAdding ? (
              <>
                <X className="w-4 h-4 mr-2" />
                Cancelar
              </>
            ) : (
              <>
                <Plus className="w-4 h-4 mr-2" />
                Agregar
              </>
            )}
          </Button>
        </div>
      </div>

      {isAdding && (
        <Card className="bg-zinc-900 border-zinc-800 p-6 mb-6">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="materia" className="text-white">Materia</Label>
                <Input
                  id="materia"
                  value={formData.materia}
                  onChange={(e) => setFormData({ ...formData, materia: e.target.value })}
                  placeholder="Matemáticas, Física, Química..."
                  className="bg-zinc-800 border-zinc-700 text-white"
                  required
                />
              </div>

              <div>
                <Label htmlFor="grado" className="text-white">Grado</Label>
                <select
                  id="grado"
                  value={formData.grado}
                  onChange={(e) => setFormData({ ...formData, grado: e.target.value })}
                  className="w-full bg-zinc-800 border border-zinc-700 text-white rounded-md px-3 py-2"
                  required
                >
                  <option value="9">9°</option>
                  <option value="10">10°</option>
                  <option value="11">11°</option>
                </select>
              </div>
            </div>

            <div>
              <Label htmlFor="tema" className="text-white">Tema</Label>
              <Input
                id="tema"
                value={formData.tema}
                onChange={(e) => setFormData({ ...formData, tema: e.target.value })}
                placeholder="Teorema de Pitágoras, Leyes de Newton..."
                className="bg-zinc-800 border-zinc-700 text-white"
                required
              />
            </div>

            <div>
              <Label htmlFor="contenido" className="text-white">Contenido</Label>
              <textarea
                id="contenido"
                value={formData.contenido}
                onChange={(e) => setFormData({ ...formData, contenido: e.target.value })}
                placeholder="Explicación detallada del concepto..."
                className="w-full bg-zinc-800 border border-zinc-700 text-white rounded-md px-3 py-2 min-h-[120px]"
                required
              />
            </div>

            <div>
              <Label htmlFor="palabras_clave" className="text-white">Palabras clave (separadas por coma)</Label>
              <Input
                id="palabras_clave"
                value={formData.palabras_clave}
                onChange={(e) => setFormData({ ...formData, palabras_clave: e.target.value })}
                placeholder="ecuación, triángulo, geometría"
                className="bg-zinc-800 border-zinc-700 text-white"
              />
            </div>

            <Button type="submit" className="w-full bg-red-600 hover:bg-red-700 text-white">
              Guardar Conocimiento
            </Button>
          </form>
        </Card>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {knowledge.map((item) => (
          <Card key={item.id} className="bg-zinc-900 border-zinc-800 p-4 hover:border-red-600 transition-colors">
            <div className="flex justify-between items-start mb-3">
              <div>
                <h3 className="font-bold text-white mb-1">{item.tema}</h3>
                <p className="text-xs text-gray-400">{item.materia} - {item.grado}°</p>
              </div>
              <Button
                onClick={() => handleDelete(item.id)}
                variant="ghost"
                size="sm"
                className="text-red-500 hover:text-red-400 hover:bg-red-900/20"
              >
                <Trash2 className="w-4 h-4" />
              </Button>
            </div>

            <p className="text-sm text-gray-300 mb-3 line-clamp-3">
              {item.contenido}
            </p>

            {item.palabras_clave && (
              <div className="flex flex-wrap gap-1">
                {item.palabras_clave.split(",").slice(0, 4).map((keyword, idx) => (
                  <span
                    key={idx}
                    className="text-xs bg-zinc-800 text-gray-400 px-2 py-1 rounded"
                  >
                    #{keyword.trim()}
                  </span>
                ))}
              </div>
            )}
          </Card>
        ))}
      </div>

      {knowledge.length === 0 && !isAdding && (
        <div className="text-center py-12">
          <BookOpen className="w-16 h-16 text-gray-600 mx-auto mb-4" />
          <p className="text-gray-400 text-lg">No hay conocimiento agregado aún</p>
          <p className="text-gray-500 text-sm">Haz clic en "Agregar Conocimiento" para comenzar</p>
        </div>
      )}
    </div>
  );
}
