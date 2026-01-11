import * as React from "react";
import { Input } from "./ui/input";
import { Button } from "./ui/button";
import { Card } from "./ui/card";
import { searchContent, AcademicContent } from "../lib/indexedDB";

interface Message {
  id: string;
  type: "user" | "assistant";
  content: string;
  academicContent?: AcademicContent[];
  timestamp: number;
}

export function ChatInterface() {
  const [messages, setMessages] = React.useState<Message[]>([
    {
      id: "welcome",
      type: "assistant",
      content: "¡Hola! Soy ValeAI, tu asistente académico offline. Pregúntame sobre cualquier tema de 9° a 11° grado del INEM Kennedy.",
      timestamp: Date.now()
    }
  ]);
  const [input, setInput] = React.useState("");
  const [isProcessing, setIsProcessing] = React.useState(false);
  const messagesEndRef = React.useRef<HTMLDivElement>(null);

  function scrollToBottom() {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }

  React.useEffect(() => {
    scrollToBottom();
  }, [messages]);

  async function handleSendMessage() {
    if (!input.trim() || isProcessing) {
      return;
    }

    const userMessage: Message = {
      id: Date.now().toString(),
      type: "user",
      content: input.trim(),
      timestamp: Date.now()
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setIsProcessing(true);

    try {
      const results = await searchContent(input.trim());
      
      let assistantResponse: Message;

      if (results.length === 0) {
        assistantResponse = {
          id: (Date.now() + 1).toString(),
          type: "assistant",
          content: "No encontré información específica sobre ese tema en mi base de datos. Intenta reformular tu pregunta o usar palabras clave diferentes.",
          timestamp: Date.now()
        };
      } else {
        const topResults = results.slice(0, 3);
        let responseText = `Encontré ${results.length} resultado${results.length !== 1 ? "s" : ""} relacionado${results.length !== 1 ? "s" : ""}. Aquí están los más relevantes:\n\n`;
        
        topResults.forEach((result, idx) => {
          responseText += `**${idx + 1}. ${result.topic}** (${result.grade}° - ${result.subject})\n`;
          const preview = result.content.substring(0, 200).trim();
          responseText += `${preview}${result.content.length > 200 ? "..." : ""}\n\n`;
        });

        assistantResponse = {
          id: (Date.now() + 1).toString(),
          type: "assistant",
          content: responseText,
          academicContent: topResults,
          timestamp: Date.now()
        };
      }

      setMessages((prev) => [...prev, assistantResponse]);
    } catch (error) {
      console.error("Error processing message:", error);
      
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        type: "assistant",
        content: "Hubo un error al procesar tu pregunta. Por favor intenta de nuevo.",
        timestamp: Date.now()
      };
      
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsProcessing(false);
    }
  }

  function handleKeyPress(e: React.KeyboardEvent) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  }

  return (
    <div className="flex flex-col h-[calc(100vh-200px)] max-w-4xl mx-auto">
      <div className="flex-1 overflow-y-auto space-y-4 p-4 scroll-smooth">
        {messages.map((message) => (
          <div
            key={message.id}
            className={`flex ${message.type === "user" ? "justify-end" : "justify-start"}`}
          >
            <div
              className={`max-w-[80%] rounded-lg p-4 ${
                message.type === "user"
                  ? "bg-red-600 text-white"
                  : "bg-zinc-900 text-gray-200 border border-zinc-800"
              }`}
            >
              <div className="whitespace-pre-wrap">
                {message.content.split("\n").map((line, idx) => {
                  if (line.startsWith("**") && line.includes("**")) {
                    const parts = line.split("**");
                    return (
                      <p key={idx} className="font-bold mb-2">
                        {parts[1]}
                        {parts[2] && <span className="font-normal text-gray-400">{parts[2]}</span>}
                      </p>
                    );
                  }
                  return line ? <p key={idx} className="mb-2">{line}</p> : <br key={idx} />;
                })}
              </div>
              
              {message.academicContent && message.academicContent.length > 0 && (
                <div className="mt-4 pt-4 border-t border-zinc-800 space-y-2">
                  <p className="text-xs text-gray-500 mb-2">Palabras clave relacionadas:</p>
                  <div className="flex flex-wrap gap-2">
                    {message.academicContent.flatMap(c => c.keywords).slice(0, 8).map((keyword, idx) => (
                      <span
                        key={idx}
                        className="text-xs bg-zinc-800 text-gray-400 px-2 py-1 rounded"
                      >
                        #{keyword}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        ))}
        
        {isProcessing && (
          <div className="flex justify-start">
            <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-4">
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-red-600 rounded-full animate-pulse"></div>
                <div className="w-2 h-2 bg-red-600 rounded-full animate-pulse delay-75"></div>
                <div className="w-2 h-2 bg-red-600 rounded-full animate-pulse delay-150"></div>
                <span className="text-gray-400 text-sm ml-2">Procesando...</span>
              </div>
            </div>
          </div>
        )}
        
        <div ref={messagesEndRef} />
      </div>

      <div className="border-t border-zinc-800 bg-black p-4">
        <div className="flex gap-2">
          <Input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Escribe tu pregunta aquí..."
            disabled={isProcessing}
            className="flex-1 bg-zinc-900 border-zinc-800 text-white placeholder:text-gray-500 focus:border-red-600"
          />
          <Button
            onClick={handleSendMessage}
            disabled={isProcessing || !input.trim()}
            className="bg-red-600 hover:bg-red-700 text-white px-6"
          >
            Enviar
          </Button>
        </div>
        <p className="text-xs text-gray-600 mt-2 text-center">
          Modo offline - Todo se procesa localmente en tu dispositivo
        </p>
      </div>
    </div>
  );
}
