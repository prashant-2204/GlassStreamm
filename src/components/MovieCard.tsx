
import React from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Heart, Bookmark, Star } from "lucide-react";
import { cn } from "@/lib/utils";
import { Movie, getImageUrl, genres } from "@/services/tmdbApi";
import { userService } from "@/services/userService";
import { Link } from "react-router-dom";

interface MovieCardProps {
  movie: Movie;
  className?: string;
}

const MovieCard: React.FC<MovieCardProps> = ({ movie, className }) => {
  const [isSaved, setIsSaved] = React.useState(() => 
    userService.isMovieSaved(movie.id)
  );
  
  const [isLiked, setIsLiked] = React.useState(() => 
    userService.isMovieLiked(movie.id)
  );

  const handleSave = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    userService.toggleSaveMovie(movie.id);
    setIsSaved(!isSaved);
  };

  const handleLike = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    userService.toggleLikeMovie(movie.id);
    setIsLiked(!isLiked);
  };

  const movieGenres = movie.genre_ids
    ?.map(id => genres.find(genre => genre.id === id)?.name)
    .filter(Boolean)
    .slice(0, 2);

  // Format release date
  const releaseYear = movie.release_date ? new Date(movie.release_date).getFullYear() : "";

  return (
    <Link to={`/movie/${movie.id}`} className="block">
      <Card className={cn("h-full overflow-hidden glass-card group transition-all duration-300 hover:scale-[1.02] relative", className)}>
        <div className="relative aspect-[2/3] w-full overflow-hidden">
          <img 
            src={getImageUrl(movie.poster_path)} 
            alt={movie.title}
            className="object-cover w-full h-full transition-transform duration-300 group-hover:scale-105"
            loading="lazy"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-background to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
          <div className="absolute top-2 right-2 flex gap-2">
            <Button 
              variant="ghost" 
              size="icon" 
              className={cn(
                "h-8 w-8 rounded-full bg-black/50 hover:bg-black/70",
                isLiked ? "text-red-500" : "text-white"
              )}
              onClick={handleLike}
            >
              <Heart className={cn("h-4 w-4", isLiked && "fill-current")} />
            </Button>
            <Button 
              variant="ghost" 
              size="icon" 
              className={cn(
                "h-8 w-8 rounded-full bg-black/50 hover:bg-black/70",
                isSaved ? "text-primary" : "text-white"
              )}
              onClick={handleSave}
            >
              <Bookmark className={cn("h-4 w-4", isSaved && "fill-current")} />
            </Button>
          </div>
          {movie.vote_average > 0 && (
            <div className="absolute bottom-2 left-2 flex items-center gap-1 bg-black/60 rounded-full px-2 py-0.5">
              <Star className="h-3 w-3 text-yellow-400 fill-yellow-400" />
              <span className="text-xs font-medium">
                {movie.vote_average.toFixed(1)}
              </span>
            </div>
          )}
        </div>
        <div className="p-3">
          <h3 className="font-semibold line-clamp-1">{movie.title}</h3>
          <div className="flex items-center justify-between mt-1">
            <span className="text-xs text-muted-foreground">{releaseYear}</span>
            <div className="flex gap-1">
              {movieGenres?.map((genre) => (
                <Badge key={genre} variant="outline" className="text-[10px] h-5">
                  {genre}
                </Badge>
              ))}
            </div>
          </div>
        </div>
      </Card>
    </Link>
  );
};

export default MovieCard;
