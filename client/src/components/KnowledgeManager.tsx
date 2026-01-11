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
