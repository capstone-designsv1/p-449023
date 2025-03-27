
import React, { useEffect, useRef, useState } from "react";
import { Loader2 } from "lucide-react";

interface FigJamEmbedProps {
  fileId: string;
  nodeId?: string;
  accessToken?: string;
  onLoad?: () => void;
  onError?: (error: Error) => void;
  className?: string;
}

const FigJamEmbed: React.FC<FigJamEmbedProps> = ({
  fileId,
  nodeId,
  accessToken,
  onLoad,
  onError,
  className = "",
}) => {
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    // Reset states when fileId changes
    setIsLoading(true);
    setError(null);

    // The embed URL format for FigJam
    const embedUrl = new URL(`https://www.figma.com/embed`);
    embedUrl.searchParams.append("embed_host", "share");
    embedUrl.searchParams.append("url", `https://www.figma.com/file/${fileId}`);
    
    // Add node ID if provided
    if (nodeId) {
      embedUrl.searchParams.append("node-id", nodeId);
    }

    // Handle iframe load events
    const handleLoad = () => {
      setIsLoading(false);
      if (onLoad) onLoad();
    };

    const handleError = (err: ErrorEvent) => {
      const error = new Error("Failed to load FigJam embed");
      setError(error);
      setIsLoading(false);
      if (onError) onError(error);
    };

    const iframe = iframeRef.current;
    if (iframe) {
      iframe.src = embedUrl.toString();
      iframe.addEventListener("load", handleLoad);
      iframe.addEventListener("error", handleError);

      return () => {
        iframe.removeEventListener("load", handleLoad);
        iframe.removeEventListener("error", handleError);
      };
    }
  }, [fileId, nodeId, onLoad, onError]);

  return (
    <div className={`relative w-full h-full ${className}`}>
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-50 z-10">
          <Loader2 className="h-8 w-8 animate-spin text-[rgba(97,228,197,1)]" />
          <span className="ml-2 text-lg">Loading FigJam board...</span>
        </div>
      )}
      
      {error && (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-gray-50 z-10">
          <p className="text-red-500 text-lg">Failed to load FigJam board</p>
          <p className="text-gray-500">Please check your connection and try again</p>
        </div>
      )}
      
      <iframe
        ref={iframeRef}
        className={`w-full h-full border-0 ${isLoading ? 'opacity-0' : 'opacity-100'}`}
        allow="clipboard-write"
        allowFullScreen
      />
    </div>
  );
};

export default FigJamEmbed;
