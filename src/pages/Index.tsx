import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { ArrowRight, Zap, Shield, Globe, Palette, BarChart3, Users } from "lucide-react";
import heroImage from "@/assets/hero-kashmir.jpg";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";

const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  visible: (i: number) => ({
    opacity: 1, y: 0,
    transition: { delay: i * 0.1, duration: 0.5, ease: "easeOut" as const },
  }),
};

const features = [
  { icon: Palette, title: "Visual Page Builder", desc: "Drag-and-drop sections — hero, pricing, gallery & more — no code needed." },
  { icon: Zap, title: "Instant Publishing", desc: "Go live in seconds with one click. Your customers see your page immediately." },
  { icon: Shield, title: "Safe & Secure", desc: "Schema-driven rendering with sanitized data. No arbitrary HTML or scripts." },
  { icon: Globe, title: "SEO Optimized", desc: "Built-in SEO controls with meta tags, Open Graph, and structured data." },
  { icon: BarChart3, title: "Analytics & Insights", desc: "Track visitors, engagement, and conversions with real-time dashboards." },
  { icon: Users, title: "Realtime Collaboration", desc: "Work together with your team. See edits in real-time with presence indicators." },
];

const stats = [
  { value: "500+", label: "Businesses Live" },
  { value: "10K+", label: "Pages Created" },
  { value: "99.9%", label: "Uptime" },
  { value: "< 2s", label: "Load Time" },
];

const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      {/* Hero */}
      <section className="relative pt-16 overflow-hidden">
        {/* Background image */}
        <div className="absolute inset-0">
          <img src={heroImage} alt="" className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-hero-gradient opacity-85" />
        </div>

        <div className="relative container mx-auto px-4 lg:px-8 py-24 lg:py-36">
          <motion.div
            className="max-w-3xl"
            initial="hidden"
            animate="visible"
          >
            <motion.div
              variants={fadeUp}
              custom={0}
              className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-primary/30 bg-primary/10 backdrop-blur-sm mb-8"
            >
              <span className="w-2 h-2 rounded-full bg-primary animate-pulse" />
              <span className="text-sm font-medium text-primary">Now in Beta — Join the waitlist</span>
            </motion.div>

            <motion.h1
              variants={fadeUp}
              custom={1}
              className="text-4xl md:text-6xl lg:text-7xl font-display font-bold text-secondary-foreground leading-[1.1] mb-6"
            >
              Your Kashmir business,{" "}
              <span className="text-gradient-saffron">online in minutes</span>
            </motion.h1>

            <motion.p
              variants={fadeUp}
              custom={2}
              className="text-lg md:text-xl text-secondary-foreground/70 max-w-xl mb-10 leading-relaxed"
            >
              Build stunning landing pages with our visual builder. No coding. No hassle. 
              Just your craft, beautifully presented to the world.
            </motion.p>

            <motion.div variants={fadeUp} custom={3} className="flex flex-wrap gap-4">
              <Link to="/signup">
                <Button variant="hero" size="xl">
                  Start Building Free
                  <ArrowRight className="ml-1" size={18} />
                </Button>
              </Link>
              <Link to="/explore">
                <Button variant="hero-outline" size="xl">
                  Explore Templates
                </Button>
              </Link>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Stats */}
      <section className="bg-warm-gradient py-12 border-b border-border/50">
        <div className="container mx-auto px-4 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((s, i) => (
              <motion.div
                key={s.label}
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="text-center"
              >
                <p className="text-3xl md:text-4xl font-display font-bold text-gradient-saffron">{s.value}</p>
                <p className="text-sm text-muted-foreground mt-1">{s.label}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-20 lg:py-28">
        <div className="container mx-auto px-4 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center max-w-2xl mx-auto mb-16"
          >
            <h2 className="text-3xl md:text-4xl font-display font-bold text-foreground mb-4">
              Everything you need to go live
            </h2>
            <p className="text-muted-foreground text-lg">
              A complete platform built for Kashmir's artisans, shops, and service providers.
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((f, i) => (
              <motion.div
                key={f.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.08 }}
                className="group p-6 rounded-xl bg-card-gradient border border-border/50 shadow-soft hover:shadow-card transition-all duration-300 hover:-translate-y-1"
              >
                <div className="w-11 h-11 rounded-lg bg-accent flex items-center justify-center mb-4 group-hover:bg-primary/15 transition-colors">
                  <f.icon size={20} className="text-accent-foreground group-hover:text-primary transition-colors" />
                </div>
                <h3 className="font-display text-lg font-semibold text-foreground mb-2">{f.title}</h3>
                <p className="text-muted-foreground text-sm leading-relaxed">{f.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 bg-hero-gradient relative overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-10 right-10 w-64 h-64 rounded-full bg-primary blur-[100px]" />
          <div className="absolute bottom-10 left-10 w-48 h-48 rounded-full bg-saffron-light blur-[80px]" />
        </div>
        <div className="relative container mx-auto px-4 lg:px-8 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <h2 className="text-3xl md:text-5xl font-display font-bold text-secondary-foreground mb-5">
              Ready to bring your business online?
            </h2>
            <p className="text-secondary-foreground/60 text-lg max-w-lg mx-auto mb-10">
              Join hundreds of Kashmiri businesses already using Kashpages to reach customers everywhere.
            </p>
            <Link to="/signup">
              <Button variant="hero" size="xl">
                Get Started for Free
                <ArrowRight className="ml-1" size={18} />
              </Button>
            </Link>
          </motion.div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Index;
