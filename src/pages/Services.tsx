import { useState } from "react";
import { Page } from "@/App";
import { useToast } from "@/hooks/use-toast";
import { reachGoal } from "@/lib/metrika";
import { readUtm } from "@/lib/utm";
import SubscriptionPlans from "@/components/SubscriptionPlans";
import func2url from "../../backend/func2url.json";
import { Service, RequestForm } from "./services/types";
import ServicesHero from "./services/ServicesHero";
import ServicesGrid from "./services/ServicesGrid";
import ServicesExtras from "./services/ServicesExtras";
import RequestModal from "./services/RequestModal";

const ADMIN_URL = (func2url as Record<string, string>).admin;

interface ServicesProps {
  onNavigate: (page: Page) => void;
}

export default function Services({ onNavigate }: ServicesProps) {
  const { toast } = useToast();
  const [requestedIds, setRequestedIds] = useState<Set<string>>(() => {
    if (typeof window === "undefined") return new Set();
    try {
      return new Set(JSON.parse(localStorage.getItem("matad_requested_services") || "[]"));
    } catch {
      return new Set();
    }
  });
  const [activeService, setActiveService] = useState<Service | null>(null);
  const [form, setForm] = useState<RequestForm>({ name: "", phone: "", email: "", comment: "" });
  const [submitting, setSubmitting] = useState(false);

  const requestService = (s: Service) => {
    setActiveService(s);
    setForm({ name: "", phone: "", email: "", comment: "" });
    reachGoal("lead_form_open", { service: s.id });
  };

  const submitRequest = async () => {
    if (!activeService) return;
    if (!form.name.trim() || (!form.phone.trim() && !form.email.trim())) {
      toast({ title: "Заполните контакты", description: "Имя и телефон или email обязательны" });
      return;
    }
    setSubmitting(true);
    const utm = readUtm();
    const next = new Set(requestedIds).add(activeService.id);
    setRequestedIds(next);
    try {
      localStorage.setItem("matad_requested_services", JSON.stringify(Array.from(next)));
      const all = JSON.parse(localStorage.getItem("matad_leads") || "[]");
      all.push({
        service: activeService.title,
        ...form,
        utm,
        createdAt: new Date().toISOString(),
      });
      localStorage.setItem("matad_leads", JSON.stringify(all));
    } catch {/* noop */}
    try {
      await fetch(`${ADMIN_URL}?action=submit_lead`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: form.name,
          phone: form.phone,
          email: form.email,
          comment: form.comment,
          service: activeService.title,
          source: "website",
          utm,
        }),
      });
    } catch {/* noop — лид останется в localStorage */}
    reachGoal("lead_form_submit", { service: activeService.id });
    reachGoal("service_request", { service: activeService.id });
    toast({ title: "Заявка отправлена", description: `Менеджер свяжется по «${activeService.title}» в течение 30 минут` });
    setSubmitting(false);
    setActiveService(null);
  };

  return (
    <div className="p-4 md:p-8 pt-16 md:pt-8 animate-fade-in relative">
      <ServicesHero />

      <SubscriptionPlans />

      <ServicesGrid requestedIds={requestedIds} onRequest={requestService} />

      <ServicesExtras onNavigate={onNavigate} />

      <RequestModal
        activeService={activeService}
        form={form}
        setForm={setForm}
        submitting={submitting}
        onClose={() => setActiveService(null)}
        onSubmit={submitRequest}
      />
    </div>
  );
}
