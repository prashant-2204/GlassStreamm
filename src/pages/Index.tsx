import { useEffect, useState } from "react";
import { tmdbApi, Movie } from "@/services/tmdbApi";
import MovieRow from "@/components/MovieRow";
import NavBar from "@/components/NavBar";
import LoginModal from "@/components/LoginModal";
import { userService } from "@/services/userService";

const Index = () => {
  const [trendingMovies, setTrendingMovies] = useState<Movie[] | null>(null);
  const [popularMovies, setPopularMovies] = useState<Movie[] | null>(null);
  const [topRatedMovies, setTopRatedMovies] = useState<Movie[] | null>(null);
  const [loading, setLoading] = useState(true);
  const [loginModalOpen, setLoginModalOpen] = useState(false);

  useEffect(() => {
    const fetchMovies = async () => {
      try {
        const trending = await tmdbApi.getTrending();
        const popular = await tmdbApi.getPopular();
        const topRated = await tmdbApi.getTopRated();
        
        if (trending) setTrendingMovies(trending.results);
        if (popular) setPopularMovies(popular.results);
        if (topRated) setTopRatedMovies(topRated.results);
      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchMovies();

    // Show login modal only if user is not authenticated
    if (!userService.isAuthenticated()) {
      setLoginModalOpen(true);
    }
  }, []);

  return (
    <div className="min-h-screen flex flex-col">
      <NavBar />

      <main className="flex-1 container px-4 py-6 max-w-7xl mx-auto">
        <section className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Welcome to GlassStream</h1>
          <p className="text-muted-foreground">
            Discover and enjoy your favorite movies in one place
          </p>
        </section>

        <MovieRow 
          title="Trending Now" 
          movies={trendingMovies} 
          isLoading={loading}
        />
        
        <MovieRow 
          title="Popular Movies" 
          movies={popularMovies} 
          isLoading={loading}
        />
        
        <MovieRow 
          title="Top Rated" 
          movies={topRatedMovies} 
          isLoading={loading}
        />
      </main>

      <LoginModal isOpen={loginModalOpen} onClose={() => setLoginModalOpen(false)} />
    </div>
  );
};

export default Index;

