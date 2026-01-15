import * as React from "react";
import { LoadingScreen } from "./components/LoadingScreen";
import { Header } from "./components/Header";
import { ChatInterface } from "./components/ChatInterface";
import { KnowledgeManager } from "./components/KnowledgeManager";
import { ChatHistory } from "./components/ChatHistory";
import { ImageGenerator } from "./components/ImageGenerator";
import { FileProcessor } from "./components/FileProcessor";
import { ConnectionStatus } from "./components/ConnectionStatus";
import { Settings, MessageSquare, History, Image, Upload } from "lucide-react";
import { Button } from "./components/ui/button";

function App() {
  const [view, setView] = React.useState<"chat" | "knowledge" | "history" | "images" | "files">("chat");
  const [currentSessionId, setCurrentSessionId] = React.useState<string | null>(null);
  const [refreshKey, setRefreshKey] = React.useState(0);

  function handleNewChat() {
    setCurrentSessionId(null);
    setView("chat");
    setRefreshKey(prev => prev + 1);
  }

  function handleSelectSession(sessionId: string | null) {
    setCurrentSessionId(sessionId);
    setView("chat");
    setRefreshKey(prev => prev + 1);
  }

  return (
    <div className="min-h-screen bg-black dark:bg-black flex flex-col">
      <ConnectionStatus />
      <Header />
      
      <div className="border-b border-zinc-800 bg-black/50">
        <div className="container mx-auto px-4 py-2 flex gap-2 overflow-x-auto">
          <Button
            onClick={() => setView("chat")}
            variant="ghost"
            className={view === "chat" ? "bg-red-600 hover:bg-red-700 text-white" : "text-gray-400 hover:text-white hover:bg-zinc-800"}
          >
            <MessageSquare className="w-4 h-4 mr-2" />
            Charlar
          </Button>
          <Button
            onClick={() => setView("history")}
            variant="ghost"
            className={view === "history" ? "bg-red-600 hover:bg-red-700 text-white" : "text-gray-400 hover:text-white hover:bg-zinc-800"}
          >
            <History className="w-4 h-4 mr-2" />
            Histórico
          </Button>
          <Button
            onClick={() => setView("images")}
            variant="ghost"
            className={view === "images" ? "bg-red-600 hover:bg-red-700 text-white" : "text-gray-400 hover:text-white hover:bg-zinc-800"}
          >
            <Image className="w-4 h-4 mr-2" />
            Imágenes IA
          </Button>
          <Button
            onClick={() => setView("files")}
            variant="ghost"
            className={view === "files" ? "bg-red-600 hover:bg-red-700 text-white" : "text-gray-400 hover:text-white hover:bg-zinc-800"}
          >
            <Upload className="w-4 h-4 mr-2" />
            Aprendizaje
          </Button>
          <Button
            onClick={() => setView("knowledge")}
            variant="ghost"
            className={view === "knowledge" ? "bg-red-600 hover:bg-red-700 text-white" : "text-gray-400 hover:text-white hover:bg-zinc-800"}
          >
            <Settings className="w-4 h-4 mr-2" />
            Conocimiento
          </Button>
        </div>
      </div>
      
      <main className="flex-1 py-6">
        {view === "chat" && <ChatInterface key={refreshKey} sessionId={currentSessionId} onNewSession={setCurrentSessionId} />}
        {view === "history" && <ChatHistory onSelectSession={handleSelectSession} currentSessionId={currentSessionId} onNewChat={handleNewChat} />}
        {view === "images" && <ImageGenerator />}
        {view === "files" && <FileProcessor />}
        {view === "knowledge" && <KnowledgeManager />}
      </main>

      <footer className="border-t border-zinc-800">
        <div className="container mx-auto px-4 py-4">
          <div className="text-center">
            <p className="text-xs text-gray-600">
              Sistema Autónomo Desconectado | Todo el contenido está almacenado localmente
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default App;
