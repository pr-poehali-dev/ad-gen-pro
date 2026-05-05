import { Page } from "@/App";
import RolesTabsSection from "./sections/RolesTabsSection";
import IntegrationsSection from "./sections/IntegrationsSection";
import CasesSection from "./sections/CasesSection";

interface AgentSectionsProps {
  onNavigate: (page: Page) => void;
}

export default function AgentSections({ onNavigate }: AgentSectionsProps) {
  return (
    <>
      <RolesTabsSection onNavigate={onNavigate} />
      <IntegrationsSection />
      <CasesSection onNavigate={onNavigate} />
    </>
  );
}
