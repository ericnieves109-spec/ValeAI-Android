import * as React from "react";
import { ThemeToggle } from "./ThemeToggle";

export function Header() {
  const [isOnline, setIsOnline] = React.useState(navigator.onLine);

  React.useEffect(() => {
    function handleOnline() {
      setIsOnline(true);
    }

    function handleOffline() {
      setIsOnline(false);
    }

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, []);

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
              <p className="text-xs text-gray-500">Modo sin conexión</p>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <ThemeToggle />
            <div className={`flex items-center gap-2 px-3 py-1 rounded-full text-xs ${
              isOnline 
                ? "bg-green-900/50 text-green-400" 
                : "bg-gray-800/50 text-gray-400"
            }`}>
              <div className={`w-2 h-2 rounded-full ${isOnline ? "bg-green-500 animate-pulse" : "bg-gray-500"}`}></div>
              <span>{isOnline ? "En línea - Gemini AI" : "Sin conexión (Base local)"}</span>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
