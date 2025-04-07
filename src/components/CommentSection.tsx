
import { useState, useEffect } from "react";
import { UserComment, userService } from "@/services/userService";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { format } from "date-fns";
import { Trash2 } from "lucide-react";
import LoginModal from "./LoginModal";

interface CommentSectionProps {
  movieId: number;
}

const CommentSection = ({ movieId }: CommentSectionProps) => {
  const [comments, setComments] = useState<UserComment[]>([]);
  const [newComment, setNewComment] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [loginModalOpen, setLoginModalOpen] = useState(false);
  
  const currentUser = userService.getCurrentUser();
  const isAuthenticated = userService.isAuthenticated();

  useEffect(() => {
    const fetchComments = async () => {
      setIsLoading(true);
      const fetchedComments = await userService.getMovieComments(movieId);
      setComments(fetchedComments);
      setIsLoading(false);
    };
    
    fetchComments();
  }, [movieId]);
  
  const handleSubmitComment = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!newComment.trim() || isSubmitting) return;
    
    if (!isAuthenticated) {
      setLoginModalOpen(true);
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      const addedComment = await userService.addComment(movieId, newComment.trim());
      
      if (addedComment) {
        // Add the new comment to the list
        setComments(prev => [addedComment, ...prev]);
        setNewComment("");
      }
    } catch (error) {
      console.error("Error adding comment:", error);
    } finally {
      setIsSubmitting(false);
    }
  };
  
  const handleDeleteComment = async (commentId: string) => {
    const success = await userService.deleteComment(commentId);
    
    if (success) {
      // Remove the deleted comment from the list
      setComments(prev => prev.filter(comment => comment._id !== commentId));
    }
  };
  
  const formatDate = (dateString: string) => {
    try {
      return format(new Date(dateString), "MMM d, yyyy 'at' h:mm a");
    } catch (e) {
      return "Invalid date";
    }
  };
  
  const handleLoginSuccess = () => {
    // If we were trying to add a comment, submit it now
    if (newComment.trim()) {
      handleSubmitComment({ preventDefault: () => {} } as React.FormEvent);
    }
  };
  
  return (
    <div className="mt-12">
      <h3 className="text-2xl font-semibold mb-4">Comments</h3>
      
      <form onSubmit={handleSubmitComment} className="mb-8">
        <div className="flex items-start gap-3">
          <Avatar className="h-10 w-10">
            <AvatarImage src={currentUser.profilePicture} alt={currentUser.username} />
            <AvatarFallback>{currentUser.username.charAt(0).toUpperCase()}</AvatarFallback>
          </Avatar>
          <div className="flex-1 space-y-2">
            <Textarea
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              placeholder={isAuthenticated ? "Add a comment..." : "Log in to add a comment..."}
              className="min-h-[80px] bg-background/50"
            />
            <div className="flex justify-end">
              <Button
                type="submit"
                disabled={!newComment.trim() || isSubmitting}
              >
                {isSubmitting ? "Posting..." : "Post Comment"}
              </Button>
            </div>
          </div>
        </div>
      </form>
      
      {isLoading ? (
        <div className="space-y-4">
          {[1, 2, 3].map((_, i) => (
            <div key={i} className="flex gap-3 animate-pulse">
              <div className="h-10 w-10 rounded-full bg-muted"></div>
              <div className="flex-1 space-y-2">
                <div className="h-4 w-1/4 bg-muted rounded"></div>
                <div className="h-3 w-1/5 bg-muted/60 rounded"></div>
                <div className="h-4 w-full bg-muted rounded"></div>
              </div>
            </div>
          ))}
        </div>
      ) : comments.length > 0 ? (
        <div className="space-y-6">
          {comments.map((comment) => (
            <div key={comment._id} className="flex gap-3">
              <Avatar className="h-10 w-10">
                <AvatarImage src={comment.profilePicture} alt={comment.username} />
                <AvatarFallback>{comment.username.charAt(0).toUpperCase()}</AvatarFallback>
              </Avatar>
              <div className="flex-1">
                <div className="flex justify-between items-start">
                  <div>
                    <h4 className="text-sm font-medium">{comment.username}</h4>
                    <p className="text-xs text-muted-foreground">
                      {formatDate(comment.createdAt)}
                    </p>
                  </div>
                  
                  {isAuthenticated && comment.userId === currentUser._id && (
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleDeleteComment(comment._id)}
                      className="h-8 w-8"
                    >
                      <Trash2 className="h-4 w-4 text-muted-foreground" />
                    </Button>
                  )}
                </div>
                <p className="mt-2">{comment.content}</p>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-8">
          <p className="text-muted-foreground">No comments yet. Be the first to comment!</p>
        </div>
      )}
      
      <LoginModal 
        isOpen={loginModalOpen} 
        onClose={() => setLoginModalOpen(false)}
        onSuccess={handleLoginSuccess}
      />
    </div>
  );
};

export default CommentSection;
