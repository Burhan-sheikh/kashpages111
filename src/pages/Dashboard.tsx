import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import {
  FileText, Plus, Layout, Settings, LogOut,
  MoreVertical, Eye, Edit, Trash2, Search
} from "lucide-react";

const sidebarLinks = [
  { label: "My Pages", icon: FileText, href: "/dashboard" },
  { label: "Templates", icon: Layout, href: "/dashboard/templates" },
  { label: "Settings", icon: Settings, href: "/dashboard/settings" },
];

const mockPages = [
  { id: "1", title: "Zahid's Saffron Emporium", slug: "zahid-saffron", status: "published" as const, updatedAt: "2 hours ago" },
  { id: "2", title: "Kashmir Shawl Gallery", slug: "kashmir-shawls", status: "draft" as const, updatedAt: "Yesterday" },
  { id: "3", title: "Dal Lake Houseboats", slug: "dal-houseboats", status: "pending" as const, updatedAt: "3 days ago" },
];

const statusColors = {
  published: "bg-kashmir-green/15 text-kashmir-green",
  draft: "bg-muted text-muted-foreground",
  pending: "bg-primary/15 text-primary",
};

const Dashboard = () => {
  const location = useLocation();
  const [searchQuery, setSearchQuery] = useState("");

  return (
    <div className="min-h-screen bg-background flex">
      {/* Sidebar */}
      <aside className="hidden md:flex flex-col w-64 bg-secondary text-secondary-foreground border-r border-sidebar-border">
        <div className="p-5 border-b border-sidebar-border">
          <Link to="/" className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
              <span className="font-display font-bold text-primary-foreground text-sm">K</span>
            </div>
            <span className="font-display font-bold text-lg text-secondary-foreground">Kashpages</span>
          </Link>
        </div>

        <nav className="flex-1 p-3 space-y-1">
          {sidebarLinks.map((link) => (
            <Link key={link.href} to={link.href}>
              <Button
                variant="ghost"
                className={`w-full justify-start gap-3 text-secondary-foreground/70 hover:text-secondary-foreground hover:bg-sidebar-accent ${
                  location.pathname === link.href ? "bg-sidebar-accent text-secondary-foreground" : ""
                }`}
              >
                <link.icon size={18} />
                {link.label}
              </Button>
            </Link>
          ))}
        </nav>

        <div className="p-3 border-t border-sidebar-border">
          <Button variant="ghost" className="w-full justify-start gap-3 text-secondary-foreground/50 hover:text-secondary-foreground hover:bg-sidebar-accent">
            <LogOut size={18} />
            Sign Out
          </Button>
        </div>
      </aside>

      {/* Main */}
      <main className="flex-1 overflow-auto">
        <div className="p-6 lg:p-8">
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
            <div>
              <h1 className="text-2xl font-display font-bold text-foreground">My Pages</h1>
              <p className="text-muted-foreground text-sm mt-1">Manage and create your landing pages</p>
            </div>
            <Link to="/builder">
              <Button variant="hero" size="default">
                <Plus size={16} />
                Create Page
              </Button>
            </Link>
          </div>

          {/* Search */}
          <div className="relative max-w-sm mb-6">
            <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search pages..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full h-10 pl-10 pr-4 rounded-lg border border-input bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring text-sm"
            />
          </div>

          {/* Pages grid */}
          <div className="grid gap-4">
            {mockPages.map((page, i) => (
              <motion.div
                key={page.id}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.06 }}
                className="flex items-center justify-between p-5 rounded-xl bg-card-gradient border border-border/50 shadow-soft hover:shadow-card transition-all group"
              >
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-3">
                    <h3 className="font-display font-semibold text-foreground truncate">{page.title}</h3>
                    <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium capitalize ${statusColors[page.status]}`}>
                      {page.status}
                    </span>
                  </div>
                  <p className="text-sm text-muted-foreground mt-1">
                    /{page.slug} · Updated {page.updatedAt}
                  </p>
                </div>
                <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  <Button variant="ghost" size="icon"><Eye size={16} /></Button>
                  <Link to="/builder">
                    <Button variant="ghost" size="icon"><Edit size={16} /></Button>
                  </Link>
                  <Button variant="ghost" size="icon" className="text-destructive"><Trash2 size={16} /></Button>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
};

export default Dashboard;
