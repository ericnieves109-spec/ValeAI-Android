import * as React from "react";
import { Progress } from "../components/ui/progress";

interface LoadingScreenProps {
  progress: number;
  total: number;
}

export function LoadingScreen({ progress, total }: LoadingScreenProps) {
  const percentage = total > 0 ? Math.round((progress / total) * 100) : 0;

  return (
    <div className="min-h-screen bg-black flex items-center justify-center p-4">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center space-y-4">
          <div className="flex items-center justify-center space-x-3">
            <div className="w-12 h-12 bg-red-600 rounded-lg flex items-center justify-center">
              <span className="text-2xl font-bold text-white">V</span>
            </div>
            <h1 className="text-4xl font-bold text-white">ValeAI</h1>
          </div>
          
          <p className="text-gray-400 text-sm">
            Asistente Académico INEM Kennedy
          </p>
        </div>

        <div className="space-y-4">
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-gray-400">Cargando contenido académico...</span>
              <span className="text-red-500 font-mono">{percentage}%</span>
            </div>
            <Progress value={percentage} className="h-2" />
          </div>

          <div className="text-center space-y-1">
            <p className="text-xs text-gray-500 font-mono">
              {progress} / {total} archivos
            </p>
            <p className="text-xs text-gray-600">
              Configurando modo offline permanente
            </p>
          </div>
        </div>

        <div className="border border-red-900 rounded-lg p-4 space-y-2 bg-red-950/20">
          <div className="flex items-center space-x-2">
            <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
            <p className="text-xs text-red-400 font-medium">
              Transferencia única en proceso
            </p>
          </div>
          <p className="text-xs text-gray-500 leading-relaxed">
            Este proceso se ejecuta solo una vez. Todo el contenido multimedia 
            se almacenará en tu dispositivo para acceso offline completo.
          </p>
        </div>
      </div>
    </div>
  );
}
