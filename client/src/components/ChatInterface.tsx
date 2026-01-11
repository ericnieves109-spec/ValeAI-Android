import * as React from "react";
import { Input } from "./ui/input";
import { Button } from "./ui/button";
import { Card } from "./ui/card";
import { searchContent, AcademicContent } from "../lib/indexedDB";
import { Mic, MicOff, Camera, Send } from "lucide-react";

interface Message {
  id: string;
  type: "user" | "assistant";
  content: string;
  imageUrl?: string;
  academicContent?: AcademicContent[];
  timestamp: number;
}

export function ChatInterface() {
  const [messages, setMessages] = React.useState<Message[]>([
    {
      id: "welcome",
      type: "assistant",
      content: "¡Hola! Soy ValeAI, tu asistente académico offline. Pregúntame cualquier cosa.",
      timestamp: Date.now()
    }
  ]);
  const [input, setInput] = React.useState("");
  const [isProcessing, setIsProcessing] = React.useState(false);
  const [isRecording, setIsRecording] = React.useState(false);
  const [selectedImage, setSelectedImage] = React.useState<string | null>(null);
  const messagesEndRef = React.useRef<HTMLDivElement>(null);
  const fileInputRef = React.useRef<HTMLInputElement>(null);
  const mediaRecorderRef = React.useRef<MediaRecorder | null>(null);
  const recognitionRef = React.useRef<any>(null);

  function scrollToBottom() {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }

  React.useEffect(() => {
    scrollToBottom();
  }, [messages]);

  async function handleSendMessage() {
    if ((!input.trim() && !selectedImage) || isProcessing) {
      return;
    }

    const userMessage: Message = {
      id: Date.now().toString(),
      type: "user",
      content: input.trim() || "Imagen adjunta",
      imageUrl: selectedImage || undefined,
      timestamp: Date.now()
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setSelectedImage(null);
    setIsProcessing(true);

    try {
      let responseContent = "";
      
      if (userMessage.imageUrl) {
        responseContent = "He analizado la imagen. ";
      }
      
      const results = await searchContent(input.trim());
      
      let assistantResponse: Message;

      if (results.length === 0 && !userMessage.imageUrl) {
        assistantResponse = {
          id: (Date.now() + 1).toString(),
          type: "assistant",
          content: "No encontré información específica sobre ese tema en mi base de datos. Intenta reformular tu pregunta o usar palabras clave diferentes.",
          timestamp: Date.now()
        };
      } else if (results.length === 0 && userMessage.imageUrl) {
        assistantResponse = {
          id: (Date.now() + 1).toString(),
          type: "assistant",
          content: responseContent + "No encontré información específica relacionada con esta imagen en mi base de datos. ¿Puedes darme más contexto sobre qué necesitas ayuda?",
          timestamp: Date.now()
        };
      } else {
        const topResults = results.slice(0, 3);
        let responseText = responseContent + `Encontré ${results.length} resultado${results.length !== 1 ? "s" : ""} relacionado${results.length !== 1 ? "s" : ""}. Aquí están los más relevantes:\n\n`;
        
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

  function toggleVoiceRecording() {
    if (isRecording) {
      stopVoiceRecording();
    } else {
      startVoiceRecording();
    }
  }

  function startVoiceRecording() {
    if (!("webkitSpeechRecognition" in window) && !("SpeechRecognition" in window)) {
      alert("Tu navegador no soporta reconocimiento de voz. Prueba con Chrome o Edge.");
      return;
    }

    const SpeechRecognition = (window as any).webkitSpeechRecognition || (window as any).SpeechRecognition;
    const recognition = new SpeechRecognition();
    recognition.lang = "es-ES";
    recognition.continuous = false;
    recognition.interimResults = false;

    recognition.onstart = () => {
      setIsRecording(true);
      console.log("Voice recognition started");
    };

    recognition.onresult = (event: any) => {
      const transcript = event.results[0][0].transcript;
      setInput(transcript);
      console.log("Voice transcript:", transcript);
    };

    recognition.onerror = (event: any) => {
      console.error("Voice recognition error:", event.error);
      setIsRecording(false);
    };

    recognition.onend = () => {
      setIsRecording(false);
      console.log("Voice recognition ended");
    };

    recognitionRef.current = recognition;
    recognition.start();
  }

  function stopVoiceRecording() {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
      setIsRecording(false);
    }
  }

  function handleImageCapture(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) {
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const imageUrl = event.target?.result as string;
      setSelectedImage(imageUrl);
    };
    reader.readAsDataURL(file);
  }

  function removeSelectedImage() {
    setSelectedImage(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
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
              {message.imageUrl && (
                <img 
                  src={message.imageUrl} 
                  alt="Imagen adjunta" 
                  className="max-w-full rounded-lg mb-3 max-h-64 object-contain"
                />
              )}
              
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
        {selectedImage && (
          <div className="mb-3 relative inline-block">
            <img 
              src={selectedImage} 
              alt="Preview" 
              className="max-h-32 rounded-lg border-2 border-zinc-700"
            />
            <button
              onClick={removeSelectedImage}
              className="absolute -top-2 -right-2 bg-red-600 text-white rounded-full w-6 h-6 flex items-center justify-center hover:bg-red-700"
            >
              ×
            </button>
          </div>
        )}
        
        <div className="flex gap-2">
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            capture="environment"
            onChange={handleImageCapture}
            className="hidden"
          />
          
          <Button
            onClick={() => fileInputRef.current?.click()}
            disabled={isProcessing}
            className="bg-zinc-800 hover:bg-zinc-700 text-white p-3"
            title="Capturar o subir imagen"
          >
            <Camera className="w-5 h-5" />
          </Button>
          
          <Button
            onClick={toggleVoiceRecording}
            disabled={isProcessing}
            className={`${
              isRecording 
                ? "bg-red-600 hover:bg-red-700 animate-pulse" 
                : "bg-zinc-800 hover:bg-zinc-700"
            } text-white p-3`}
            title={isRecording ? "Detener grabación" : "Grabar voz"}
          >
            {isRecording ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
          </Button>
          
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
            disabled={isProcessing || (!input.trim() && !selectedImage)}
            className="bg-red-600 hover:bg-red-700 text-white p-3"
            title="Enviar mensaje"
          >
            <Send className="w-5 h-5" />
          </Button>
        </div>
        
        <p className="text-xs text-gray-600 mt-2 text-center">
          Modo offline - Todo se procesa localmente en tu dispositivo
        </p>
      </div>
    </div>
  );
}
