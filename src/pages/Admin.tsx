import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Shield, CheckCircle, XCircle, Clock, Eye, ArrowLeft, Users, FileText } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

const Admin = () => {
  const { user, isAdmin, loading } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [tab, setTab] = useState<"pending" | "all" | "users">("pending");

  const { data: pages = [] } = useQuery({
    queryKey: ["admin-pages", tab],
    queryFn: async () => {
      let query = supabase.from("pages").select("*");
      if (tab === "pending") query = query.eq("status", "pending");
      const { data, error } = await query.order("updated_at", { ascending: false });
      if (error) throw error;
      return data;
    },
    enabled: !!user && isAdmin,
  });

  const { data: users = [] } = useQuery({
    queryKey: ["admin-users"],
    queryFn: async () => {
      const { data, error } = await supabase.from("profiles").select("*").order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
    enabled: !!user && isAdmin && tab === "users",
  });

  const updateStatus = useMutation({
    mutationFn: async ({ id, status, notes }: { id: string; status: string; notes?: string }) => {
      const { error } = await supabase.from("pages").update({ status, admin_notes: notes || null }).eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-pages"] });
      toast({ title: "Page status updated" });
    },
  });

  if (loading) return <div className="min-h-screen flex items-center justify-center"><Clock className="animate-spin text-muted-foreground" /></div>;
  if (!user || !isAdmin) {
    navigate("/dashboard");
    return null;
  }

  const statusColors: Record<string, string> = {
    published: "bg-kashmir-green/15 text-kashmir-green",
    draft: "bg-muted text-muted-foreground",
    pending: "bg-primary/15 text-primary",
    rejected: "bg-destructive/15 text-destructive",
  };

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
          {[
            { key: "pending" as const, label: "Pending Approvals", icon: Clock },
            { key: "all" as const, label: "All Pages", icon: FileText },
            { key: "users" as const, label: "Users", icon: Users },
          ].map((t) => (
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
                  <p className="font-semibold text-foreground">{u.display_name}</p>
                  <p className="text-sm text-muted-foreground">@{u.username}</p>
                </div>
                <p className="text-xs text-muted-foreground">{new Date(u.created_at).toLocaleDateString()}</p>
              </div>
            ))}
          </div>
        ) : (
          <div className="grid gap-4">
            {pages.length === 0 && (
              <p className="text-center text-muted-foreground py-12">No {tab === "pending" ? "pending" : ""} pages found.</p>
            )}
            {pages.map((page: any, i: number) => (
              <motion.div key={page.id} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }} className="p-5 rounded-xl bg-card-gradient border border-border/50 shadow-soft">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-3 mb-1">
                      <h3 className="font-display font-semibold text-foreground">{page.title}</h3>
                      <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium capitalize ${statusColors[page.status]}`}>{page.status}</span>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      by @{page.profiles?.username || "unknown"} · /{page.profiles?.username}/{page.slug}
                    </p>
                    {page.admin_notes && <p className="text-xs text-muted-foreground mt-2 italic">Note: {page.admin_notes}</p>}
                  </div>
                  <div className="flex items-center gap-2">
                    <Link to={`/preview/page/${page.id}`}>
                      <Button variant="outline" size="sm"><Eye size={14} className="mr-1" /> Preview</Button>
                    </Link>
                    {page.status === "pending" && (
                      <>
                        <Button variant="hero" size="sm" onClick={() => updateStatus.mutate({ id: page.id, status: "published" })}>
                          <CheckCircle size={14} className="mr-1" /> Approve
                        </Button>
                        <Button variant="outline" size="sm" className="text-destructive" onClick={() => updateStatus.mutate({ id: page.id, status: "rejected", notes: "Does not meet guidelines" })}>
                          <XCircle size={14} className="mr-1" /> Reject
                        </Button>
                      </>
                    )}
                    {page.status === "published" && (
                      <Button variant="outline" size="sm" className="text-destructive" onClick={() => updateStatus.mutate({ id: page.id, status: "draft" })}>
                        Unpublish
                      </Button>
                    )}
                  </div>
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
