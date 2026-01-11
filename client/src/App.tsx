import * as React from "react";
import { LoadingScreen } from "./components/LoadingScreen";
import { Header } from "./components/Header";
import { ChatInterface } from "./components/ChatInterface";
import { loadInitialContent } from "./lib/contentLoader";
import { getDatabaseStats } from "./lib/indexedDB";

function App() {
  const [isLoading, setIsLoading] = React.useState(true);
  const [loadProgress, setLoadProgress] = React.useState(0);
  const [loadTotal, setLoadTotal] = React.useState(0);
  const [contentCount, setContentCount] = React.useState(0);
  const [mediaCount, setMediaCount] = React.useState(0);

  React.useEffect(() => {
    async function initializeApp() {
      try {
        const stats = await getDatabaseStats();
        
        if (stats.contentCount === 0) {
          console.log("First load - initializing content...");
          await loadInitialContent((current, total) => {
            setLoadProgress(current);
            setLoadTotal(total);
          });
        } else {
          console.log("Content already loaded - skipping initialization");
        }

        const finalStats = await getDatabaseStats();
        setContentCount(finalStats.contentCount);
        setMediaCount(finalStats.mediaCount);
        
        setTimeout(() => setIsLoading(false), 500);
      } catch (error) {
        console.error("Initialization error:", error);
        setIsLoading(false);
      }
    }

    initializeApp();
  }, []);

  if (isLoading) {
    return <LoadingScreen progress={loadProgress} total={loadTotal} />;
  }

  return (
    <div className="min-h-screen bg-black flex flex-col">
      <Header contentCount={contentCount} mediaCount={mediaCount} />
      
      <main className="flex-1 container mx-auto px-4 py-6">
        <ChatInterface />
      </main>

      <footer className="border-t border-zinc-800">
        <div className="container mx-auto px-4 py-4">
          <div className="text-center">
            <p className="text-xs text-gray-600">
              INEM Kennedy - Sistema Autónomo Offline | Todo el contenido está almacenado localmente
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default App;
