
import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { tmdbApi, getImageUrl, MovieDetails } from "@/services/tmdbApi";
import { userService } from "@/services/userService";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Heart, Bookmark, Star, Play } from "lucide-react";
import { cn } from "@/lib/utils";
import NavBar from "@/components/NavBar";
import MovieRow from "@/components/MovieRow";
import CommentSection from "@/components/CommentSection";
import VideoPlayer from "@/components/VideoPlayer";
import LoginModal from "@/components/LoginModal";

const MovieDetail = () => {
  const { id } = useParams<{ id: string }>();
  const movieId = parseInt(id || "0");
  
  const [movie, setMovie] = useState<MovieDetails | null>(null);
  const [similarMovies, setSimilarMovies] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isSaved, setIsSaved] = useState(false);
  const [isLiked, setIsLiked] = useState(false);
  const [activeTrailer, setActiveTrailer] = useState<string | null>(null);
  const [loginModalOpen, setLoginModalOpen] = useState(false);
  const [pendingAction, setPendingAction] = useState<(() => void) | null>(null);
  
  const isAuthenticated = userService.isAuthenticated();
  
  useEffect(() => {
    const fetchMovieDetails = async () => {
      setLoading(true);
      try {
        const movieData = await tmdbApi.getMovieDetails(movieId);
        const similar = await tmdbApi.getSimilarMovies(movieId);
        
        setMovie(movieData);
        if (similar?.results) {
          setSimilarMovies(similar.results);
        }
      } catch (error) {
        console.error("Error fetching movie details:", error);
      } finally {
        setLoading(false);
      }
    };
    
    if (movieId) {
      fetchMovieDetails();
      
      // Only set these if authenticated
      if (isAuthenticated) {
        setIsSaved(userService.isMovieSaved(movieId));
        setIsLiked(userService.isMovieLiked(movieId));
      }
    }
  }, [movieId, isAuthenticated]);
  
  const handleAuthAction = (action: () => void) => {
    if (!isAuthenticated) {
      setPendingAction(() => action);
      setLoginModalOpen(true);
    } else {
      action();
    }
  };
  
  const handleSave = () => {
    handleAuthAction(async () => {
      await userService.toggleSaveMovie(movieId);
      setIsSaved(userService.isMovieSaved(movieId));
    });
  };
  
  const handleLike = () => {
    handleAuthAction(async () => {
      await userService.toggleLikeMovie(movieId);
      setIsLiked(userService.isMovieLiked(movieId));
    });
  };
  
  const handleLoginSuccess = () => {
    if (pendingAction) {
      pendingAction();
      setPendingAction(null);
    }
  };
  
  const getTrailerKey = () => {
    if (!movie?.videos?.results?.length) return null;
    
    const trailer = movie.videos.results.find(
      video => video.site === "YouTube" && 
      (video.type === "Trailer" || video.type === "Teaser")
    );
    
    return trailer?.key || null;
  };
  
  const formatRuntime = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hours}h ${mins}m`;
  };
  
  return (
    <div className="min-h-screen">
      <NavBar />
      
      {/* Hero Section with Backdrop */}
      <div className="relative">
        {loading ? (
          <Skeleton className="w-full h-[40vh] md:h-[60vh]" />
        ) : (
          <div className="relative h-[40vh] md:h-[60vh]">
            <div 
              className="absolute inset-0 bg-cover bg-center"
              style={{ 
                backgroundImage: `url(${getImageUrl(movie?.backdrop_path || "", "original")})` 
              }}
            />
            <div className="absolute inset-0 bg-gradient-to-t from-background via-background/80 to-background/10" />
            
            {getTrailerKey() && (
              <Button 
                variant="outline" 
                className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 rounded-full size-16 bg-black/50 border-white"
                onClick={() => setActiveTrailer(getTrailerKey())}
              >
                <Play className="h-6 w-6 fill-white" />
              </Button>
            )}
          </div>
        )}
      </div>
      
      <main className="container px-4 py-6 max-w-7xl mx-auto">
        {loading ? (
          <div className="space-y-4">
            <Skeleton className="h-10 w-2/3" />
            <Skeleton className="h-6 w-1/2" />
            <div className="flex gap-2">
              <Skeleton className="h-8 w-20" />
              <Skeleton className="h-8 w-20" />
            </div>
            <Skeleton className="h-32 w-full" />
          </div>
        ) : (
          <div className="mt-4">
            <div className="flex flex-col md:flex-row gap-6">
              <div className="md:w-1/3 lg:w-1/4 shrink-0">
                <div className="glass-card rounded-lg overflow-hidden">
                  <img 
                    src={getImageUrl(movie?.poster_path || "", "w500")} 
                    alt={movie?.title}
                    className="w-full object-cover"
                  />
                </div>
              </div>
              
              <div className="md:w-2/3 lg:w-3/4">
                <h1 className="text-3xl md:text-4xl font-bold">{movie?.title}</h1>
                
                {movie?.tagline && (
                  <p className="text-lg italic text-muted-foreground mt-1">
                    {movie.tagline}
                  </p>
                )}
                
                <div className="flex flex-wrap gap-2 items-center mt-3">
                  {movie?.release_date && (
                    <span className="text-sm text-muted-foreground">
                      {new Date(movie.release_date).getFullYear()}
                    </span>
                  )}
                  
                  {movie?.runtime && (
                    <>
                      <span className="text-muted-foreground">•</span>
                      <span className="text-sm text-muted-foreground">
                        {formatRuntime(movie.runtime)}
                      </span>
                    </>
                  )}
                  
                  {movie?.vote_average !== undefined && (
                    <>
                      <span className="text-muted-foreground">•</span>
                      <div className="flex items-center">
                        <Star className="h-4 w-4 text-yellow-400 fill-yellow-400 mr-1" />
                        <span>{movie.vote_average.toFixed(1)}</span>
                      </div>
                    </>
                  )}
                </div>
                
                <div className="flex flex-wrap gap-2 mt-3">
                  {movie?.genres?.map(genre => (
                    <Badge key={genre.id} variant="secondary">
                      {genre.name}
                    </Badge>
                  ))}
                </div>
                
                <div className="flex gap-3 mt-6">
                  <Button
                    variant={isLiked ? "default" : "outline"}
                    className={isLiked ? "bg-red-500 hover:bg-red-600" : ""}
                    onClick={handleLike}
                  >
                    <Heart className={cn("mr-2 h-4 w-4", isLiked && "fill-current")} />
                    {isLiked ? "Liked" : "Like"}
                  </Button>
                  
                  <Button
                    variant={isSaved ? "default" : "outline"}
                    onClick={handleSave}
                  >
                    <Bookmark className={cn("mr-2 h-4 w-4", isSaved && "fill-current")} />
                    {isSaved ? "Saved" : "Save"}
                  </Button>
                  
                  {getTrailerKey() && (
                    <Button 
                      variant="outline"
                      onClick={() => setActiveTrailer(getTrailerKey())}
                    >
                      <Play className="mr-2 h-4 w-4" />
                      Trailer
                    </Button>
                  )}
                </div>
                
                <div className="mt-6">
                  <h3 className="text-xl font-semibold mb-2">Overview</h3>
                  <p className="text-muted-foreground">
                    {movie?.overview || "No overview available."}
                  </p>
                </div>
                
                {movie?.credits?.cast?.length > 0 && (
                  <div className="mt-6">
                    <h3 className="text-xl font-semibold mb-2">Cast</h3>
                    <div className="flex flex-wrap gap-2">
                      {movie.credits.cast.slice(0, 5).map(person => (
                        <Badge key={person.id} variant="outline">
                          {person.name}
                        </Badge>
                      ))}
                      {movie.credits.cast.length > 5 && (
                        <Badge variant="outline">+{movie.credits.cast.length - 5} more</Badge>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>
            
            <CommentSection movieId={movieId} />
            
            {similarMovies.length > 0 && (
              <div className="mt-12">
                <MovieRow 
                  title="Similar Movies" 
                  movies={similarMovies}
                />
              </div>
            )}
          </div>
        )}
      </main>
      
      {activeTrailer && (
        <VideoPlayer 
          videoKey={activeTrailer} 
          onClose={() => setActiveTrailer(null)}
        />
      )}
      
      <LoginModal 
        isOpen={loginModalOpen} 
        onClose={() => setLoginModalOpen(false)}
        onSuccess={handleLoginSuccess}
      />
    </div>
  );
};

export default MovieDetail;
