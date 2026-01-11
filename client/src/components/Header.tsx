import * as React from "react";

export function Header() {
  return (
    <header className="border-b border-zinc-800 bg-black/50 backdrop-blur-sm sticky top-0 z-10">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-black rounded-lg flex items-center justify-center border-2 border-zinc-700">
              <span className="text-xl font-bold text-white">V</span>
            </div>
            <div>
              <h1 className="text-xl font-bold text-white">ValeAI</h1>
              <p className="text-xs text-gray-500">Modo Offline</p>
            </div>
          </div>

          <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
        </div>
      </div>
    </header>
  );
}
