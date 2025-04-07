
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { tmdbApi, Movie } from "@/services/tmdbApi";
import { userService } from "@/services/userService";
import NavBar from "@/components/NavBar";
import MovieCard from "@/components/MovieCard";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import LoginModal from "@/components/LoginModal";

const SavedMovies = () => {
  const [savedMovies, setSavedMovies] = useState<Movie[]>([]);
  const [loading, setLoading] = useState(true);
  const [loginModalOpen, setLoginModalOpen] = useState(false);
  const navigate = useNavigate();
  
  const isAuthenticated = userService.isAuthenticated();
  
  useEffect(() => {
    const fetchSavedMovies = async () => {
      if (!isAuthenticated) {
        setLoading(false);
        return;
      }
      
      setLoading(true);
      try {
        const savedIds = userService.getSavedMovies();
        
        if (savedIds.length === 0) {
          setSavedMovies([]);
          setLoading(false);
          return;
        }
        
        const moviePromises = savedIds.map(id => tmdbApi.getMovieDetails(id));
        const movies = await Promise.all(moviePromises);
        setSavedMovies(movies.filter(Boolean) as Movie[]);
      } catch (error) {
        console.error("Error fetching saved movies:", error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchSavedMovies();
  }, [isAuthenticated]);
  
  const handleLoginSuccess = () => {
    window.location.reload(); // Refresh to show saved movies
  };
  
  return (
    <div className="min-h-screen">
      <NavBar />
      
      <main className="container px-4 py-6 max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold mb-6">Your Saved Movies</h1>
        
        {!isAuthenticated ? (
          <div className="py-12 text-center">
            <p className="text-xl text-muted-foreground mb-4">
              You need to log in to see your saved movies
            </p>
            <Button 
              onClick={() => setLoginModalOpen(true)}
              className="mt-2"
            >
              Log in
            </Button>
          </div>
        ) : loading ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 md:gap-6">
            {Array(10).fill(null).map((_, i) => (
              <div key={i}>
                <Skeleton className="aspect-[2/3] w-full rounded-lg mb-2" />
                <Skeleton className="h-5 w-full rounded mb-1" />
                <Skeleton className="h-4 w-2/3 rounded" />
              </div>
            ))}
          </div>
        ) : savedMovies.length > 0 ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 md:gap-6">
            {savedMovies.map(movie => (
              <MovieCard key={movie.id} movie={movie} />
            ))}
          </div>
        ) : (
          <div className="py-12 text-center">
            <p className="text-xl text-muted-foreground mb-4">
              You haven't saved any movies yet
            </p>
            <p className="text-muted-foreground mb-6">
              Browse movies and click the bookmark icon to save them for later
            </p>
            <Button onClick={() => navigate("/movies")}>
              Browse Movies
            </Button>
          </div>
        )}
      </main>
      
      <LoginModal 
        isOpen={loginModalOpen}
        onClose={() => setLoginModalOpen(false)}
        onSuccess={handleLoginSuccess}
      />
    </div>
  );
};

export default SavedMovies;
