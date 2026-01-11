import * as React from "react";

interface HeaderProps {
  contentCount: number;
  mediaCount: number;
}

export function Header({ contentCount, mediaCount }: HeaderProps) {
  return (
    <header className="border-b border-zinc-800 bg-black/50 backdrop-blur-sm sticky top-0 z-10">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-red-600 rounded-lg flex items-center justify-center">
              <span className="text-xl font-bold text-white">V</span>
            </div>
            <div>
              <h1 className="text-xl font-bold text-white">ValeAI</h1>
              <p className="text-xs text-gray-500">Modo Offline</p>
            </div>
          </div>

          <div className="flex items-center space-x-4 text-xs">
            <div className="text-right">
              <p className="text-gray-500">Contenido académico</p>
              <p className="text-white font-mono">{contentCount} artículos</p>
            </div>
            <div className="text-right">
              <p className="text-gray-500">Archivos multimedia</p>
              <p className="text-white font-mono">{mediaCount} archivos</p>
            </div>
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
          </div>
        </div>
      </div>
    </header>
  );
}
