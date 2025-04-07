import { toast } from "sonner";

// ✅ Set base URL for all API calls (use "" for relative paths)
const API_BASE_URL = "https://glassstream-production.up.railway.app/api";


// Type definitions
export interface User {
  _id: string;
  username: string;
  profilePicture: string;
  savedMovies: number[];
  likedMovies: number[];
}

export interface UserComment {
  _id: string;
  userId: string;
  movieId: number;
  content: string;
  username: string;
  profilePicture: string;
  createdAt: string;
}

// Check if API server is accessible
const checkServerConnection = async (): Promise<boolean> => {
  try {
    const response = await fetch(`${API_BASE_URL}/test`);
    const data = await response.json();
    return data.status === 'success';
  } catch (error) {
    console.error('Server connection check failed:', error);
    return false;
  }
};

// User service functions
export const userService = {
  currentUser: null as User | null,

  isAuthenticated: (): boolean => {
    if (userService.currentUser) return true;
    const storedUser = localStorage.getItem('currentUser');
    if (storedUser) {
      try {
        userService.currentUser = JSON.parse(storedUser);
        return true;
      } catch (error) {
        console.error('Error parsing stored user:', error);
      }
    }
    return false;
  },

  getCurrentUser: (): User => {
    if (!userService.currentUser) {
      const storedUser = localStorage.getItem('currentUser');
      if (storedUser) {
        try {
          userService.currentUser = JSON.parse(storedUser);
        } catch (error) {
          console.error('Error parsing stored user:', error);
        }
      }
    }
    return userService.currentUser as User;
  },

  login: async (username: string): Promise<User | null> => {
    try {
      const isServerConnected = await checkServerConnection();
      if (!isServerConnected) {
        toast.error("Cannot connect to the server. Please ensure the server is running.");
        return null;
      }

      const url = `${API_BASE_URL}/users/${encodeURIComponent(username)}`;
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
        },
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error(`Login failed with status ${response.status}:`, errorText);
        toast.error(`Login failed: ${response.statusText}`);
        return null;
      }

      const responseText = await response.text();
      const user = JSON.parse(responseText);

      userService.currentUser = user;
      localStorage.setItem('currentUser', JSON.stringify(user));
      toast.success(`Welcome, ${user.username}!`);
      return user;

    } catch (error) {
      console.error("Login error:", error);
      toast.error("Login failed due to an error");
      return null;
    }
  },

  logout: (): void => {
    userService.currentUser = null;
    localStorage.removeItem('currentUser');
    toast.info("Logged out successfully");
  },

  updateUser: async (userId: string, userData: Partial<User>): Promise<User | null> => {
    try {
      const response = await fetch(`${API_BASE_URL}/users/${userId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(userData),
      });

      if (!response.ok) {
        toast.error(`Update failed: ${response.statusText}`);
        return null;
      }

      const updatedUser = await response.json();
      userService.currentUser = updatedUser;
      localStorage.setItem('currentUser', JSON.stringify(updatedUser));
      toast.success("Profile updated successfully");
      return updatedUser;
    } catch (error) {
      console.error("Update user error:", error);
      toast.error("Failed to update profile");
      return null;
    }
  },

  updateProfile: async (userData: { username: string, profilePicture: string }): Promise<User | null> => {
    if (!userService.currentUser) {
      toast.error("You need to log in first");
      return null;
    }
    return userService.updateUser(userService.currentUser._id, userData);
  },

  toggleSavedMovie: async (userId: string, movieId: number): Promise<number[] | null> => {
    try {
      const response = await fetch(`${API_BASE_URL}/users/${userId}/saved/${movieId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        toast.error(`Failed to update saved movies: ${response.statusText}`);
        return null;
      }

      const savedMovies = await response.json();
      if (userService.currentUser) {
        userService.currentUser.savedMovies = savedMovies;
        localStorage.setItem('currentUser', JSON.stringify(userService.currentUser));
      }
      return savedMovies;
    } catch (error) {
      console.error("Toggle saved movie error:", error);
      toast.error("Failed to update saved movies");
      return null;
    }
  },

  toggleLikedMovie: async (userId: string, movieId: number): Promise<number[] | null> => {
    try {
      const response = await fetch(`${API_BASE_URL}/users/${userId}/liked/${movieId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        toast.error(`Failed to update liked movies: ${response.statusText}`);
        return null;
      }

      const likedMovies = await response.json();
      if (userService.currentUser) {
        userService.currentUser.likedMovies = likedMovies;
        localStorage.setItem('currentUser', JSON.stringify(userService.currentUser));
      }
      return likedMovies;
    } catch (error) {
      console.error("Toggle liked movie error:", error);
      toast.error("Failed to update liked movies");
      return null;
    }
  },

  isMovieSaved: (movieId: number): boolean => {
    return userService.currentUser?.savedMovies.includes(movieId) ?? false;
  },

  isMovieLiked: (movieId: number): boolean => {
    return userService.currentUser?.likedMovies.includes(movieId) ?? false;
  },

  toggleSaveMovie: (movieId: number): void => {
    if (!userService.currentUser) {
      toast.error("You need to log in first");
      return;
    }
    userService.toggleSavedMovie(userService.currentUser._id, movieId);
  },

  toggleLikeMovie: (movieId: number): void => {
    if (!userService.currentUser) {
      toast.error("You need to log in first");
      return;
    }
    userService.toggleLikedMovie(userService.currentUser._id, movieId);
  },

  getSavedMovies: (): number[] => {
    return userService.currentUser?.savedMovies ?? [];
  },

  getLikedMovies: (): number[] => {
    return userService.currentUser?.likedMovies ?? [];
  },

  getMovieComments: async (movieId: number): Promise<UserComment[]> => {
    try {
      const response = await fetch(`${API_BASE_URL}/movies/${movieId}/comments`);
      if (!response.ok) {
        console.error(`Failed to fetch comments: ${response.statusText}`);
        return [];
      }
      return await response.json();
    } catch (error) {
      console.error("Error fetching comments:", error);
      return [];
    }
  },

  addComment: async (movieId: number, content: string): Promise<UserComment | null> => {
    if (!userService.currentUser) {
      toast.error("You need to log in to comment");
      return null;
    }

    try {
      const response = await fetch(`${API_BASE_URL}/movies/${movieId}/comments`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId: userService.currentUser._id,
          username: userService.currentUser.username,
          profilePicture: userService.currentUser.profilePicture,
          content
        }),
      });

      if (!response.ok) {
        toast.error(`Failed to add comment: ${response.statusText}`);
        return null;
      }

      const newComment = await response.json();
      toast.success("Comment added successfully");
      return newComment;
    } catch (error) {
      console.error("Error adding comment:", error);
      toast.error("Failed to add comment");
      return null;
    }
  },

  deleteComment: async (commentId: string): Promise<boolean> => {
    if (!userService.currentUser) {
      toast.error("You need to log in to delete a comment");
      return false;
    }

    try {
      const response = await fetch(`${API_BASE_URL}/movies/comments/${commentId}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        toast.error(`Failed to delete comment: ${response.statusText}`);
        return false;
      }

      toast.success("Comment deleted successfully");
      return true;
    } catch (error) {
      console.error("Error deleting comment:", error);
      toast.error("Failed to delete comment");
      return false;
    }
  },
};

