// Explore page - now shows published shops instead of templates
import { useState } from "react";
import { motion } from "framer-motion";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import { Search, MapPin } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { firestore } from "@/integrations/firebase/client";
import { Link } from "react-router-dom";
import { collection, query, where, orderBy, getDocs } from "firebase/firestore";

const Explore = () => {
  const [search, setSearch] = useState("");

  const { data: shops = [], isLoading } = useQuery({
    queryKey: ["published-shops"],
    queryFn: async () => {
      const q = query(
        collection(firestore, "shops"),
        where("status", "==", "published"),
        orderBy("created_at", "desc")
      );
      const snap = await getDocs(q);
      return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
    },
  });

  const filtered = shops.filter((s) =>
    !search || s.title.toLowerCase().includes(search.toLowerCase()) || s.city?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <section className="pt-32 pb-20">
        <div className="container mx-auto px-4 lg:px-8">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center max-w-2xl mx-auto mb-10">
            <h1 className="text-4xl md:text-5xl font-display font-bold text-foreground mb-4">Explore Shops</h1>
            <p className="text-lg text-muted-foreground mb-8">Discover amazing businesses from Kashmir</p>
            <div className="relative max-w-md mx-auto">
              <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground" />
              <input type="text" placeholder="Search shops by name or city..." value={search} onChange={(e) => setSearch(e.target.value)} className="w-full h-11 pl-11 pr-4 rounded-xl border border-border bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring text-sm" />
            </div>
          </motion.div>

          {isLoading ? (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3].map((i) => <div key={i} className="h-64 rounded-xl bg-muted animate-pulse" />)}
            </div>
          ) : filtered.length === 0 ? (
            <p className="text-center text-muted-foreground py-12">No shops found.</p>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filtered.map((shop, i) => (
                <motion.div key={shop.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}>
                  <Link to={`/s/${shop.slug}`} className="block group rounded-xl border border-border/50 bg-card-gradient shadow-soft hover:shadow-card overflow-hidden transition-all hover:-translate-y-1">
                    <div className="h-40 bg-muted">
                      {shop.cover_image ? <img src={shop.cover_image} alt={shop.title} className="w-full h-full object-cover" /> : <div className="w-full h-full flex items-center justify-center text-muted-foreground/30 font-display text-2xl font-bold">{shop.title[0]}</div>}
                    </div>
                    <div className="p-5">
                      <h3 className="font-display text-lg font-semibold text-foreground">{shop.title}</h3>
                      {shop.city && (
                        <p className="text-sm text-muted-foreground mt-1 flex items-center gap-1"><MapPin size={12} /> {shop.city}{shop.state ? `, ${shop.state}` : ""}</p>
                      )}
                      {shop.about_text && <p className="text-sm text-muted-foreground mt-2 line-clamp-2">{shop.about_text}</p>}
                    </div>
                  </Link>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </section>
      <Footer />
    </div>
  );
};

export default Explore;
