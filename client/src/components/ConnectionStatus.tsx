import * as React from "react";
import { Wifi, WifiOff } from "lucide-react";

export function ConnectionStatus() {
  const [isOnline, setIsOnline] = React.useState(navigator.onLine);
  const [showNotification, setShowNotification] = React.useState(false);

  React.useEffect(() => {
    function handleOnline() {
      setIsOnline(true);
      setShowNotification(true);
      showNotificationMessage("Conexión a Internet Restaurada", "Ahora usando Gemini AI para respuestas avanzadas");
      setTimeout(() => setShowNotification(false), 5000);
    }

    function handleOffline() {
      setIsOnline(false);
      setShowNotification(true);
      showNotificationMessage("Modo Offline Activado", "Usando base de conocimiento local integrada");
      setTimeout(() => setShowNotification(false), 5000);
    }

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, []);

  function showNotificationMessage(title: string, body: string) {
    if ("Notification" in window && Notification.permission === "granted") {
      new Notification(title, {
        body,
        icon: "/favicon.svg",
        badge: "/favicon.svg"
      });
    }
  }

  React.useEffect(() => {
    if ("Notification" in window && Notification.permission === "default") {
      Notification.requestPermission();
    }
  }, []);

  return (
    <>
      <div className={`fixed top-4 right-4 flex items-center gap-2 px-4 py-2 rounded-full ${
        isOnline 
          ? "bg-green-900/80 text-green-300 border border-green-700" 
          : "bg-orange-900/80 text-orange-300 border border-orange-700"
      } backdrop-blur-sm z-50`}>
        {isOnline ? (
          <>
            <Wifi className="w-4 h-4" />
            <span className="text-sm font-medium">Online - Gemini AI</span>
          </>
        ) : (
          <>
            <WifiOff className="w-4 h-4" />
            <span className="text-sm font-medium">Offline - Local KB</span>
          </>
        )}
      </div>

      {showNotification && (
        <div className={`fixed top-20 right-4 max-w-sm p-4 rounded-lg shadow-2xl ${
          isOnline 
            ? "bg-green-900 border border-green-700" 
            : "bg-orange-900 border border-orange-700"
        } backdrop-blur-sm z-50 animate-slide-in-right`}>
          <div className="flex items-start gap-3">
            {isOnline ? (
              <Wifi className="w-6 h-6 text-green-300 flex-shrink-0" />
            ) : (
              <WifiOff className="w-6 h-6 text-orange-300 flex-shrink-0" />
            )}
            <div>
              <p className="font-bold text-white">
                {isOnline ? "✅ Conexión Restaurada" : "⚠️ Modo Offline"}
              </p>
              <p className="text-sm text-gray-300 mt-1">
                {isOnline 
                  ? "Ahora usando Gemini AI para respuestas avanzadas y generación de imágenes" 
                  : "Usando base de conocimiento local. Funcionalidad completa sin Internet"}
              </p>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
