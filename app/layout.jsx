import "./globals.css";
import Nav from "@/components/Nav";
import { DrawerProvider } from "@/components/Drawer";
import { DataProvider } from "@/lib/data";
import GitHubSync from "@/components/GitHubSync";

export const metadata = { title: "Prepboard", description: "My DSA path, system design, company questions and revision tracker." };

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        <link href="https://fonts.googleapis.com/css2?family=Bricolage+Grotesque:opsz,wght@12..96,500;12..96,700&family=Figtree:wght@400;500;600&display=swap" rel="stylesheet" />
      </head>
      <body suppressHydrationWarning>
        <DataProvider>
        <GitHubSync />
        <DrawerProvider>
          <Nav />
          <main className="main">{children}</main>
        </DrawerProvider>
        </DataProvider>
      </body>
    </html>
  );
}
