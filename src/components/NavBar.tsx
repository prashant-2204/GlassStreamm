import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Search, User, Bookmark, Home, Film, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { cn } from "@/lib/utils";
import { useIsMobile } from "@/hooks/use-mobile";
import { userService } from "@/services/userService";
import LoginModal from "./LoginModal";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

const NavBar = () => {
  const isMobile = useIsMobile();
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");
  const [loginModalOpen, setLoginModalOpen] = useState(false);

  const currentUser = userService.getCurrentUser();
  const isAuthenticated = userService.isAuthenticated();
  const fallbackInitial = currentUser?.username?.charAt(0)?.toUpperCase() || "U";

  const handleSearch = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/search?query=${encodeURIComponent(searchQuery.trim())}`);
      setSearchQuery("");
    }
  };

  const handleLogin = () => {
    setLoginModalOpen(true);
  };

  const handleLogout = () => {
    userService.logout();
    window.location.reload();
  };

  const NavItems = () => (
    <div className={cn("flex flex-col gap-1 w-full", !isMobile && "flex-row items-center")}>
      <Link to="/" className="w-full">
        <Button variant="ghost" className="w-full justify-start" aria-label="Home">
          <Home className="mr-2 h-5 w-5" />
          Home
        </Button>
      </Link>
      <Link to="/saved" className="w-full">
        <Button variant="ghost" className="w-full justify-start" aria-label="Saved Movies">
          <Bookmark className="mr-2 h-5 w-5" />
          Saved
        </Button>
      </Link>
      <Link to="/movies" className="w-full">
        <Button variant="ghost" className="w-full justify-start" aria-label="Movies">
          <Film className="mr-2 h-5 w-5" />
          Movies
        </Button>
      </Link>
      <Link to="/profile" className="w-full">
        <Button variant="ghost" className="w-full justify-start" aria-label="Profile">
          <User className="mr-2 h-5 w-5" />
          Profile
        </Button>
      </Link>
    </div>
  );

  return (
    <>
      <header className="sticky top-0 z-40 w-full backdrop-blur-lg bg-background/80 border-b">
        <div className="container flex items-center justify-between h-16 px-4 max-w-7xl mx-auto">
          <div className="flex items-center">
            <Link to="/" className="flex items-center">
              <span className="text-gradient text-xl font-bold">GlassStream</span>
            </Link>
          </div>

          <div className="hidden md:flex md:flex-1 md:justify-center px-4">
            <form onSubmit={handleSearch} className="w-full max-w-sm">
              <div className="relative">
                <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  aria-label="Search movies"
                  placeholder="Search movies..."
                  className="w-full pl-10 bg-secondary/50"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
            </form>
          </div>

          <div className="hidden md:flex items-center gap-2">
            <NavItems />
            {isAuthenticated && currentUser ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="relative h-10 w-10 rounded-full" aria-label="User Menu">
                    <Avatar className="h-10 w-10">
                      <AvatarImage src={currentUser?.profilePicture} alt={currentUser.username} />
                      <AvatarFallback>{fallbackInitial}</AvatarFallback>
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="glass-card w-56">
                  <div className="flex items-center justify-start gap-2 p-2">
                    <Avatar className="h-8 w-8">
                      <AvatarImage src={currentUser?.profilePicture} alt={currentUser.username} />
                      <AvatarFallback>{fallbackInitial}</AvatarFallback>
                    </Avatar>
                    <div className="flex flex-col space-y-0.5">
                      <p className="text-sm font-medium">{currentUser.username}</p>
                    </div>
                  </div>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem asChild>
                    <Link to="/profile" className="cursor-pointer">Profile</Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link to="/saved" className="cursor-pointer">Saved Movies</Link>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem className="cursor-pointer" onClick={handleLogout}>
                    <LogOut className="mr-2 h-4 w-4" />
                    <span>Log out</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <Button variant="secondary" onClick={handleLogin}>
                Log In
              </Button>
            )}
          </div>

          {isMobile && (
            <div className="flex md:hidden items-center gap-2">
              <form onSubmit={handleSearch} className="relative">
                <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  aria-label="Search"
                  placeholder="Search..."
                  className="w-[150px] sm:w-[200px] pl-10 bg-secondary/50"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </form>

              <Sheet>
                <SheetTrigger asChild>
                  <Button variant="ghost" size="icon" className="ml-2" aria-label="Open Menu">
                    {isAuthenticated && currentUser ? (
                      <Avatar className="h-8 w-8">
                        <AvatarImage src={currentUser?.profilePicture} alt={currentUser.username} />
                        <AvatarFallback>{fallbackInitial}</AvatarFallback>
                      </Avatar>
                    ) : (
                      <User className="h-5 w-5" />
                    )}
                  </Button>
                </SheetTrigger>
                <SheetContent side="right" className="w-[250px] glass-card">
                  <div className="py-6">
                    {isAuthenticated && currentUser ? (
                      <div className="flex items-center gap-3 mb-6">
                        <Avatar className="h-10 w-10">
                          <AvatarImage src={currentUser?.profilePicture} alt={currentUser.username} />
                          <AvatarFallback>{fallbackInitial}</AvatarFallback>
                        </Avatar>
                        <div>
                          <h3 className="font-medium">{currentUser.username}</h3>
                        </div>
                      </div>
                    ) : (
                      <div className="mb-6">
                        <Button variant="default" className="w-full mb-2" onClick={handleLogin}>
                          Log In
                        </Button>
                      </div>
                    )}

                    <h2 className="text-lg font-semibold mb-4">Menu</h2>
                    <NavItems />

                    {isAuthenticated && (
                      <Button
                        variant="outline"
                        className="w-full mt-4 justify-start"
                        onClick={handleLogout}
                      >
                        <LogOut className="mr-2 h-5 w-5" />
                        Log Out
                      </Button>
                    )}
                  </div>
                </SheetContent>
              </Sheet>
            </div>
          )}
        </div>
      </header>

      <LoginModal isOpen={loginModalOpen} onClose={() => setLoginModalOpen(false)} />
    </>
  );
};

export default NavBar;

