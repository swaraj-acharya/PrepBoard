"use client";
import { usePathname } from "next/navigation";
import Nav from "@/components/Nav";
import { DrawerProvider } from "@/components/Drawer";
import { DataProvider } from "@/lib/data";
import GitHubSync from "@/components/GitHubSync";

// The sign-in page gets a bare layout: no menu, no data loading, no GitHub sync.
export default function Shell({ children }) {
  if (usePathname() === "/login") return <main className="auth-main">{children}</main>;
  return (
    <DataProvider>
      <GitHubSync />
      <DrawerProvider>
        <Nav />
        <main className="main">{children}</main>
      </DrawerProvider>
    </DataProvider>
  );
}
