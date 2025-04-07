
import React from "react";
import { Button } from "@/components/ui/button";
import { X } from "lucide-react";

interface VideoPlayerProps {
  videoKey: string;
  onClose: () => void;
}

const VideoPlayer: React.FC<VideoPlayerProps> = ({ videoKey, onClose }) => {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90">
      <Button 
        variant="ghost"
        size="icon" 
        className="absolute top-4 right-4 rounded-full bg-black/50 hover:bg-black/70 z-50"
        onClick={onClose}
      >
        <X className="h-6 w-6" />
      </Button>
      
      <div className="w-full h-full max-w-4xl max-h-[80vh] aspect-video">
        <iframe
          src={`https://www.youtube.com/embed/${videoKey}?autoplay=1&modestbranding=1&rel=0`}
          className="w-full h-full"
          title="Movie Trailer"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
        />
      </div>
    </div>
  );
};

export default VideoPlayer;
