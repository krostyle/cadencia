import TopBar from "./TopBar";
import BottomNav from "./BottomNav";

interface AppShellProps {
  children: React.ReactNode;
  title?: string;
}

export default function AppShell({ children, title = "Cadencia" }: AppShellProps) {
  return (
    <div className="min-h-screen bg-background">
      <TopBar title={title} />
      <main className="pt-14 pb-20 px-4 max-w-lg mx-auto">{children}</main>
      <BottomNav />
    </div>
  );
}
