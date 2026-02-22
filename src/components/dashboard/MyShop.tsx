import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Plus, Edit, Trash2, EyeOff, ExternalLink, Store } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface Props {
  shop: any | null;
}

const MyShop = ({ shop }: Props) => {
  const { profile } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const deleteShop = useMutation({
    mutationFn: async () => {
      if (!shop) return;
      const { error } = await supabase.from("shops").delete().eq("id", shop.id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["my-shop"] });
      toast({ title: "Shop deleted" });
    },
  });

  const unpublishShop = useMutation({
    mutationFn: async () => {
      if (!shop) return;
      const { error } = await supabase.from("shops").update({ status: "unpublished" }).eq("id", shop.id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["my-shop"] });
      toast({ title: "Shop unpublished" });
    },
  });

  // No shop yet → show setup CTA
  if (!shop) {
    return (
      <div>
        <h1 className="text-2xl font-display font-bold text-foreground mb-1">My Shop</h1>
        <p className="text-muted-foreground text-sm mb-8">Set up your online shop</p>
        <div className="text-center py-20">
          <Store size={48} className="mx-auto text-muted-foreground/30 mb-4" />
          <p className="text-muted-foreground mb-4">You haven't created a shop yet.</p>
          <Link to="/shop/setup">
            <Button variant="hero"><Plus size={16} /> Create Shop</Button>
          </Link>
        </div>
      </div>
    );
  }

  // Shop exists → show live shop with action header
  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-display font-bold text-foreground mb-1">My Shop</h1>
          <p className="text-muted-foreground text-sm">
            Status: <span className={`font-medium capitalize ${shop.status === "published" ? "text-kashmir-green" : "text-muted-foreground"}`}>{shop.status}</span>
          </p>
        </div>
        <div className="flex items-center gap-2">
          {shop.status === "published" && (
            <Link to={`/s/${shop.slug}`}>
              <Button variant="outline" size="sm"><ExternalLink size={14} className="mr-1" /> View Live</Button>
            </Link>
          )}
          <Link to="/shop/setup">
            <Button variant="outline" size="sm"><Edit size={14} className="mr-1" /> Edit</Button>
          </Link>
          {shop.status === "published" && (
            <Button variant="outline" size="sm" onClick={() => unpublishShop.mutate()}>
              <EyeOff size={14} className="mr-1" /> Unpublish
            </Button>
          )}
          <Button variant="outline" size="sm" className="text-destructive" onClick={() => {
            if (confirm("Are you sure you want to delete your shop?")) deleteShop.mutate();
          }}>
            <Trash2 size={14} className="mr-1" /> Delete
          </Button>
        </div>
      </div>

      {/* Shop preview card */}
      <div className="rounded-xl bg-card-gradient border border-border/50 shadow-soft overflow-hidden">
        {shop.cover_image && (
          <div className="h-48 bg-muted">
            <img src={shop.cover_image} alt={shop.title} className="w-full h-full object-cover" />
          </div>
        )}
        <div className="p-6">
          <h2 className="text-xl font-display font-bold text-foreground mb-2">{shop.title}</h2>
          <p className="text-sm text-muted-foreground mb-3">/{shop.slug}</p>
          {shop.about_text && <p className="text-muted-foreground text-sm line-clamp-3">{shop.about_text}</p>}
          {shop.contact_phone && (
            <p className="text-sm text-muted-foreground mt-3">📞 {shop.contact_phone}</p>
          )}
          {shop.city && shop.state && (
            <p className="text-sm text-muted-foreground mt-1">📍 {shop.city}, {shop.state}</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default MyShop;
