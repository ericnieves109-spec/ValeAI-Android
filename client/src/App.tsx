import * as React from "react";
import { LoadingScreen } from "./components/LoadingScreen";
import { Header } from "./components/Header";
import { ChatInterface } from "./components/ChatInterface";
import { KnowledgeManager } from "./components/KnowledgeManager";
import { Settings } from "lucide-react";
import { Button } from "./components/ui/button";

function App() {
  const [view, setView] = React.useState<"chat" | "knowledge">("chat");

  return (
    <div className="min-h-screen bg-black flex flex-col">
      <Header />
      
      <div className="border-b border-zinc-800 bg-black/50">
        <div className="container mx-auto px-4 py-2 flex gap-2">
          <Button
            onClick={() => setView("chat")}
            variant={view === "chat" ? "default" : "ghost"}
            className={view === "chat" ? "bg-red-600 hover:bg-red-700" : "text-gray-400 hover:text-white"}
          >
            Chat
          </Button>
          <Button
            onClick={() => setView("knowledge")}
            variant={view === "knowledge" ? "default" : "ghost"}
            className={view === "knowledge" ? "bg-red-600 hover:bg-red-700" : "text-gray-400 hover:text-white"}
          >
            <Settings className="w-4 h-4 mr-2" />
            Gestionar Conocimiento
          </Button>
        </div>
      </div>
      
      <main className="flex-1 py-6">
        {view === "chat" ? <ChatInterface /> : <KnowledgeManager />}
      </main>

      <footer className="border-t border-zinc-800">
        <div className="container mx-auto px-4 py-4">
          <div className="text-center">
            <p className="text-xs text-gray-600">
              Sistema Autónomo Offline | Todo el contenido está almacenado localmente
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default App;
