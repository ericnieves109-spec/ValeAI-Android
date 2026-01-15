import * as React from "react";
import { Card } from "./ui/card";
import { Button } from "./ui/button";
import { Progress } from "./ui/progress";
import { Upload, FileText, CheckCircle, Brain, TrendingUp } from "lucide-react";

export function FileProcessor() {
  const [files, setFiles] = React.useState<File[]>([]);
  const [processing, setProcessing] = React.useState(false);
  const [progress, setProgress] = React.useState(0);
  const [processedFiles, setProcessedFiles] = React.useState<any[]>([]);
  const [learningStats, setLearningStats] = React.useState<any>(null);
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  React.useEffect(() => {
    loadProcessedFiles();
    loadLearningStats();
  }, []);

  async function loadProcessedFiles() {
    try {
      const response = await fetch("/api/processed-files");
      const data = await response.json();
      setProcessedFiles(data);
    } catch (error) {
      console.error("Error loading processed files:", error);
    }
  }

  async function loadLearningStats() {
    try {
      const response = await fetch("/api/learning-stats");
      const data = await response.json();
      setLearningStats(data);
    } catch (error) {
      console.error("Error loading learning stats:", error);
    }
  }

  function handleFileSelect(e: React.ChangeEvent<HTMLInputElement>) {
    const selectedFiles = Array.from(e.target.files || []);
    setFiles(selectedFiles);
  }

  async function processFiles() {
    if (files.length === 0) {
      return;
    }

    setProcessing(true);
    setProgress(0);

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      const formData = new FormData();
      formData.append("file", file);

      try {
        const response = await fetch("/api/process-file", {
          method: "POST",
          body: formData
        });

        if (response.ok) {
          console.log(`Archivo procesado: ${file.name}`);
        }
      } catch (error) {
        console.error(`Error procesando ${file.name}:`, error);
      }

      setProgress(((i + 1) / files.length) * 100);
    }

    setProcessing(false);
    setFiles([]);
    await loadProcessedFiles();
    await loadLearningStats();
    
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  }

  return (
    <div className="max-w-6xl mx-auto px-4 space-y-6">
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold text-white mb-2">
          Procesador de Archivos con Aprendizaje IA
        </h2>
        <p className="text-gray-400">
          Carga archivos para que ValeAI aprenda y expanda su conocimiento automáticamente
        </p>
      </div>

      {learningStats && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <Card className="bg-zinc-900 border-zinc-800 p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-400">Archivos Procesados</p>
                <p className="text-2xl font-bold text-white">{learningStats.totalFiles}</p>
              </div>
              <FileText className="w-8 h-8 text-blue-500" />
            </div>
          </Card>
          
          <Card className="bg-zinc-900 border-zinc-800 p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-400">Temas Aprendidos</p>
                <p className="text-2xl font-bold text-white">{learningStats.topicsLearned}</p>
              </div>
              <Brain className="w-8 h-8 text-purple-500" />
            </div>
          </Card>
          
          <Card className="bg-zinc-900 border-zinc-800 p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-400">Nivel Promedio</p>
                <p className="text-2xl font-bold text-white">{learningStats.avgProficiency}%</p>
              </div>
              <TrendingUp className="w-8 h-8 text-green-500" />
            </div>
          </Card>
          
          <Card className="bg-zinc-900 border-zinc-800 p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-400">Conocimiento Total</p>
                <p className="text-2xl font-bold text-white">{learningStats.totalKnowledge}</p>
              </div>
              <CheckCircle className="w-8 h-8 text-red-500" />
            </div>
          </Card>
        </div>
      )}

      <Card className="bg-zinc-900 border-zinc-800 p-6">
        <div className="text-center mb-6">
          <div className="inline-block p-4 bg-zinc-800 rounded-full mb-4">
            <Upload className="w-12 h-12 text-red-500" />
          </div>
          <h3 className="text-xl font-bold text-white mb-2">
            Cargar Archivos para Aprendizaje
          </h3>
          <p className="text-gray-400 text-sm">
            Soporta: PDF, TXT, DOCX, MD, HTML, JSON
          </p>
        </div>

        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept=".pdf,.txt,.doc,.docx,.md,.html,.json"
          onChange={handleFileSelect}
          className="hidden"
        />

        <div className="space-y-4">
          {files.length > 0 && (
            <div className="bg-zinc-800 rounded-lg p-4">
              <p className="text-white font-medium mb-2">
                Archivos seleccionados: {files.length}
              </p>
              <div className="space-y-2 max-h-40 overflow-y-auto">
                {files.map((file, idx) => (
                  <div key={idx} className="flex items-center justify-between text-sm">
                    <span className="text-gray-300">{file.name}</span>
                    <span className="text-gray-500">{(file.size / 1024).toFixed(1)} KB</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {processing && (
            <div>
              <Progress value={progress} className="mb-2" />
              <p className="text-center text-gray-400 text-sm">
                Procesando y aprendiendo... {Math.round(progress)}%
              </p>
            </div>
          )}

          <div className="flex gap-4">
            <Button
              onClick={() => fileInputRef.current?.click()}
              disabled={processing}
              className="flex-1 bg-zinc-800 hover:bg-zinc-700"
            >
              Seleccionar Archivos
            </Button>
            
            <Button
              onClick={processFiles}
              disabled={files.length === 0 || processing}
              className="flex-1 bg-red-600 hover:bg-red-700"
            >
              {processing ? "Procesando..." : "Procesar y Aprender"}
            </Button>
          </div>
        </div>
      </Card>

      <Card className="bg-zinc-900 border-zinc-800 p-6">
        <h3 className="text-xl font-bold text-white mb-4">
          Archivos Procesados Recientemente
        </h3>
        
        {processedFiles.length === 0 ? (
          <p className="text-gray-400 text-center py-8">
            No se han procesado archivos aún. Carga algunos para que ValeAI aprenda.
          </p>
        ) : (
          <div className="space-y-2 max-h-96 overflow-y-auto">
            {processedFiles.slice(0, 20).map((file) => (
              <div
                key={file.id}
                className="flex items-center justify-between p-3 bg-zinc-800 rounded-lg hover:bg-zinc-700 transition-colors"
              >
                <div className="flex-1">
                  <p className="text-white font-medium">{file.filename}</p>
                  <div className="flex gap-3 text-xs text-gray-400 mt-1">
                    <span>{file.file_type.toUpperCase()}</span>
                    <span>{(file.file_size / 1024).toFixed(1)} KB</span>
                    <span>{new Date(file.processing_date).toLocaleDateString()}</span>
                  </div>
                  {file.learned_topics && (
                    <div className="flex flex-wrap gap-1 mt-2">
                      {file.learned_topics.split(",").slice(0, 5).map((topic: string, idx: number) => (
                        <span
                          key={idx}
                          className="text-xs bg-red-900/30 text-red-400 px-2 py-1 rounded"
                        >
                          {topic.trim()}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
                <CheckCircle className="w-5 h-5 text-green-500" />
              </div>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
}
