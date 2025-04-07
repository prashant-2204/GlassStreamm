
import { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { tmdbApi, Movie } from "@/services/tmdbApi";
import NavBar from "@/components/NavBar";
import MovieCard from "@/components/MovieCard";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";

const SearchResults = () => {
  const [searchParams] = useSearchParams();
  const query = searchParams.get("query") || "";
  
  const [movies, setMovies] = useState<Movie[]>([]);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  
  useEffect(() => {
    if (!query) return;
    
    setMovies([]);
    setPage(1);
    setLoading(true);
    
    const searchMovies = async () => {
      try {
        const result = await tmdbApi.searchMovies(query);
        if (result?.results) {
          setMovies(result.results);
          setTotalPages(Math.min(result.total_pages, 20)); // Limit to 20 pages
        }
      } catch (error) {
        console.error("Error searching movies:", error);
      } finally {
        setLoading(false);
      }
    };
    
    searchMovies();
  }, [query]);
  
  const loadMoreMovies = async () => {
    if (page >= totalPages) return;
    
    setLoading(true);
    const nextPage = page + 1;
    
    try {
      const result = await tmdbApi.searchMovies(query, nextPage);
      if (result?.results) {
        setMovies(prev => [...prev, ...result.results]);
        setPage(nextPage);
      }
    } catch (error) {
      console.error("Error loading more movies:", error);
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <div className="min-h-screen">
      <NavBar />
      
      <main className="container px-4 py-6 max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold mb-2">Search Results</h1>
        <p className="text-muted-foreground mb-6">
          {query ? `Showing results for "${query}"` : "Enter a search term to find movies"}
        </p>
        
        {loading && movies.length === 0 ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 md:gap-6">
            {Array(10).fill(null).map((_, i) => (
              <div key={i}>
                <Skeleton className="aspect-[2/3] w-full rounded-lg mb-2" />
                <Skeleton className="h-5 w-full rounded mb-1" />
                <Skeleton className="h-4 w-2/3 rounded" />
              </div>
            ))}
          </div>
        ) : movies.length > 0 ? (
          <>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 md:gap-6">
              {movies.map(movie => (
                <MovieCard key={movie.id} movie={movie} />
              ))}
            </div>
            
            {page < totalPages && (
              <div className="flex justify-center mt-8">
                <Button 
                  variant="outline" 
                  size="lg" 
                  onClick={loadMoreMovies} 
                  disabled={loading}
                >
                  {loading ? "Loading..." : "Load More"}
                </Button>
              </div>
            )}
          </>
        ) : query ? (
          <div className="py-12 text-center">
            <p className="text-xl text-muted-foreground">
              No movies found for "{query}"
            </p>
          </div>
        ) : null}
      </main>
    </div>
  );
};

export default SearchResults;
