import { motion } from "framer-motion";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import { Heart, Target, MapPin } from "lucide-react";

const About = () => {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <section className="pt-32 pb-20">
        <div className="container mx-auto px-4 lg:px-8 max-w-3xl">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <h1 className="text-4xl md:text-5xl font-display font-bold text-foreground mb-6">
              About <span className="text-gradient-saffron">Kashpages</span>
            </h1>
            <p className="text-lg text-muted-foreground leading-relaxed mb-12">
              Kashpages is a modern go-live platform built specifically for businesses and service providers 
              in Kashmir. We believe every artisan, shopkeeper, and entrepreneur deserves a beautiful 
              online presence — without the complexity of traditional web development.
            </p>
          </motion.div>

          <div className="grid gap-8">
            {[
              { icon: Target, title: "Our Mission", text: "To digitally empower every business in Kashmir with tools that are simple, beautiful, and effective. From saffron traders to shawl weavers, everyone should have a professional web presence." },
              { icon: Heart, title: "Our Values", text: "We build with respect for Kashmiri culture and craftsmanship. Our platform celebrates the rich heritage of the valley while providing modern, world-class technology." },
              { icon: MapPin, title: "Rooted in Kashmir", text: "Built by people who understand the valley's unique business landscape. We know the challenges and opportunities that Kashmiri businesses face, and we build solutions accordingly." },
            ].map((item, i) => (
              <motion.div
                key={item.title}
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 + i * 0.1 }}
                className="flex gap-5 p-6 rounded-xl bg-card-gradient border border-border/50 shadow-soft"
              >
                <div className="w-11 h-11 rounded-lg bg-accent flex items-center justify-center flex-shrink-0">
                  <item.icon size={20} className="text-accent-foreground" />
                </div>
                <div>
                  <h3 className="font-display text-lg font-semibold text-foreground mb-2">{item.title}</h3>
                  <p className="text-muted-foreground text-sm leading-relaxed">{item.text}</p>
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

export default About;
