"use client";

import { UserButton } from "@clerk/nextjs";

interface TopBarProps {
  title: string;
}

export default function TopBar({ title }: TopBarProps) {
  return (
    <header className="fixed top-0 left-0 right-0 z-50 h-14 bg-background/80 backdrop-blur-sm border-b flex items-center justify-between px-4">
      <span className="font-semibold text-lg tracking-tight">{title}</span>
      <UserButton />
    </header>
  );
}
