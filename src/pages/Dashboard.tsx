import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { FileText, Plus, Layout, Settings, LogOut, Eye, Edit, Trash2, Search, Shield, ExternalLink, Clock, Send } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

const statusColors: Record<string, string> = {
  published: "bg-kashmir-green/15 text-kashmir-green",
  draft: "bg-muted text-muted-foreground",
  pending: "bg-primary/15 text-primary",
  rejected: "bg-destructive/15 text-destructive",
};

const Dashboard = () => {
  const { user, profile, isAdmin, signOut } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [searchQuery, setSearchQuery] = useState("");

  const { data: pages = [], isLoading } = useQuery({
    queryKey: ["my-pages", user?.id],
    queryFn: async () => {
      if (!user) return [];
      const { data, error } = await supabase.from("pages").select("*").eq("owner_id", user.id).order("updated_at", { ascending: false });
      if (error) throw error;
      return data;
    },
    enabled: !!user,
  });

  const deletePage = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("pages").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["my-pages"] });
      toast({ title: "Page deleted" });
    },
  });

  const submitForApproval = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("pages").update({ status: "pending" }).eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["my-pages"] });
      toast({ title: "Submitted for approval" });
    },
  });

  if (!user) {
    navigate("/login");
    return null;
  }

  const filtered = pages.filter((p) => !searchQuery || p.title.toLowerCase().includes(searchQuery.toLowerCase()));

  const sidebarLinks = [
    { label: "My Pages", icon: FileText, href: "/dashboard" },
    { label: "Templates", icon: Layout, href: "/explore" },
    { label: "Settings", icon: Settings, href: "/dashboard" },
    ...(isAdmin ? [{ label: "Admin Panel", icon: Shield, href: "/admin" }] : []),
  ];

  return (
    <div className="min-h-screen bg-background flex">
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
            <Link key={link.href + link.label} to={link.href}>
              <Button variant="ghost" className="w-full justify-start gap-3 text-secondary-foreground/70 hover:text-secondary-foreground hover:bg-sidebar-accent">
                <link.icon size={18} />
                {link.label}
              </Button>
            </Link>
          ))}
        </nav>
        <div className="p-3 border-t border-sidebar-border">
          <div className="px-3 py-2 mb-2">
            <p className="text-sm font-medium text-secondary-foreground truncate">{profile?.display_name || "User"}</p>
            <p className="text-xs text-secondary-foreground/50 truncate">@{profile?.username}</p>
          </div>
          <Button variant="ghost" className="w-full justify-start gap-3 text-secondary-foreground/50 hover:text-secondary-foreground hover:bg-sidebar-accent" onClick={signOut}>
            <LogOut size={18} /> Sign Out
          </Button>
        </div>
      </aside>

      <main className="flex-1 overflow-auto">
        <div className="p-6 lg:p-8">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
            <div>
              <h1 className="text-2xl font-display font-bold text-foreground">My Pages</h1>
              <p className="text-muted-foreground text-sm mt-1">Manage and create your landing pages</p>
            </div>
            <Link to="/builder">
              <Button variant="hero" size="default"><Plus size={16} /> Create Page</Button>
            </Link>
          </div>

          <div className="relative max-w-sm mb-6">
            <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <input type="text" placeholder="Search pages..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="w-full h-10 pl-10 pr-4 rounded-lg border border-input bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring text-sm" />
          </div>

          {isLoading ? (
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-20 rounded-xl bg-muted animate-pulse" />
              ))}
            </div>
          ) : filtered.length === 0 ? (
            <div className="text-center py-20">
              <FileText size={48} className="mx-auto text-muted-foreground/30 mb-4" />
              <p className="text-muted-foreground">No pages yet. Create your first one!</p>
              <Link to="/builder" className="mt-4 inline-block">
                <Button variant="hero"><Plus size={16} /> Create Page</Button>
              </Link>
            </div>
          ) : (
            <div className="grid gap-4">
              {filtered.map((page, i) => (
                <motion.div key={page.id} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.06 }} className="flex items-center justify-between p-5 rounded-xl bg-card-gradient border border-border/50 shadow-soft hover:shadow-card transition-all group">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-3">
                      <h3 className="font-display font-semibold text-foreground truncate">{page.title}</h3>
                      <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium capitalize ${statusColors[page.status]}`}>{page.status}</span>
                    </div>
                    <p className="text-sm text-muted-foreground mt-1">/{profile?.username}/{page.slug} · Updated {new Date(page.updated_at).toLocaleDateString()}</p>
                  </div>
                  <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    {page.status === "published" && (
                      <Link to={`/${profile?.username}/${page.slug}`}>
                        <Button variant="ghost" size="icon"><ExternalLink size={16} /></Button>
                      </Link>
                    )}
                    {page.status === "draft" && (
                      <Button variant="ghost" size="icon" onClick={() => submitForApproval.mutate(page.id)} title="Submit for approval"><Send size={16} /></Button>
                    )}
                    <Link to={`/builder?page=${page.id}`}>
                      <Button variant="ghost" size="icon"><Edit size={16} /></Button>
                    </Link>
                    <Button variant="ghost" size="icon" className="text-destructive" onClick={() => deletePage.mutate(page.id)}><Trash2 size={16} /></Button>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default Dashboard;
