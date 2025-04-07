
import { useState, useEffect } from "react";
import { tmdbApi, Movie, genres } from "@/services/tmdbApi";
import NavBar from "@/components/NavBar";
import MovieCard from "@/components/MovieCard";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";

const MoviesPage = () => {
  const [activeTab, setActiveTab] = useState("popular");
  const [movies, setMovies] = useState<Movie[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [selectedGenre, setSelectedGenre] = useState<number | null>(null);
  
  useEffect(() => {
    setMovies([]);
    setPage(1);
    loadMovies(activeTab, 1);
  }, [activeTab, selectedGenre]);
  
  const loadMovies = async (type: string, pageNum: number) => {
    setLoading(true);
    
    try {
      let result;
      switch (type) {
        case "popular":
          result = await tmdbApi.getPopular(pageNum);
          break;
        case "top_rated":
          result = await tmdbApi.getTopRated(pageNum);
          break;
        case "upcoming":
          result = await tmdbApi.getUpcoming(pageNum);
          break;
        default:
          result = await tmdbApi.getPopular(pageNum);
      }
      
      if (result?.results) {
        let filteredResults = result.results;
        
        // Filter by genre if selected
        if (selectedGenre) {
          filteredResults = filteredResults.filter(movie => 
            movie.genre_ids.includes(selectedGenre)
          );
        }
        
        if (pageNum === 1) {
          setMovies(filteredResults);
        } else {
          setMovies(prev => [...prev, ...filteredResults]);
        }
        
        setTotalPages(Math.min(result.total_pages, 20)); // Limit to 20 pages
      }
    } catch (error) {
      console.error("Error loading movies:", error);
    } finally {
      setLoading(false);
    }
  };
  
  const loadMoreMovies = () => {
    if (page >= totalPages) return;
    const nextPage = page + 1;
    loadMovies(activeTab, nextPage);
    setPage(nextPage);
  };
  
  const handleGenreSelect = (genreId: number) => {
    if (selectedGenre === genreId) {
      setSelectedGenre(null);
    } else {
      setSelectedGenre(genreId);
    }
  };
  
  return (
    <div className="min-h-screen">
      <NavBar />
      
      <main className="container px-4 py-6 max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold mb-6">Explore Movies</h1>
        
        <Tabs defaultValue="popular" value={activeTab} onValueChange={setActiveTab} className="mb-6">
          <TabsList>
            <TabsTrigger value="popular">Popular</TabsTrigger>
            <TabsTrigger value="top_rated">Top Rated</TabsTrigger>
            <TabsTrigger value="upcoming">Upcoming</TabsTrigger>
          </TabsList>
        </Tabs>
        
        <div className="mb-6">
          <h3 className="text-sm font-medium mb-2">Filter by Genre:</h3>
          <ScrollArea className="whitespace-nowrap pb-4">
            <div className="flex space-x-2">
              {genres.map(genre => (
                <Badge 
                  key={genre.id} 
                  variant={selectedGenre === genre.id ? "default" : "outline"}
                  className="cursor-pointer hover:bg-accent/50"
                  onClick={() => handleGenreSelect(genre.id)}
                >
                  {genre.name}
                </Badge>
              ))}
            </div>
            <ScrollBar orientation="horizontal" />
          </ScrollArea>
        </div>
        
        {loading && movies.length === 0 ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 md:gap-6">
            {Array(15).fill(null).map((_, i) => (
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
        ) : (
          <div className="py-12 text-center">
            <p className="text-xl text-muted-foreground">
              No movies found matching your criteria
            </p>
          </div>
        )}
      </main>
    </div>
  );
};

export default MoviesPage;
