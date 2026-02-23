import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { firestore } from "@/integrations/firebase/client";
import { collection, query, where, orderBy, getDocs } from "firebase/firestore";
import { Button } from "@/components/ui/button";
import { Download, Lock, Eye, MessageCircle, Phone, Star, Filter } from "lucide-react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";

interface Props {
  shop: any | null;
  userPlan: string;
}

const AnalyzeAdvanced = ({ shop, userPlan }: Props) => {
  const [period, setPeriod] = useState<"7d" | "30d" | "all">("30d");

  const { data: events = [] } = useQuery({
    queryKey: ["analytics-events", shop?.id, period],
    queryFn: async () => {
      if (!shop) return [];
      let q = query(
        collection(firestore, "analytics_events"),
        where("shop_id", "==", shop.id),
        orderBy("created_at", "desc")
      );
      if (period === "7d") {
        const d = new Date();
        d.setDate(d.getDate() - 7);
        q = query(q, where("created_at", ">=", d));
      } else if (period === "30d") {
        const d = new Date();
        d.setDate(d.getDate() - 30);
        q = query(q, where("created_at", ">=", d));
      }
      const snap = await getDocs(q);
      return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
    },
    enabled: !!shop && userPlan !== "free",
  });

  if (userPlan === "free") {
    return (
      <div>
        <h1 className="text-2xl font-display font-bold text-foreground mb-1">Analytics</h1>
        <p className="text-muted-foreground text-sm mb-8">Detailed shop analytics</p>
        <div className="text-center py-20">
          <Lock size={48} className="mx-auto text-muted-foreground/30 mb-4" />
          <p className="text-muted-foreground mb-4">Advanced analytics is a Pro feature.</p>
          <Link to="/pricing">
            <Button variant="hero">Upgrade to Pro</Button>
          </Link>
        </div>
      </div>
    );
  }

  const views = events.filter((e) => e.event_type === "view").length;
  const whatsapp = events.filter((e) => e.event_type === "whatsapp_click").length;
  const phone = events.filter((e) => e.event_type === "phone_click").length;

  const exportCSV = () => {
    const csv = ["Date,Event Type", ...events.map((e) => `${e.created_at},${e.event_type}`)].join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `analytics-${period}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const cards = [
    { label: "Shop Views", value: views, icon: Eye },
    { label: "WhatsApp Clicks", value: whatsapp, icon: MessageCircle },
    { label: "Phone Clicks", value: phone, icon: Phone },
  ];

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-display font-bold text-foreground mb-1">Analytics</h1>
          <p className="text-muted-foreground text-sm">Detailed shop performance</p>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex bg-muted rounded-lg p-1">
            {(["7d", "30d", "all"] as const).map((p) => (
              <button key={p} onClick={() => setPeriod(p)} className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${period === p ? "bg-background text-foreground shadow-sm" : "text-muted-foreground"}`}>
                {p === "7d" ? "7 Days" : p === "30d" ? "30 Days" : "All Time"}
              </button>
            ))}
          </div>
          <Button variant="outline" size="sm" onClick={exportCSV}>
            <Download size={14} className="mr-1" /> Export
          </Button>
        </div>
      </div>

      {!shop ? (
        <p className="text-center text-muted-foreground py-12">Create a shop first to see analytics.</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {cards.map((card, i) => (
            <motion.div
              key={card.label}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.08 }}
              className="p-5 rounded-xl bg-card-gradient border border-border/50 shadow-soft"
            >
              <card.icon size={20} className="text-primary mb-3" />
              <p className="text-3xl font-display font-bold text-foreground">{card.value}</p>
              <p className="text-sm text-muted-foreground mt-1">{card.label}</p>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
};

export default AnalyzeAdvanced;
