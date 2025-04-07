
import React from "react";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import { Skeleton } from "@/components/ui/skeleton";
import MovieCard from "@/components/MovieCard";
import { Movie } from "@/services/tmdbApi";

interface MovieRowProps {
  title: string;
  movies: Movie[] | null;
  isLoading?: boolean;
}

const MovieRow: React.FC<MovieRowProps> = ({ title, movies, isLoading = false }) => {
  return (
    <div className="py-4">
      <h2 className="text-xl font-bold mb-4">{title}</h2>
      <ScrollArea className="w-full whitespace-nowrap pb-6">
        <div className="flex space-x-4">
          {isLoading && 
            Array(6).fill(null).map((_, i) => (
              <div key={i} className="w-[180px] shrink-0">
                <Skeleton className="aspect-[2/3] w-full rounded-lg mb-2" />
                <Skeleton className="h-4 w-full rounded mb-1" />
                <Skeleton className="h-3 w-2/3 rounded" />
              </div>
            ))
          }
          
          {!isLoading && movies?.map(movie => (
            <div key={movie.id} className="w-[180px] shrink-0">
              <MovieCard movie={movie} />
            </div>
          ))}
        </div>
        <ScrollBar orientation="horizontal" />
      </ScrollArea>
    </div>
  );
};

export default MovieRow;
