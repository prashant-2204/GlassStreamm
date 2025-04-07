import { Outlet } from "react-router-dom";

const Layout = () => {
  return (
    <div className="min-h-screen flex flex-col">
      <main className="flex-1 container px-4 py-6 max-w-7xl mx-auto">
        <Outlet />
      </main>
      <footer className="text-center py-4 text-sm text-muted-foreground">
        made with ❤️ by <a href="https://github.com/prashant-2204" target="_blank" rel="noopener noreferrer" className="underline underline-offset-2">github/prashant-2204</a>
      </footer>
    </div>
  );
};

export default Layout;

