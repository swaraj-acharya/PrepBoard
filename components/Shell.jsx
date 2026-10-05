"use client";
import { usePathname } from "next/navigation";
import Nav from "@/components/Nav";
import { DrawerProvider } from "@/components/Drawer";
import { DataProvider } from "@/lib/data";
import LocalSync from "@/components/LocalSync";
import Celebrate from "@/components/Celebrate";

// The sign-in page gets a bare layout: no menu, no data loading, no saving to your repo folder.
export default function Shell({ children }) {
  if (usePathname() === "/login") return <main className="auth-main">{children}</main>;
  return (
    <DataProvider>
      <LocalSync />
      <DrawerProvider>
        <Nav />
        <main className="main">{children}</main>
        <Celebrate />
      </DrawerProvider>
    </DataProvider>
  );
}
