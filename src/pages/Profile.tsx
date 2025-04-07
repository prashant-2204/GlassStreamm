import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { User, Film, Heart, Settings } from "lucide-react";
import NavBar from "@/components/NavBar";
import ProfileEditModal from "@/components/ProfileEditModal";
import { userService, User as UserType } from "@/services/userService";

const Profile = () => {
  const [user, setUser] = useState<UserType | null>(userService.getCurrentUser());
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [imageError, setImageError] = useState(false);

  if (!user) {
    return (
      <div className="min-h-screen">
        <NavBar />
        <div className="flex justify-center items-center h-[80vh]">
          <p className="text-muted-foreground text-lg">Please log in to view your profile.</p>
        </div>
      </div>
    );
  }

  const savedMoviesCount = userService.getSavedMovies().length;
  const likedMoviesCount = userService.getLikedMovies().length;

  const handleUserUpdate = (updatedUser: UserType) => {
    setUser(updatedUser);
    setImageError(false);
  };

  return (
    <div className="min-h-screen">
      <NavBar />

      <main className="container px-4 py-6 max-w-7xl mx-auto">
        <Card className="glass-card p-6 mb-8">
          <div className="flex flex-col md:flex-row items-start md:items-center gap-6">
            <Avatar className="h-24 w-24 border-2 border-primary">
              {!imageError && user?.profilePicture ? (
                <AvatarImage
                  src={user.profilePicture}
                  alt={user.username}
                  onError={() => setImageError(true)}
                />
              ) : (
                <AvatarFallback>{user?.username?.charAt(0).toUpperCase() || "?"}</AvatarFallback>
              )}
            </Avatar>

            <div className="flex-1">
              <h1 className="text-3xl font-bold mb-2">{user.username}</h1>
              <div className="flex flex-wrap gap-4 text-sm text-muted-foreground mb-4">
                <div className="flex items-center gap-1">
                  <Film className="h-4 w-4" />
                  <span>{savedMoviesCount} Saved Movies</span>
                </div>
                <div className="flex items-center gap-1">
                  <Heart className="h-4 w-4" />
                  <span>{likedMoviesCount} Liked Movies</span>
                </div>
              </div>

              <Button
                className="flex items-center gap-2"
                onClick={() => setIsEditModalOpen(true)}
              >
                <Settings className="h-4 w-4" />
                Edit Profile
              </Button>
            </div>
          </div>
        </Card>

        <Tabs defaultValue="activity" className="mb-8">
          <TabsList>
            <TabsTrigger value="activity" className="flex items-center gap-2">
              <User className="h-4 w-4" />
              <span>Activity</span>
            </TabsTrigger>
            <TabsTrigger value="preferences" className="flex items-center gap-2">
              <Settings className="h-4 w-4" />
              <span>Preferences</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="activity" className="py-4">
            <h2 className="text-2xl font-semibold mb-4">Recent Activity</h2>
            <div className="space-y-4">
              <Card className="p-4 glass-card">
                <p className="text-lg">
                  Visit your{" "}
                  <a href="/saved" className="text-primary hover:underline">
                    Saved Movies
                  </a>{" "}
                  to see your collection
                </p>
              </Card>
              <Card className="p-4 glass-card">
                <h3 className="text-lg font-medium mb-2">Top Movie Genres</h3>
                <p className="text-muted-foreground">
                  Keep watching and liking movies to build your personalized recommendations!
                </p>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="preferences" className="py-4">
            <h2 className="text-2xl font-semibold mb-4">App Preferences</h2>
            <Card className="p-6 glass-card">
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-medium mb-2">Profile Settings</h3>
                  <p className="text-muted-foreground mb-3">
                    Customize how your profile appears to others
                  </p>
                  <Button variant="outline" onClick={() => setIsEditModalOpen(true)}>
                    Edit Profile
                  </Button>
                </div>
                <div>
                  <h3 className="text-lg font-medium mb-2">App Theme</h3>
                  <p className="text-muted-foreground mb-3">
                    The app currently uses a dark theme with glass-like elements
                  </p>
                </div>
              </div>
            </Card>
          </TabsContent>
        </Tabs>
      </main>

      <ProfileEditModal
        open={isEditModalOpen}
        onOpenChange={setIsEditModalOpen}
        user={user}
        onUserUpdate={handleUserUpdate}
      />
    </div>
  );
};

export default Profile;

