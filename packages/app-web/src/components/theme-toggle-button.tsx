import { Button } from "@/components/ui/button";
import { MoonIcon, SunIcon } from "lucide-react";
import { useTheme } from "next-themes";

export function ThemeToggleButton() {
	const { resolvedTheme, setTheme } = useTheme();
	const isDarkTheme = resolvedTheme === "dark";
	const ariaLabel = isDarkTheme ? "Switch to light theme" : "Switch to dark theme";

	return (
		<Button
			type="button"
			variant="ghost"
			size="icon-lg"
			className="rounded-full"
			aria-label={ariaLabel}
			onClick={() => setTheme(isDarkTheme ? "light" : "dark")}>
			{!isDarkTheme ? <SunIcon /> : <MoonIcon />}
		</Button>
	);
}
