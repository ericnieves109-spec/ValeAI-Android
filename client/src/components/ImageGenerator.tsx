import * as React from "react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Card } from "./ui/card";
import { Image, Download, Sparkles, Loader2 } from "lucide-react";

interface GeneratedImage {
  id: string;
  prompt: string;
  image_data: string;
  created_at: number;
  related_topic: string | null;
}

export function ImageGenerator() {
  const [prompt, setPrompt] = React.useState("");
  const [isGenerating, setIsGenerating] = React.useState(false);
  const [generatedImages, setGeneratedImages] = React.useState<GeneratedImage[]>([]);
  const [currentImage, setCurrentImage] = React.useState<string | null>(null);

  React.useEffect(() => {
    loadGeneratedImages();
  }, []);

  async function loadGeneratedImages() {
    try {
      const response = await fetch("/api/generated-images");
      const data = await response.json();
      setGeneratedImages(data);
    } catch (error) {
      console.error("Error loading images:", error);
    }
  }

  async function handleGenerateImage() {
    if (!prompt.trim() || isGenerating) {
      return;
    }

    setIsGenerating(true);
    try {
      const response = await fetch("/api/generate-image", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt: prompt.trim() })
      });

      const data = await response.json();

      if (data.success) {
        setCurrentImage(`data:image/png;base64,${data.imageData}`);
        loadGeneratedImages();
        setPrompt("");
      } else {
        alert(data.error || "Error al generar la imagen");
      }
    } catch (error) {
      console.error("Error generating image:", error);
      alert("Error: Asegúrate de tener conexión a Internet para generar imágenes.");
    } finally {
      setIsGenerating(false);
    }
  }

  function handleKeyPress(e: React.KeyboardEvent) {
    if (e.key === "Enter") {
      e.preventDefault();
      handleGenerateImage();
    }
  }

  function downloadImage(imageData: string, prompt: string) {
    const link = document.createElement("a");
    link.href = `data:image/png;base64,${imageData}`;
    link.download = `valeai-${prompt.slice(0, 30).replace(/\s+/g, "-")}.png`;
    link.click();
  }

  return (
    <div className="container mx-auto px-4 max-w-6xl">
      <div className="mb-8">
        <h2 className="text-3xl font-bold text-white mb-2 flex items-center gap-2">
          <Sparkles className="w-8 h-8 text-red-600" />
          Generador de Imágenes IA
        </h2>
        <p className="text-gray-400">
          Crea imágenes educativas usando inteligencia artificial Gemini
        </p>
      </div>

      <Card className="bg-zinc-900 border-zinc-800 p-6 mb-8">
        <div className="space-y-4">
          <div>
            <label className="text-sm text-gray-400 mb-2 block">
              Describe la imagen que quieres generar
            </label>
            <div className="flex gap-2">
              <Input
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Ej: Un átomo de carbono con sus electrones orbitando..."
                disabled={isGenerating}
                className="flex-1 bg-black border-zinc-700 text-white placeholder:text-gray-600"
              />
              <Button
                onClick={handleGenerateImage}
                disabled={isGenerating || !prompt.trim()}
                className="bg-red-600 hover:bg-red-700 text-white px-6"
              >
                {isGenerating ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Generando...
                  </>
                ) : (
                  <>
                    <Image className="w-4 h-4 mr-2" />
                    Generar
                  </>
                )}
              </Button>
            </div>
          </div>

          {currentImage && (
            <div className="mt-6">
              <div className="relative">
                <img
                  src={currentImage}
                  alt="Imagen generada"
                  className="w-full rounded-lg border-2 border-zinc-700"
                />
                <Button
                  onClick={() => downloadImage(currentImage.split(",")[1], prompt)}
                  className="absolute top-4 right-4 bg-black/70 hover:bg-black/90"
                  size="sm"
                >
                  <Download className="w-4 h-4 mr-2" />
                  Descargar
                </Button>
              </div>
            </div>
          )}

          <div className="text-xs text-gray-500 space-y-1">
            <p>💡 Consejos:</p>
            <ul className="list-disc list-inside space-y-1 ml-2">
              <li>Sé específico en tu descripción</li>
              <li>Menciona el estilo si lo deseas (realista, dibujo, esquema, etc.)</li>
              <li>Requiere conexión a Internet</li>
            </ul>
          </div>
        </div>
      </Card>

      <div className="space-y-4">
        <h3 className="text-xl font-bold text-white">Imágenes Generadas Recientemente</h3>
        
        {generatedImages.length === 0 ? (
          <Card className="bg-zinc-900 border-zinc-800 p-8 text-center">
            <Image className="w-12 h-12 text-gray-600 mx-auto mb-4" />
            <p className="text-gray-400">No hay imágenes generadas aún</p>
            <p className="text-sm text-gray-600 mt-2">
              Crea tu primera imagen usando el generador arriba
            </p>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {generatedImages.map((img) => (
              <Card key={img.id} className="bg-zinc-900 border-zinc-800 overflow-hidden">
                <img
                  src={`data:image/png;base64,${img.image_data}`}
                  alt={img.prompt}
                  className="w-full h-48 object-cover"
                />
                <div className="p-4">
                  <p className="text-sm text-gray-300 mb-2 line-clamp-2">
                    {img.prompt}
                  </p>
                  <p className="text-xs text-gray-600 mb-3">
                    {new Date(img.created_at).toLocaleDateString()}
                  </p>
                  <Button
                    onClick={() => downloadImage(img.image_data, img.prompt)}
                    variant="ghost"
                    size="sm"
                    className="w-full text-red-600 hover:text-red-700 hover:bg-zinc-800"
                  >
                    <Download className="w-4 h-4 mr-2" />
                    Descargar
                  </Button>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
