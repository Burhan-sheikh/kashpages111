import { useQuery } from "@tanstack/react-query";
import { firestore } from "@/integrations/firebase/client";
import { Eye, MessageCircle, Phone, Star } from "lucide-react";
import { motion } from "framer-motion";
import { collection, query, where, getDocs } from "firebase/firestore";

interface Props {
  shop: any | null;
}

const AnalyzeOverview = ({ shop }: Props) => {
  const { data: stats } = useQuery({
    queryKey: ["shop-stats", shop?.id],
    queryFn: async () => {
      if (!shop) return { views: 0, whatsapp: 0, phone: 0, reviews: 0 };
      const [viewsSnap, whatsappSnap, phoneSnap, reviewsSnap] = await Promise.all([
        getDocs(query(collection(firestore, "analytics_events"), where("shop_id", "==", shop.id), where("event_type", "==", "view"))),
        getDocs(query(collection(firestore, "analytics_events"), where("shop_id", "==", shop.id), where("event_type", "==", "whatsapp_click"))),
        getDocs(query(collection(firestore, "analytics_events"), where("shop_id", "==", shop.id), where("event_type", "==", "phone_click"))),
        getDocs(query(collection(firestore, "reviews"), where("shop_id", "==", shop.id))),
      ]);
      return {
        views: viewsSnap.size,
        whatsapp: whatsappSnap.size,
        phone: phoneSnap.size,
        reviews: reviewsSnap.size,
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
