import { useState } from "react";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import Dashboard from "./pages/Dashboard";
import Feeds from "./pages/Feeds";
import AiGenerator from "./pages/AiGenerator";
import Campaigns from "./pages/Campaigns";
import Export from "./pages/Export";
import Settings from "./pages/Settings";
import Sidebar from "./components/Sidebar";

export type Page = "dashboard" | "feeds" | "ai" | "campaigns" | "export" | "settings";

export default function App() {
  const [activePage, setActivePage] = useState<Page>("dashboard");

  const renderPage = () => {
    switch (activePage) {
      case "dashboard": return <Dashboard />;
      case "feeds": return <Feeds />;
      case "ai": return <AiGenerator />;
      case "campaigns": return <Campaigns />;
      case "export": return <Export />;
      case "settings": return <Settings />;
    }
  };

  return (
    <TooltipProvider>
      <Toaster />
      <div className="flex h-screen bg-background overflow-hidden">
        <Sidebar activePage={activePage} onNavigate={setActivePage} />
        <main className="flex-1 overflow-y-auto relative">
          {/* Background ambience */}
          <div className="fixed inset-0 pointer-events-none overflow-hidden">
            <div
              className="absolute top-[-20%] right-[-10%] w-[600px] h-[600px] rounded-full opacity-[0.05]"
              style={{ background: 'radial-gradient(circle, hsl(185,100%,55%), transparent 70%)' }}
            />
            <div
              className="absolute bottom-[-10%] left-[20%] w-[500px] h-[500px] rounded-full opacity-[0.05]"
              style={{ background: 'radial-gradient(circle, hsl(260,80%,65%), transparent 70%)' }}
            />
            <div
              className="absolute top-[40%] left-[-5%] w-[400px] h-[400px] rounded-full opacity-[0.03]"
              style={{ background: 'radial-gradient(circle, hsl(30,100%,60%), transparent 70%)' }}
            />
          </div>
          <div className="relative z-10">
            {renderPage()}
          </div>
        </main>
      </div>
    </TooltipProvider>
  );
}
