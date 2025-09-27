import { useTheme } from "@/lib/theme";
import { Moon, Sun, Laptop } from "lucide-react";

export function ThemeToggle() {
  const { theme, setTheme, isDark } = useTheme();
  return (
    <div className="inline-flex items-center rounded-md border bg-background">
      <button
        aria-label="Light"
        className={`px-2 py-1 text-sm ${theme === "light" ? "bg-accent text-accent-foreground" : "text-muted-foreground"}`}
        onClick={() => setTheme("light")}
      >
        <Sun className="h-4 w-4" />
      </button>
      <button
        aria-label="System"
        className={`px-2 py-1 text-sm ${theme === "system" ? "bg-accent text-accent-foreground" : "text-muted-foreground"}`}
        onClick={() => setTheme("system")}
      >
        <Laptop className="h-4 w-4" />
      </button>
      <button
        aria-label="Dark"
        className={`px-2 py-1 text-sm ${theme === "dark" ? "bg-accent text-accent-foreground" : "text-muted-foreground"}`}
        onClick={() => setTheme("dark")}
      >
        <Moon className="h-4 w-4" />
      </button>
    </div>
  );
}
