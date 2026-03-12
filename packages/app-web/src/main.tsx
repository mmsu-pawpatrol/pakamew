import { RouterProvider } from "@tanstack/react-router";
import { ThemeProvider } from "next-themes";
import ReactDOM from "react-dom/client";
import { DirectionProvider } from "./components/ui/direction";
import { Toaster } from "./components/ui/sonner";
import "./index.css";
import { ORPCProvider } from "./lib/orpc-provider";
import { QueryProvider } from "./lib/query-provider";
import { getRouter } from "./router";

function main() {
	const router = getRouter();

	const element = document.getElementById("app");
	if (!element) return;

	const root = ReactDOM.createRoot(element);
	root.render(
		<ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
			<DirectionProvider dir="ltr">
				<ORPCProvider>
					<QueryProvider>
						<RouterProvider router={router} />
						<Toaster />
					</QueryProvider>
				</ORPCProvider>
			</DirectionProvider>
		</ThemeProvider>,
	);
}

void main();
