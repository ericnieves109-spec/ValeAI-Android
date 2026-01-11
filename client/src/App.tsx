import * as React from "react";
import { LoadingScreen } from "./components/LoadingScreen";
import { Header } from "./components/Header";
import { ChatInterface } from "./components/ChatInterface";
import { KnowledgeManager } from "./components/KnowledgeManager";
import { ChatHistory } from "./components/ChatHistory";
import { Settings, MessageSquare, History } from "lucide-react";
import { Button } from "./components/ui/button";

function App() {
  const [view, setView] = React.useState<"chat" | "knowledge" | "history">("chat");
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
      <Header />
      
      <div className="border-b border-zinc-800 bg-black/50">
        <div className="container mx-auto px-4 py-2 flex gap-2">
          <Button
            onClick={() => setView("chat")}
            variant={view === "chat" ? "default" : "ghost"}
            className={view === "chat" ? "bg-red-600 hover:bg-red-700" : "text-gray-400 hover:text-white"}
          >
            <MessageSquare className="w-4 h-4 mr-2" />
            Chat
          </Button>
          <Button
            onClick={() => setView("history")}
            variant={view === "history" ? "default" : "ghost"}
            className={view === "history" ? "bg-red-600 hover:bg-red-700" : "text-gray-400 hover:text-white"}
          >
            <History className="w-4 h-4 mr-2" />
            Historial
          </Button>
          <Button
            onClick={() => setView("knowledge")}
            variant={view === "knowledge" ? "default" : "ghost"}
            className={view === "knowledge" ? "bg-red-600 hover:bg-red-700" : "text-gray-400 hover:text-white"}
          >
            <Settings className="w-4 h-4 mr-2" />
            Conocimiento
          </Button>
        </div>
      </div>
      
      <main className="flex-1 py-6">
        {view === "chat" && <ChatInterface key={refreshKey} sessionId={currentSessionId} onNewSession={setCurrentSessionId} />}
        {view === "history" && <ChatHistory onSelectSession={handleSelectSession} currentSessionId={currentSessionId} onNewChat={handleNewChat} />}
        {view === "knowledge" && <KnowledgeManager />}
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
