
import { toast } from "sonner";

// API Constants
const API_KEY = "9ecc0f4e745eb47a7d0336fb160028ad";
const API_READ_ACCESS_TOKEN = "eyJhbGciOiJIUzI1NiJ9.eyJhdWQiOiI5ZWNjMGY0ZTc0NWViNDdhN2QwMzM2ZmIxNjAwMjhhZCIsIm5iZiI6MTc0NDAzNzk3Ni43NDcsInN1YiI6IjY3ZjNlODU4ZTFkNWMyM2M2ZWQ5OTJlMSIsInNjb3BlcyI6WyJhcGlfcmVhZCJdLCJ2ZXJzaW9uIjoxfQ.-YiS0RWO1yWeD2XWjRF4ddZP7sSQ99koZ0JideUTEwo";
const BASE_URL = "https://api.themoviedb.org/3";
const IMAGE_BASE_URL = "https://image.tmdb.org/t/p";

// Image sizes
export const posterSizes = {
  small: "w185",
  medium: "w342",
  large: "w500",
  original: "original"
};

export const backdropSizes = {
  small: "w300",
  medium: "w780",
  large: "w1280",
  original: "original"
};

// Helper function to generate image URLs
export const getImageUrl = (path: string, size: string = posterSizes.medium) => {
  if (!path) return "/placeholder.svg";
  return `${IMAGE_BASE_URL}/${size}${path}`;
};

// API fetch helper
const apiFetch = async (endpoint: string, options = {}) => {
  try {
    const response = await fetch(`${BASE_URL}${endpoint}`, {
      headers: {
        Authorization: `Bearer ${API_READ_ACCESS_TOKEN}`,
        "Content-Type": "application/json",
      },
      ...options,
    });
    
    if (!response.ok) {
      throw new Error(`API Error: ${response.status}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error("TMDB API Error:", error);
    toast.error("Something went wrong. Please try again.");
    return null;
  }
};

// API endpoints
export const tmdbApi = {
  // Movies
  getTrending: (timeWindow: "day" | "week" = "week") => 
    apiFetch(`/trending/movie/${timeWindow}`),
  
  getPopular: (page: number = 1) => 
    apiFetch(`/movie/popular?page=${page}`),
  
  getTopRated: (page: number = 1) => 
    apiFetch(`/movie/top_rated?page=${page}`),
  
  getUpcoming: (page: number = 1) => 
    apiFetch(`/movie/upcoming?page=${page}`),
  
  getMovieDetails: (movieId: number) => 
    apiFetch(`/movie/${movieId}?append_to_response=videos,credits`),
  
  getSimilarMovies: (movieId: number) => 
    apiFetch(`/movie/${movieId}/similar`),
  
  // Search
  searchMovies: (query: string, page: number = 1) => 
    apiFetch(`/search/movie?query=${encodeURIComponent(query)}&page=${page}`),
  
  // TV Shows
  getTrendingShows: (timeWindow: "day" | "week" = "week") => 
    apiFetch(`/trending/tv/${timeWindow}`),
  
  getPopularShows: (page: number = 1) => 
    apiFetch(`/tv/popular?page=${page}`),
  
  // Genres
  getMovieGenres: () => 
    apiFetch("/genre/movie/list"),
  
  getTVGenres: () => 
    apiFetch("/genre/tv/list"),
};

export const genres = [
  { id: 28, name: "Action" },
  { id: 12, name: "Adventure" },
  { id: 16, name: "Animation" },
  { id: 35, name: "Comedy" },
  { id: 80, name: "Crime" },
  { id: 99, name: "Documentary" },
  { id: 18, name: "Drama" },
  { id: 10751, name: "Family" },
  { id: 14, name: "Fantasy" },
  { id: 36, name: "History" },
  { id: 27, name: "Horror" },
  { id: 10402, name: "Music" },
  { id: 9648, name: "Mystery" },
  { id: 10749, name: "Romance" },
  { id: 878, name: "Science Fiction" },
  { id: 10770, name: "TV Movie" },
  { id: 53, name: "Thriller" },
  { id: 10752, name: "War" },
  { id: 37, name: "Western" },
];

// Movie types
export interface Movie {
  id: number;
  title: string;
  poster_path: string;
  backdrop_path: string;
  overview: string;
  release_date: string;
  vote_average: number;
  genre_ids: number[];
}

export interface MovieDetails extends Movie {
  genres: { id: number; name: string }[];
  runtime: number;
  status: string;
  tagline: string;
  videos: {
    results: {
      id: string;
      key: string;
      name: string;
      site: string;
      type: string;
    }[];
  };
  credits: {
    cast: {
      id: number;
      name: string;
      character: string;
      profile_path: string;
    }[];
    crew: {
      id: number;
      name: string;
      job: string;
      department: string;
    }[];
  };
}

export interface MoviesResponse {
  page: number;
  results: Movie[];
  total_pages: number;
  total_results: number;
}
