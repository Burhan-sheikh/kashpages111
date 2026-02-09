import { motion } from "framer-motion";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { ArrowRight, Search } from "lucide-react";

const templates = [
  { name: "Saffron Shop", category: "E-Commerce", color: "bg-primary/15" },
  { name: "Artisan Portfolio", category: "Portfolio", color: "bg-kashmir-green/15" },
  { name: "Restaurant Menu", category: "Food & Dining", color: "bg-kashmir-rose/15" },
  { name: "Tour Guide", category: "Tourism", color: "bg-navy/10" },
  { name: "Shawl Gallery", category: "Gallery", color: "bg-primary/15" },
  { name: "Service Provider", category: "Services", color: "bg-kashmir-green/15" },
];

const Explore = () => {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <section className="pt-32 pb-20">
        <div className="container mx-auto px-4 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center max-w-2xl mx-auto mb-12"
          >
            <h1 className="text-4xl md:text-5xl font-display font-bold text-foreground mb-4">
              Explore Templates
            </h1>
            <p className="text-lg text-muted-foreground mb-8">
              Start with a professionally designed template, then make it yours.
            </p>
            <div className="relative max-w-md mx-auto">
              <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground" />
              <input
                type="text"
                placeholder="Search templates..."
                className="w-full h-11 pl-11 pr-4 rounded-xl border border-border bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring text-sm"
              />
            </div>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {templates.map((t, i) => (
              <motion.div
                key={t.name}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.08 }}
                className="group rounded-xl border border-border/50 bg-card-gradient shadow-soft hover:shadow-card overflow-hidden transition-all duration-300 hover:-translate-y-1"
              >
                <div className={`h-44 ${t.color} flex items-center justify-center`}>
                  <span className="font-display text-2xl font-bold text-foreground/20">{t.name}</span>
                </div>
                <div className="p-5">
                  <span className="text-xs font-medium text-primary uppercase tracking-wider">{t.category}</span>
                  <h3 className="font-display text-lg font-semibold text-foreground mt-1">{t.name}</h3>
                  <div className="flex gap-2 mt-4">
                    <Link to="/signup" className="flex-1">
                      <Button variant="hero" size="sm" className="w-full">
                        Use Template
                        <ArrowRight size={14} />
                      </Button>
                    </Link>
                    <Button variant="outline" size="sm">Preview</Button>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>
      <Footer />
    </div>
  );
};

export default Explore;
