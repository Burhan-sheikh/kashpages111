import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Shield, Clock, ArrowLeft, Users, Store } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useQuery } from "@tanstack/react-query";
import { firestore } from "@/integrations/firebase/client";
import { collection, query, orderBy, getDocs } from "firebase/firestore";

const Admin = () => {
  const { user, isAdmin, loading } = useAuth();
  const navigate = useNavigate();
  const [tab, setTab] = useState<"shops" | "users">("shops");

  const { data: shops = [] } = useQuery({
    queryKey: ["admin-shops"],
    queryFn: async () => {
      const q = query(collection(firestore, "shops"), orderBy("updated_at", "desc"));
      const snap = await getDocs(q);
      return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
    },
    enabled: !!user && isAdmin,
  });

  const { data: users = [] } = useQuery({
    queryKey: ["admin-users"],
    queryFn: async () => {
      const q = query(collection(firestore, "profiles"), orderBy("created_at", "desc"));
      const snap = await getDocs(q);
      return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
    },
    enabled: !!user && isAdmin && tab === "users",
  });

  if (loading) return <div className="min-h-screen flex items-center justify-center"><Clock className="animate-spin text-muted-foreground" /></div>;
  if (!user || !isAdmin) { navigate("/dashboard"); return null; }

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border bg-card-gradient">
        <div className="container mx-auto flex items-center gap-4 h-16 px-4">
          <Link to="/dashboard"><Button variant="ghost" size="icon"><ArrowLeft size={18} /></Button></Link>
          <Shield size={20} className="text-primary" />
          <h1 className="font-display font-bold text-lg text-foreground">Admin Panel</h1>
        </div>
      </header>
      <div className="container mx-auto px-4 py-8">
        <div className="flex gap-2 mb-8">
          {([{ key: "shops" as const, label: "Shops", icon: Store }, { key: "users" as const, label: "Users", icon: Users }]).map((t) => (
            <button key={t.key} onClick={() => setTab(t.key)} className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${tab === t.key ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground hover:text-foreground"}`}>
              <t.icon size={16} /> {t.label}
            </button>
          ))}
        </div>

        {tab === "users" ? (
          <div className="grid gap-3">
            {users.map((u) => (
              <div key={u.id} className="flex items-center justify-between p-4 rounded-xl bg-card-gradient border border-border/50">
                <div>
                  <p className="font-semibold text-foreground">@{u.username}</p>
                  <p className="text-sm text-muted-foreground">@{u.username} · {u.plan} plan</p>
                </div>
                <p className="text-xs text-muted-foreground">{new Date(u.created_at).toLocaleDateString()}</p>
              </div>
            ))}
          </div>
        ) : (
          <div className="grid gap-3">
            {shops.length === 0 && <p className="text-center text-muted-foreground py-12">No shops found.</p>}
            {shops.map((shop: any, i: number) => (
              <motion.div key={shop.id} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }} className="p-5 rounded-xl bg-card-gradient border border-border/50 shadow-soft">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-display font-semibold text-foreground">{shop.title}</h3>
                    <p className="text-sm text-muted-foreground">/{shop.slug} · {shop.status}</p>
                  </div>
                  <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium capitalize ${shop.status === "published" ? "bg-kashmir-green/15 text-kashmir-green" : "bg-muted text-muted-foreground"}`}>{shop.status}</span>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Admin;
