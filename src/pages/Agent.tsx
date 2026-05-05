import { useState, useEffect } from "react";
import { Page } from "@/App";
import AgentHero from "./agent/AgentHero";
import AgentSections from "./agent/AgentSections";
import AgentCalculator from "./agent/AgentCalculator";
import AgentFooter from "./agent/AgentFooter";

interface AgentProps {
  onNavigate: (page: Page) => void;
}

export default function Agent({ onNavigate }: AgentProps) {
  const [showStickyCTA, setShowStickyCTA] = useState(false);

  useEffect(() => {
    const onScroll = () => setShowStickyCTA(window.scrollY > 600);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <div className="relative">
      {/* Animated background */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden -z-10">
        <div className="absolute top-[-10%] right-[-5%] w-[700px] h-[700px] rounded-full opacity-[0.25] animate-pulse-slow"
          style={{ background: "radial-gradient(circle, hsl(185,100%,55%), transparent 70%)" }} />
        <div className="absolute bottom-[-5%] left-[-10%] w-[600px] h-[600px] rounded-full opacity-[0.22] animate-pulse-slow"
          style={{ background: "radial-gradient(circle, hsl(260,80%,65%), transparent 70%)", animationDelay: "1s" }} />
        <div className="absolute top-[40%] left-[40%] w-[400px] h-[400px] rounded-full opacity-[0.18]"
          style={{ background: "radial-gradient(circle, hsl(320,80%,65%), transparent 70%)" }} />
      </div>

      <AgentHero onNavigate={onNavigate} />
      <AgentSections onNavigate={onNavigate} />
      <AgentCalculator />
      <AgentFooter onNavigate={onNavigate} showStickyCTA={showStickyCTA} />
    </div>
  );
}
