import { useEffect, useState } from "react";
import Icon from "@/components/ui/icon";
import { useToast } from "@/hooks/use-toast";
import { ydApi } from "./api";
import { emptyAd, emptyGroup, emptyCampaign } from "./types";
import type { YdCampaign } from "./types";
import { WizardHeader, WizardStepsBar, WizardFooter } from "./YdWizardLayout";
import { Step1, Step2 } from "./YdWizardSteps12";
import { Step3, Step4 } from "./YdWizardSteps34";
import { Step5, Step6 } from "./YdWizardSteps56";

interface Props {
  campaignId: number;
  onClose: () => void;
}

export default function YdWizard({ campaignId, onClose }: Props) {
  const { toast } = useToast();
  const [c, setC] = useState<YdCampaign | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [activeGroupIdx, setActiveGroupIdx] = useState(0);

  useEffect(() => {
    ydApi.get(campaignId)
      .then((d) => {
        const initial: YdCampaign = {
          ...emptyCampaign(),
          ...d,
          groups: (d.groups && d.groups.length > 0) ? d.groups.map((g) => ({
            ...emptyGroup(),
            ...g,
            ads: g.ads && g.ads.length > 0 ? g.ads : [emptyAd()],
            keywords: g.keywords || [],
          })) : [emptyGroup(1)],
        };
        setC(initial);
      })
      .catch((e) => toast({ title: "Ошибка загрузки", description: String(e) }))
      .finally(() => setLoading(false));
  }, [campaignId, toast]);

  const setStep = (n: number) => {
    if (!c) return;
    setC({ ...c, step: n });
  };

  const save = async (close = false) => {
    if (!c) return;
    setSaving(true);
    try {
      await ydApi.save({ ...c, id: campaignId });
      toast({ title: "Сохранено", description: `Шаг ${c.step}/6` });
      if (close) onClose();
    } catch (e) {
      toast({ title: "Ошибка сохранения", description: String(e) });
    } finally {
      setSaving(false);
    }
  };

  const next = async () => {
    if (!c) return;
    const newStep = Math.min(6, c.step + 1);
    setC({ ...c, step: newStep });
    await save();
  };

  const prev = () => {
    if (!c) return;
    setC({ ...c, step: Math.max(1, c.step - 1) });
  };

  if (loading || !c) {
    return (
      <div className="flex items-center justify-center py-20">
        <Icon name="Loader2" size={32} className="animate-spin text-neon-cyan" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <WizardHeader c={c} setC={setC} onClose={onClose} saving={saving} save={save} />

      <WizardStepsBar c={c} setStep={setStep} />

      <div className="glass rounded-2xl p-4 md:p-6">
        {c.step === 1 && <Step1 c={c} setC={setC} />}
        {c.step === 2 && <Step2 c={c} setC={setC} activeGroupIdx={activeGroupIdx} setActiveGroupIdx={setActiveGroupIdx} />}
        {c.step === 3 && <Step3 c={c} setC={setC} activeGroupIdx={activeGroupIdx} setActiveGroupIdx={setActiveGroupIdx} />}
        {c.step === 4 && <Step4 c={c} setC={setC} activeGroupIdx={activeGroupIdx} setActiveGroupIdx={setActiveGroupIdx} />}
        {c.step === 5 && <Step5 c={c} setC={setC} />}
        {c.step === 6 && <Step6 c={c} setC={setC} />}
      </div>

      <WizardFooter c={c} saving={saving} next={next} prev={prev} />
    </div>
  );
}
