import { useLocation, Link } from "react-router-dom";
import { useEffect } from "react";

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    console.error(
      "404 Error: User attempted to access non-existent route:",
      location.pathname,
    );
  }, [location.pathname]);

  return (
    <div className="flex min-h-[60vh] items-center justify-center">
      <div className="text-center">
        <h1 className="text-5xl font-extrabold">404</h1>
        <p className="mt-2 text-muted-foreground">Oops! Page not found</p>
        <Link to="/" className="mt-4 inline-block rounded-md border px-4 py-2 hover:bg-accent">Return to Home</Link>
      </div>
    </div>
  );
};

export default NotFound;
