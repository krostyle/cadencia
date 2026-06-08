"use client";

import { useState } from "react";
import { UserButton } from "@clerk/nextjs";
import { HelpCircle } from "lucide-react";
import { HelpTour } from "./HelpTour";

interface TopBarProps {
  title: string;
}

export default function TopBar({ title }: TopBarProps) {
  const [helpOpen, setHelpOpen] = useState(false);

  return (
    <>
      <header className="fixed top-0 left-0 right-0 z-50 h-14 bg-background/80 backdrop-blur-sm border-b flex items-center justify-between px-4">
        <span className="font-semibold text-lg tracking-tight">{title}</span>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setHelpOpen(true)}
            className="w-8 h-8 flex items-center justify-center rounded-full text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
            aria-label="Ayuda"
          >
            <HelpCircle size={20} />
          </button>
          <UserButton />
        </div>
      </header>
      <HelpTour open={helpOpen} onOpenChange={setHelpOpen} />
    </>
  );
}
