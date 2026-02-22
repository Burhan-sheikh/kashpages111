import { useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Loader2 } from "lucide-react";

// Placeholder - will be fully built in Phase 7 (Public Shop Page)
const PublicPage = () => {
  const { slug } = useParams<{ slug: string }>();

  const { data: shop, isLoading } = useQuery({
    queryKey: ["public-shop", slug],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("shops")
        .select("*")
        .eq("slug", slug)
        .eq("status", "published")
        .single();
      if (error) throw error;
      return data;
    },
  });

  if (isLoading) return <div className="min-h-screen flex items-center justify-center bg-background"><Loader2 className="animate-spin text-primary" size={32} /></div>;

  if (!shop) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <h1 className="text-4xl font-display font-bold text-foreground mb-2">404</h1>
          <p className="text-muted-foreground">Shop not found</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {shop.cover_image && (
        <div className="h-64 md:h-80">
          <img src={shop.cover_image} alt={shop.title} className="w-full h-full object-cover" />
        </div>
      )}
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-display font-bold text-foreground mb-4">{shop.title}</h1>
        {shop.about_text && <p className="text-muted-foreground mb-6">{shop.about_text}</p>}
      </div>
      <footer className="py-6 text-center text-sm text-muted-foreground border-t border-border">
        Built with <a href="/" className="text-primary hover:underline">Kashpages</a>
      </footer>
    </div>
  );
};

export default PublicPage;
