import { useState } from "react";
import { motion } from "framer-motion";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { ArrowRight, Search, Eye } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

const categoryColors: Record<string, string> = {
  Agency: "bg-primary/15",
  Landing: "bg-kashmir-green/15",
  "Non-Profit": "bg-kashmir-rose/15",
  Portfolio: "bg-navy/10",
  SaaS: "bg-primary/15",
  Services: "bg-kashmir-green/15",
  eCommerce: "bg-kashmir-rose/15",
};

const Explore = () => {
  const [search, setSearch] = useState("");
  const [activeCategory, setActiveCategory] = useState<string | null>(null);

  const { data: templates = [], isLoading } = useQuery({
    queryKey: ["templates"],
    queryFn: async () => {
      const { data, error } = await supabase.from("templates").select("*").eq("is_active", true).order("category");
      if (error) throw error;
      return data;
    },
  });

  const categories = [...new Set(templates.map((t) => t.category))];

  const filtered = templates.filter((t) => {
    const matchSearch = !search || t.name.toLowerCase().includes(search.toLowerCase()) || t.category.toLowerCase().includes(search.toLowerCase());
    const matchCat = !activeCategory || t.category === activeCategory;
    return matchSearch && matchCat;
  });

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <section className="pt-32 pb-20">
        <div className="container mx-auto px-4 lg:px-8">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center max-w-2xl mx-auto mb-8">
            <h1 className="text-4xl md:text-5xl font-display font-bold text-foreground mb-4">Explore Templates</h1>
            <p className="text-lg text-muted-foreground mb-8">Start with a professionally designed template, then make it yours.</p>
            <div className="relative max-w-md mx-auto">
              <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground" />
              <input type="text" placeholder="Search templates..." value={search} onChange={(e) => setSearch(e.target.value)} className="w-full h-11 pl-11 pr-4 rounded-xl border border-border bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring text-sm" />
            </div>
          </motion.div>

          {/* Category filters */}
          <div className="flex flex-wrap justify-center gap-2 mb-10">
            <button onClick={() => setActiveCategory(null)} className={`px-4 py-1.5 rounded-full text-sm font-medium transition-colors ${!activeCategory ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground hover:text-foreground"}`}>
              All ({templates.length})
            </button>
            {categories.map((cat) => (
              <button key={cat} onClick={() => setActiveCategory(cat)} className={`px-4 py-1.5 rounded-full text-sm font-medium transition-colors ${activeCategory === cat ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground hover:text-foreground"}`}>
                {cat} ({templates.filter((t) => t.category === cat).length})
              </button>
            ))}
          </div>

          {isLoading ? (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="rounded-xl border border-border/50 bg-card-gradient animate-pulse">
                  <div className="h-44 bg-muted" />
                  <div className="p-5 space-y-3">
                    <div className="h-3 w-20 bg-muted rounded" />
                    <div className="h-5 w-40 bg-muted rounded" />
                    <div className="h-4 w-full bg-muted rounded" />
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filtered.map((t, i) => (
                <motion.div key={t.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.03 }} className="group rounded-xl border border-border/50 bg-card-gradient shadow-soft hover:shadow-card overflow-hidden transition-all duration-300 hover:-translate-y-1">
                  <div className={`h-44 ${categoryColors[t.category] || "bg-muted"} flex items-center justify-center`}>
                    <span className="font-display text-2xl font-bold text-foreground/20">{t.name}</span>
                  </div>
                  <div className="p-5">
                    <span className="text-xs font-medium text-primary uppercase tracking-wider">{t.category}</span>
                    <h3 className="font-display text-lg font-semibold text-foreground mt-1">{t.name}</h3>
                    <p className="text-sm text-muted-foreground mt-1 line-clamp-2">{t.description}</p>
                    <div className="flex gap-2 mt-4">
                      <Link to={`/builder?template=${t.id}`} className="flex-1">
                        <Button variant="hero" size="sm" className="w-full">Use Template <ArrowRight size={14} /></Button>
                      </Link>
                      <Link to={`/preview/template/${t.id}`}>
                        <Button variant="outline" size="sm"><Eye size={14} /></Button>
                      </Link>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
          {!isLoading && filtered.length === 0 && (
            <p className="text-center text-muted-foreground mt-12">No templates found matching your search.</p>
          )}
        </div>
      </section>
      <Footer />
    </div>
  );
};

export default Explore;
