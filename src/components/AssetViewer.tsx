import { DueDiligenceAsset } from "../types/dueDiligence";
import { FileText, Image as ImageIcon, Video, MessageSquare } from "lucide-react";

interface AssetViewerProps {
  asset: DueDiligenceAsset | null;
  onAskAI?: () => void;
}

// Helper function to convert YouTube URL to embed URL
const getYouTubeEmbedUrl = (url: string): string | null => {
  const youtubeRegex = /(?:youtube\.com\/watch\?v=|youtu\.be\/)([^&\s]+)/;
  const match = url.match(youtubeRegex);
  if (match && match[1]) {
    return `https://www.youtube.com/embed/${match[1]}`;
  }
  return null;
};

// Check if URL is a YouTube video
const isYouTubeUrl = (url: string): boolean => {
  return url.includes("youtube.com") || url.includes("youtu.be");
};

export function AssetViewer({ asset, onAskAI }: AssetViewerProps) {
  if (!asset) {
    return (
      <div className="h-full flex items-center justify-center bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
        <div className="text-center">
          <FileText className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-600 font-medium">Select a document to view</p>
          <p className="text-sm text-gray-500 mt-1">
            Choose from the due diligence materials on the left
          </p>
        </div>
      </div>
    );
  }

  const isYouTube = asset.type === "video" && isYouTubeUrl(asset.url);
  const embedUrl = isYouTube ? getYouTubeEmbedUrl(asset.url) : null;

  return (
    <div className="h-full bg-white rounded-lg shadow-sm overflow-hidden flex flex-col">
      {/* Asset header - Hide for YouTube videos */}
      {!isYouTube && (
        <div className="px-6 py-4 border-b border-gray-200">
          <div className="flex items-center gap-3">
            {asset.type === "pdf" && (
              <FileText className="w-5 h-5 text-red-500" />
            )}
            {asset.type === "image" && (
              <ImageIcon className="w-5 h-5 text-blue-500" />
            )}
            {asset.type === "video" && (
              <Video className="w-5 h-5 text-purple-500" />
            )}
            <div className="flex-1">
              <h3 className="font-semibold text-gray-900">{asset.name}</h3>
              <p className="text-sm text-gray-500">
                {asset.size} • Uploaded{" "}
                {new Date(asset.uploadedDate).toLocaleDateString()}
              </p>
            </div>
            <div className="flex gap-2">
              {onAskAI && (
                <button
                  onClick={onAskAI}
                  className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm font-medium cursor-pointer"
                >
                  <MessageSquare className="w-4 h-4" />
                  Ask AI
                </button>
              )}
              <a
                href={asset.url}
                download
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium cursor-pointer"
              >
                Download
              </a>
            </div>
          </div>
        </div>
      )}

      {/* Asset content */}
      <div className={`flex-1 overflow-auto ${isYouTube ? "p-0" : ""}`}>
        {asset.type === "pdf" && (
          <div className="h-full w-full">
            <iframe
              src={asset.url}
              title={asset.name}
              className="w-full h-full border-0"
            />
          </div>
        )}

        {asset.type === "image" && (
          <div className="h-full flex items-center justify-center p-6">
            <img
              src={asset.url}
              alt={asset.name}
              className="max-w-full max-h-full object-contain rounded-lg"
            />
          </div>
        )}

        {asset.type === "video" && isYouTube && embedUrl && (
          <div className="h-full flex items-center justify-center bg-black">
            <iframe
              src={embedUrl}
              title={asset.name}
              className="w-full h-full"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            />
          </div>
        )}

        {asset.type === "video" && !isYouTube && (
          <div className="h-full flex items-center justify-center bg-gray-50 rounded-lg p-6">
            <div className="text-center">
              <Video className="w-24 h-24 text-purple-500 mx-auto mb-4" />
              <p className="text-gray-700 font-medium mb-2">{asset.name}</p>
              <p className="text-sm text-gray-500 mb-4">
                Video File • {asset.size}
              </p>
              <a
                href={asset.url}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-block px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium cursor-pointer"
              >
                Open Video
              </a>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
