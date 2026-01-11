import * as React from "react";
import { Card } from "./ui/card";
import { Button } from "./ui/button";
import { History, Trash2, Plus, MessageSquare } from "lucide-react";
import { Badge } from "./ui/badge";

interface ChatSession {
  id: string;
  title: string;
  created_at: number;
  updated_at: number;
  message_count: number;
}

interface ChatHistoryProps {
  onSelectSession: (sessionId: string | null) => void;
  currentSessionId: string | null;
  onNewChat: () => void;
}

export function ChatHistory({ onSelectSession, currentSessionId, onNewChat }: ChatHistoryProps) {
  const [sessions, setSessions] = React.useState<ChatSession[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);

  React.useEffect(() => {
    loadSessions();
  }, []);

  async function loadSessions() {
    try {
      const response = await fetch("/api/chat/sessions");
      const data = await response.json();
      setSessions(data);
    } catch (error) {
      console.error("Error loading chat sessions:", error);
    } finally {
      setIsLoading(false);
    }
  }

  async function handleDeleteSession(sessionId: string, e: React.MouseEvent) {
    e.stopPropagation();
    
    if (!confirm("¿Estás segura de que quieres eliminar esta conversación?")) {
      return;
    }

    try {
      await fetch(`/api/chat/sessions/${sessionId}`, {
        method: "DELETE"
      });
      
      setSessions(prev => prev.filter(s => s.id !== sessionId));
      
      if (currentSessionId === sessionId) {
        onSelectSession(null);
      }
    } catch (error) {
      console.error("Error deleting session:", error);
    }
  }

  function formatDate(timestamp: number) {
    const date = new Date(timestamp);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    
    if (days === 0) {
      return "Hoy";
    } else if (days === 1) {
      return "Ayer";
    } else if (days < 7) {
      return `Hace ${days} días`;
    } else {
      return date.toLocaleDateString("es-ES", { day: "numeric", month: "short" });
    }
  }

  return (
    <div className="h-full flex flex-col">
      <div className="p-4 border-b border-zinc-800">
        <Button
          onClick={onNewChat}
          className="w-full bg-red-600 hover:bg-red-700 text-white"
        >
          <Plus className="w-4 h-4 mr-2" />
          Nueva Conversación
        </Button>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-2">
        {isLoading ? (
          <div className="text-center text-gray-500 py-8">
            <p>Cargando historial...</p>
          </div>
        ) : sessions.length === 0 ? (
          <div className="text-center text-gray-500 py-8">
            <MessageSquare className="w-12 h-12 mx-auto mb-3 opacity-50" />
            <p className="text-sm">No hay conversaciones guardadas</p>
            <p className="text-xs mt-1">Inicia un nuevo chat para comenzar</p>
          </div>
        ) : (
          sessions.map((session) => (
            <Card
              key={session.id}
              onClick={() => onSelectSession(session.id)}
              className={`p-3 cursor-pointer transition-all hover:bg-zinc-800 ${
                currentSessionId === session.id
                  ? "bg-zinc-800 border-red-600"
                  : "bg-zinc-900 border-zinc-800"
              }`}
            >
              <div className="flex items-start justify-between gap-2">
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-white font-medium truncate">
                    {session.title}
                  </p>
                  <div className="flex items-center gap-2 mt-1">
                    <p className="text-xs text-gray-500">
                      {formatDate(session.updated_at)}
                    </p>
                    <Badge variant="secondary" className="text-xs">
                      {session.message_count} mensajes
                    </Badge>
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={(e) => handleDeleteSession(session.id, e)}
                  className="h-8 w-8 p-0 text-gray-500 hover:text-red-500 hover:bg-zinc-800"
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}
