import * as React from "react";
import { LoadingScreen } from "./components/LoadingScreen";
import { Header } from "./components/Header";
import { SearchInterface } from "./components/SearchInterface";
import { ContentViewer } from "./components/ContentViewer";
import { loadInitialContent } from "./lib/contentLoader";
import { getDatabaseStats, AcademicContent } from "./lib/indexedDB";

function App() {
  const [isLoading, setIsLoading] = React.useState(true);
  const [loadProgress, setLoadProgress] = React.useState(0);
  const [loadTotal, setLoadTotal] = React.useState(0);
  const [contentCount, setContentCount] = React.useState(0);
  const [mediaCount, setMediaCount] = React.useState(0);
  const [selectedContent, setSelectedContent] = React.useState<AcademicContent | null>(null);

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
    <div className="min-h-screen bg-black">
      <Header contentCount={contentCount} mediaCount={mediaCount} />
      
      <main className="container mx-auto px-4 py-8 max-w-4xl">
        {selectedContent ? (
          <ContentViewer
            content={selectedContent}
            onBack={() => setSelectedContent(null)}
          />
        ) : (
          <>
            <div className="mb-8 text-center space-y-2">
              <h2 className="text-2xl font-bold text-white">
                ¿Qué deseas aprender hoy?
              </h2>
              <p className="text-gray-400">
                Busca contenido académico de 9° a 11° grado
              </p>
            </div>
            
            <SearchInterface onResultSelect={setSelectedContent} />
          </>
        )}
      </main>

      <footer className="border-t border-zinc-800 mt-16">
        <div className="container mx-auto px-4 py-6">
          <div className="text-center space-y-2">
            <p className="text-xs text-gray-600">
              INEM Kennedy - Sistema Autónomo Offline
            </p>
            <p className="text-xs text-gray-700">
              Todo el contenido está almacenado localmente en tu dispositivo
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default App;
