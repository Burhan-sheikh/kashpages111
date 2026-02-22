import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Eye, MessageCircle, Phone, Star } from "lucide-react";
import { motion } from "framer-motion";

interface Props {
  shop: any | null;
}

const AnalyzeOverview = ({ shop }: Props) => {
  const { data: stats } = useQuery({
    queryKey: ["shop-stats", shop?.id],
    queryFn: async () => {
      if (!shop) return { views: 0, whatsapp: 0, phone: 0, reviews: 0 };
      const [views, whatsapp, phone, reviews] = await Promise.all([
        supabase.from("analytics_events").select("id", { count: "exact", head: true }).eq("shop_id", shop.id).eq("event_type", "view"),
        supabase.from("analytics_events").select("id", { count: "exact", head: true }).eq("shop_id", shop.id).eq("event_type", "whatsapp_click"),
        supabase.from("analytics_events").select("id", { count: "exact", head: true }).eq("shop_id", shop.id).eq("event_type", "phone_click"),
        supabase.from("reviews").select("id", { count: "exact", head: true }).eq("shop_id", shop.id),
      ]);
      return {
        views: views.count || 0,
        whatsapp: whatsapp.count || 0,
        phone: phone.count || 0,
        reviews: reviews.count || 0,
      };
    },
    enabled: !!shop,
  });

  const cards = [
    { label: "Shop Visits", value: stats?.views ?? 0, icon: Eye, color: "text-primary" },
    { label: "WhatsApp Clicks", value: stats?.whatsapp ?? 0, icon: MessageCircle, color: "text-kashmir-green" },
    { label: "Phone Clicks", value: stats?.phone ?? 0, icon: Phone, color: "text-kashmir-rose" },
    { label: "Reviews", value: stats?.reviews ?? 0, icon: Star, color: "text-saffron" },
  ];

  return (
    <div>
      <h1 className="text-2xl font-display font-bold text-foreground mb-1">Overview</h1>
      <p className="text-muted-foreground text-sm mb-8">Your shop performance at a glance</p>

      {!shop ? (
        <div className="text-center py-20">
          <p className="text-muted-foreground">Create your shop first to see analytics.</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {cards.map((card, i) => (
            <motion.div
              key={card.label}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.08 }}
              className="p-5 rounded-xl bg-card-gradient border border-border/50 shadow-soft"
            >
              <div className="flex items-center justify-between mb-3">
                <card.icon size={20} className={card.color} />
              </div>
              <p className="text-2xl font-display font-bold text-foreground">{card.value}</p>
              <p className="text-sm text-muted-foreground mt-1">{card.label}</p>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
};

export default AnalyzeOverview;
