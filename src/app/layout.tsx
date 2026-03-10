import { Metadata, Viewport } from "next";
import { ThemeProvider } from "../lib/theme";
import "../../styles/global.css";

export const metadata: Metadata = {
  title: "Remotion Studio",
  description:
    "Authenticated Remotion workspaces with reusable project assets and Vercel-backed renders.",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="bg-background text-foreground">
        <ThemeProvider>{children}</ThemeProvider>
      </body>
    </html>
  );
}
