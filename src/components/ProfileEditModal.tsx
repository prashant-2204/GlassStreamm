import React, { useEffect, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { userService, User } from "@/services/userService";

interface ProfileEditModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  user: User | null;
  onUserUpdate: (user: User) => void;
}

const ProfileEditModal: React.FC<ProfileEditModalProps> = ({
  open,
  onOpenChange,
  user,
  onUserUpdate,
}) => {
  const [username, setUsername] = useState("");
  const [profilePicture, setProfilePicture] = useState("");
  const [isUpdating, setIsUpdating] = useState(false);

  useEffect(() => {
    if (user) {
      setUsername(user.username || "");
      setProfilePicture(user.profilePicture || "");
    }
  }, [user]);

  const generateAvatar = () => {
    const newAvatarUrl = `https://ui-avatars.com/api/?name=${encodeURIComponent(
      username
    )}&background=random`;
    setProfilePicture(newAvatarUrl);
  };

  const handleSave = async () => {
    setIsUpdating(true);
    try {
      const updatedUser = await userService.updateProfile({
        username,
        profilePicture,
      });
      if (updatedUser) {
        onUserUpdate(updatedUser);
        onOpenChange(false);
      }
    } catch (error) {
      console.error("Failed to update profile:", error);
    } finally {
      setIsUpdating(false);
    }
  };

  if (!user) {
    return null; // or a loader if you want
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="glass-card sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Edit Profile</DialogTitle>
        </DialogHeader>

        <div className="flex flex-col items-center py-4">
          <Avatar className="h-24 w-24 mb-4">
            <AvatarImage src={profilePicture} alt={username} />
            <AvatarFallback>{username?.charAt(0) || "U"}</AvatarFallback>
          </Avatar>

          <Button variant="outline" onClick={generateAvatar} className="mb-6">
            Generate Random Avatar
          </Button>

          <div className="grid w-full items-center gap-4">
            <div className="flex flex-col space-y-2">
              <Label htmlFor="username">Username</Label>
              <Input
                id="username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Enter your username"
              />
            </div>

            <div className="flex flex-col space-y-2">
              <Label htmlFor="avatar">Avatar URL</Label>
              <Input
                id="avatar"
                value={profilePicture}
                onChange={(e) => setProfilePicture(e.target.value)}
                placeholder="https://example.com/avatar.png"
              />
              <p className="text-xs text-muted-foreground">
                Enter a direct URL to an image or use the generate button
              </p>
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button
            onClick={handleSave}
            disabled={isUpdating || !username.trim()}
          >
            {isUpdating ? "Saving..." : "Save Changes"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default ProfileEditModal;

