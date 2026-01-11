import * as React from "react";
import { Input } from "../components/ui/input";
import { Button } from "../components/ui/button";
import { Card } from "../components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../components/ui/select";
import { searchContent, getContentByGrade, AcademicContent } from "../lib/indexedDB";

interface SearchInterfaceProps {
  onResultSelect: (content: AcademicContent) => void;
}

export function SearchInterface({ onResultSelect }: SearchInterfaceProps) {
  const [query, setQuery] = React.useState("");
  const [results, setResults] = React.useState<AcademicContent[]>([]);
  const [selectedGrade, setSelectedGrade] = React.useState<string>("all");
  const [isSearching, setIsSearching] = React.useState(false);

  async function handleSearch() {
    if (!query.trim() && selectedGrade === "all") {
      setResults([]);
      return;
    }

    setIsSearching(true);
    try {
      let searchResults: AcademicContent[] = [];

      if (selectedGrade !== "all") {
        searchResults = await getContentByGrade(selectedGrade as "9" | "10" | "11");
        if (query.trim()) {
          const lowerQuery = query.toLowerCase();
          searchResults = searchResults.filter(
            (content) =>
              content.topic.toLowerCase().includes(lowerQuery) ||
              content.content.toLowerCase().includes(lowerQuery) ||
              content.keywords.some((kw) => kw.toLowerCase().includes(lowerQuery))
          );
        }
      } else if (query.trim()) {
        searchResults = await searchContent(query);
      }

      setResults(searchResults);
    } catch (error) {
      console.error("Search error:", error);
    } finally {
      setIsSearching(false);
    }
  }

  function handleKeyPress(e: React.KeyboardEvent) {
    if (e.key === "Enter") {
      handleSearch();
    }
  }

  React.useEffect(() => {
    const timer = setTimeout(() => {
      if (query.trim() || selectedGrade !== "all") {
        handleSearch();
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [query, selectedGrade]);

  return (
    <div className="space-y-6">
      <div className="flex gap-3">
        <div className="flex-1">
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Buscar por tema, materia o palabras clave..."
            className="bg-zinc-900 border-zinc-800 text-white placeholder:text-gray-500 focus:border-red-600"
          />
        </div>
        <Select value={selectedGrade} onValueChange={setSelectedGrade}>
          <SelectTrigger className="w-32 bg-zinc-900 border-zinc-800 text-white">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos</SelectItem>
            <SelectItem value="9">9°</SelectItem>
            <SelectItem value="10">10°</SelectItem>
            <SelectItem value="11">11°</SelectItem>
          </SelectContent>
        </Select>
        <Button 
          onClick={handleSearch} 
          disabled={isSearching}
          className="bg-red-600 hover:bg-red-700 text-white"
        >
          {isSearching ? "Buscando..." : "Buscar"}
        </Button>
      </div>

      {results.length > 0 && (
        <div className="space-y-3">
          <p className="text-sm text-gray-400">
            {results.length} resultado{results.length !== 1 ? "s" : ""} encontrado{results.length !== 1 ? "s" : ""}
          </p>
          {results.map((result) => (
            <Card
              key={result.id}
              onClick={() => onResultSelect(result)}
              className="p-4 bg-zinc-900 border-zinc-800 hover:border-red-600 cursor-pointer transition-colors"
            >
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <h3 className="font-semibold text-white">{result.topic}</h3>
                  <span className="text-xs bg-red-600 text-white px-2 py-1 rounded">
                    {result.grade}° - {result.subject}
                  </span>
                </div>
                <p className="text-sm text-gray-400 line-clamp-2">
                  {result.content.substring(0, 150)}...
                </p>
                <div className="flex flex-wrap gap-2">
                  {result.keywords.slice(0, 4).map((keyword, idx) => (
                    <span
                      key={idx}
                      className="text-xs text-gray-500 bg-zinc-800 px-2 py-1 rounded"
                    >
                      {keyword}
                    </span>
                  ))}
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      {!isSearching && results.length === 0 && (query.trim() || selectedGrade !== "all") && (
        <div className="text-center py-12 text-gray-500">
          <p>No se encontraron resultados</p>
          <p className="text-sm">Intenta con otros términos de búsqueda</p>
        </div>
      )}
    </div>
  );
}
