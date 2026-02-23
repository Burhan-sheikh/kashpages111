import { useState, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import {
  BarChart3, Store, Star, TrendingUp, LogOut, Eye, Phone, MessageCircle,
  Menu, X, ChevronRight, Shield, Settings, User,
} from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useQuery } from "@tanstack/react-query";

import { useIsMobile } from "@/hooks/use-mobile";

// Dashboard sub-views
import AnalyzeOverview from "@/components/dashboard/AnalyzeOverview";
import MyShop from "@/components/dashboard/MyShop";
import Reviews from "@/components/dashboard/Reviews";
import AnalyzeAdvanced from "@/components/dashboard/AnalyzeAdvanced";
import Profile from "./Profile";

type DashboardView = "overview" | "shop" | "reviews" | "analyze";

type DashboardView = "overview" | "shop" | "reviews" | "analyze" | "profile";

const sidebarItems: { key: DashboardView; label: string; icon: typeof BarChart3 }[] = [
  { key: "overview", label: "Analyze Overview", icon: BarChart3 },
  { key: "shop", label: "My Shop", icon: Store },
  { key: "reviews", label: "Reviews", icon: Star },
  { key: "analyze", label: "Analyze", icon: TrendingUp },
  { key: "profile", label: "Profile", icon: User },
];

const Dashboard = () => {
  const { user, profile, isAdmin, signOut } = useAuth();
  const navigate = useNavigate();
  const isMobile = useIsMobile();
  const [activeView, setActiveView] = useState<DashboardView>("overview");
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Fetch user's shop
  const { data: shop } = useQuery({
    queryKey: ["my-shop", user?.id],
    queryFn: async () => {
      if (!user) return null;
      const res = await fetch(`http://localhost:3001/api/shop?shopId=${user.id}`);
      if (!res.ok) return null;
      return await res.json();
    },
    enabled: !!user,
  });


  // Redirect to login if not authenticated
  useEffect(() => {
    if (!user) {
      navigate("/login");
    }
  }, [user, navigate]);
  if (!user) return null;

  const renderView = () => {
    switch (activeView) {
      case "overview":
        return <AnalyzeOverview shop={shop} />;
      case "shop":
        return <MyShop shop={shop} />;
      case "reviews":
        return <Reviews shop={shop} userPlan={profile?.plan || "free"} />;
      case "analyze":
        return <AnalyzeAdvanced shop={shop} userPlan={profile?.plan || "free"} />;
      case "profile":
        return <Profile />;
    }
  };

  return (
    <div className="min-h-screen bg-background flex">
      {/* Desktop Sidebar */}
      {!isMobile && (
        <aside className="flex flex-col w-64 bg-secondary text-secondary-foreground border-r border-sidebar-border flex-shrink-0">
          <div className="p-5 border-b border-sidebar-border">
            <Link to="/" className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
                <span className="font-display font-bold text-primary-foreground text-sm">K</span>
              </div>
              <span className="font-display font-bold text-lg text-secondary-foreground">Kashpages</span>
            </Link>
          </div>
          <nav className="flex-1 p-3 space-y-1">
            {sidebarItems.map((item) => (
              <button
                key={item.key}
                onClick={() => setActiveView(item.key)}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                  activeView === item.key
                    ? "bg-sidebar-accent text-sidebar-primary"
                    : "text-secondary-foreground/60 hover:text-secondary-foreground hover:bg-sidebar-accent/50"
                }`}
              >
                <item.icon size={18} />
                {item.label}
              </button>
            ))}
            {isAdmin && (
              <Link to="/admin">
                <button className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-secondary-foreground/60 hover:text-secondary-foreground hover:bg-sidebar-accent/50">
                  <Shield size={18} /> Admin Panel
                </button>
              </Link>
            )}
          </nav>
          <div className="p-3 border-t border-sidebar-border">
            <Button variant="ghost" className="w-full justify-start gap-3 text-secondary-foreground/50 hover:text-secondary-foreground hover:bg-sidebar-accent" onClick={signOut}>
              <LogOut size={18} /> Sign Out
            </Button>
          </div>
        </aside>
      )}

      {/* Mobile Header */}
      {isMobile && (
        <div className="fixed top-0 left-0 right-0 z-50 bg-secondary text-secondary-foreground border-b border-sidebar-border">
          <div className="flex items-center justify-between h-14 px-4">
            <Link to="/" className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-primary flex items-center justify-center">
                <span className="font-display font-bold text-primary-foreground text-xs">K</span>
              </div>
              <span className="font-display font-bold text-secondary-foreground">Kashpages</span>
            </Link>
            <div className="flex items-center gap-2">
              <button onClick={() => setMobileMenuOpen(!mobileMenuOpen)} className="p-2 text-secondary-foreground">
                {mobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
              </button>
            </div>
          </div>
          {mobileMenuOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="border-t border-sidebar-border bg-secondary"
            >
              <div className="p-3 space-y-1">
                {sidebarItems.map((item) => (
                  <button
                    key={item.key}
                    onClick={() => { setActiveView(item.key); setMobileMenuOpen(false); }}
                    className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                      activeView === item.key
                        ? "bg-sidebar-accent text-sidebar-primary"
                        : "text-secondary-foreground/60 hover:text-secondary-foreground"
                    }`}
                  >
                    <item.icon size={18} />
                    {item.label}
                  </button>
                ))}
                <button
                  onClick={() => { signOut(); setMobileMenuOpen(false); }}
                  className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-secondary-foreground/50"
                >
                  <LogOut size={18} /> Sign Out
                </button>
              </div>
            </motion.div>
          )}
        </div>
      )}

      {/* Main Content */}
      <main className={`flex-1 overflow-auto ${isMobile ? "pt-14" : ""}`}>
        <div className="p-6 lg:p-8">
          {renderView()}
        </div>
      </main>
    </div>
  );
};

export default Dashboard;
