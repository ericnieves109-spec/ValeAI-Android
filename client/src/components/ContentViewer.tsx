import * as React from "react";
import { Button } from "../components/ui/button";
import { Card } from "../components/ui/card";
import { AcademicContent, getMediaById } from "../lib/indexedDB";

interface ContentViewerProps {
  content: AcademicContent;
  onBack: () => void;
}

export function ContentViewer({ content, onBack }: ContentViewerProps) {
  const [mediaUrls, setMediaUrls] = React.useState<Map<string, string>>(new Map());

  React.useEffect(() => {
    async function loadMedia() {
      const urls = new Map<string, string>();
      
      for (const mediaId of content.mediaIds) {
        const media = await getMediaById(mediaId);
        if (media) {
          const url = URL.createObjectURL(media.data);
          urls.set(mediaId, url);
        }
      }
      
      setMediaUrls(urls);
    }

    loadMedia();

    return () => {
      mediaUrls.forEach((url) => URL.revokeObjectURL(url));
    };
  }, [content.mediaIds]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <Button
          onClick={onBack}
          variant="outline"
          className="bg-zinc-900 border-zinc-800 text-white hover:bg-zinc-800"
        >
          ← Volver
        </Button>
        <span className="text-xs bg-red-600 text-white px-3 py-1 rounded">
          {content.grade}° - {content.subject}
        </span>
      </div>

      <Card className="p-6 bg-zinc-900 border-zinc-800">
        <div className="space-y-6">
          <div>
            <h1 className="text-3xl font-bold text-white mb-2">{content.topic}</h1>
            <div className="flex flex-wrap gap-2">
              {content.keywords.map((keyword, idx) => (
                <span
                  key={idx}
                  className="text-xs text-gray-400 bg-zinc-800 px-2 py-1 rounded"
                >
                  #{keyword}
                </span>
              ))}
            </div>
          </div>

          <div className="prose prose-invert max-w-none">
            {content.content.split("\n\n").map((paragraph, idx) => (
              <p key={idx} className="text-gray-300 leading-relaxed mb-4 whitespace-pre-wrap">
                {paragraph}
              </p>
            ))}
          </div>

          {content.mediaIds.length > 0 && (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-white">Recursos multimedia</h3>
              <div className="grid gap-4">
                {content.mediaIds.map((mediaId) => {
                  const url = mediaUrls.get(mediaId);
                  return url ? (
                    <img
                      key={mediaId}
                      src={url}
                      alt="Contenido multimedia"
                      className="rounded-lg border border-zinc-800 max-w-full"
                    />
                  ) : null;
                })}
              </div>
            </div>
          )}
        </div>
      </Card>
    </div>
  );
}
