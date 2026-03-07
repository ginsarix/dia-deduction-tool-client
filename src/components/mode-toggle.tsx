import { MonitorIcon, Moon, MoonIcon, Sun, SunIcon } from "lucide-react";
import { useTheme } from "@/components/theme-provider";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";

export function ModeToggle() {
  const { setTheme, theme } = useTheme();

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon">
          <Sun className="h-[1.2rem] w-[1.2rem] scale-100 rotate-0 transition-all dark:scale-0 dark:-rotate-90" />
          <Moon className="absolute h-[1.2rem] w-[1.2rem] scale-0 rotate-90 transition-all dark:scale-100 dark:rotate-0" />
          <span className="sr-only">Tema değiştir</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem
          className={cn(theme === "light" && "bg-accent")}
          onClick={() => setTheme("light")}
        >
          <SunIcon /> Açık
        </DropdownMenuItem>
        <DropdownMenuItem
          className={cn(theme === "dark" && "bg-accent")}
          onClick={() => setTheme("dark")}
        >
          <MoonIcon /> Koyu
        </DropdownMenuItem>
        <DropdownMenuItem
          className={cn(theme === "system" && "bg-accent")}
          onClick={() => setTheme("system")}
        >
          <MonitorIcon /> Sistem
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
