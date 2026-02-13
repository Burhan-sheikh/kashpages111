import { useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Loader2 } from "lucide-react";

interface ContentBlock {
  id: string;
  type: string;
  props: Record<string, unknown>;
  order: number;
}

// Reuse BlockRenderer from PublicPage - simplified inline for preview
const BlockRenderer = ({ block }: { block: ContentBlock }) => {
  switch (block.type) {
    case "hero":
      return (
        <section className="bg-hero-gradient py-20 text-center">
          <div className="container mx-auto px-4">
            <h1 className="text-4xl md:text-5xl font-display font-bold text-secondary-foreground mb-4">{block.props.title as string}</h1>
            <p className="text-lg text-secondary-foreground/70 mb-8 max-w-xl mx-auto">{block.props.subtitle as string}</p>
            {block.props.buttonText && (
              <span className="inline-block px-6 py-3 rounded-lg bg-primary text-primary-foreground font-medium">{block.props.buttonText as string}</span>
            )}
          </div>
        </section>
      );
    case "features":
      return (
        <section className="py-16 bg-background">
          <div className="container mx-auto px-4">
            <h2 className="text-3xl font-display font-bold text-foreground text-center mb-10">{block.props.title as string}</h2>
            <div className="grid md:grid-cols-3 gap-6">
              {(block.props.items as Array<{ title: string; desc: string }>)?.map((item, i) => (
                <div key={i} className="p-6 rounded-xl bg-card-gradient border border-border/50 text-center">
                  <h3 className="font-display font-semibold text-foreground mb-2">{item.title}</h3>
                  <p className="text-sm text-muted-foreground">{item.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>
      );
    case "testimonials":
      return (
        <section className="py-16 bg-muted/30">
          <div className="container mx-auto px-4">
            <h2 className="text-3xl font-display font-bold text-foreground text-center mb-10">{block.props.title as string}</h2>
            {(block.props.items as Array<{ name: string; text: string }>)?.map((item, i) => (
              <div key={i} className="p-6 rounded-xl bg-card-gradient border border-border/50 max-w-lg mx-auto mb-4">
                <p className="italic text-muted-foreground">"{item.text}"</p>
                <p className="font-semibold text-foreground text-sm mt-2">— {item.name}</p>
              </div>
            ))}
          </div>
        </section>
      );
    case "pricing":
      return (
        <section className="py-16 bg-background">
          <div className="container mx-auto px-4">
            <h2 className="text-3xl font-display font-bold text-foreground text-center mb-10">{block.props.title as string}</h2>
            <div className="grid md:grid-cols-3 gap-6 max-w-4xl mx-auto">
              {(block.props.plans as Array<{ name: string; price: string; features: string[] }>)?.map((plan, i) => (
                <div key={i} className="p-6 rounded-xl bg-card-gradient border border-border/50 text-center">
                  <h3 className="font-display font-bold text-foreground text-lg">{plan.name}</h3>
                  <p className="text-3xl font-bold text-primary my-4">{plan.price}</p>
                  <ul className="text-sm text-muted-foreground space-y-2">{plan.features.map((f, fi) => <li key={fi}>✓ {f}</li>)}</ul>
                </div>
              ))}
            </div>
          </div>
        </section>
      );
    case "faq":
      return (
        <section className="py-16 bg-muted/30">
          <div className="container mx-auto px-4 max-w-2xl">
            <h2 className="text-3xl font-display font-bold text-foreground text-center mb-10">{block.props.title as string}</h2>
            {(block.props.items as Array<{ q: string; a: string }>)?.map((item, i) => (
              <div key={i} className="p-5 rounded-xl bg-card-gradient border border-border/50 mb-3">
                <h3 className="font-semibold text-foreground mb-2">{item.q}</h3>
                <p className="text-sm text-muted-foreground">{item.a}</p>
              </div>
            ))}
          </div>
        </section>
      );
    case "contact":
      return (
        <section className="py-16 bg-background text-center">
          <div className="container mx-auto px-4 max-w-lg">
            <h2 className="text-3xl font-display font-bold text-foreground mb-6">{block.props.title as string}</h2>
            {block.props.email && <p className="text-muted-foreground">{block.props.email as string}</p>}
            {block.props.phone && <p className="text-muted-foreground">{block.props.phone as string}</p>}
          </div>
        </section>
      );
    case "heading":
      return <div className="container mx-auto px-4 py-6"><h2 className="text-2xl font-display font-bold text-foreground">{block.props.text as string}</h2></div>;
    case "paragraph":
      return <div className="container mx-auto px-4 py-4"><p className="text-muted-foreground">{block.props.text as string}</p></div>;
    case "divider":
      return <div className="container mx-auto px-4"><hr className="border-border my-8" /></div>;
    case "spacer":
      return <div style={{ height: (block.props.height as number) || 48 }} />;
    default:
      return (
        <div className="container mx-auto px-4 py-8 text-center">
          <div className="p-6 bg-muted/30 rounded-xl">
            <p className="text-muted-foreground capitalize">{block.type} Section</p>
          </div>
        </div>
      );
  }
};

const PreviewTemplate = () => {
  const { id } = useParams<{ id: string }>();
  const { data: template, isLoading } = useQuery({
    queryKey: ["template-preview", id],
    queryFn: async () => {
      const { data, error } = await supabase.from("templates").select("*").eq("id", id).single();
      if (error) throw error;
      return data;
    },
  });

  if (isLoading) return <div className="min-h-screen flex items-center justify-center bg-background"><Loader2 className="animate-spin text-primary" size={32} /></div>;
  if (!template) return <div className="min-h-screen flex items-center justify-center bg-background"><p className="text-muted-foreground">Template not found</p></div>;

  const blocks = (template.schema as unknown as ContentBlock[]) || [];

  return (
    <div className="min-h-screen bg-background">
      <div className="bg-primary text-primary-foreground text-center py-2 text-sm font-medium">
        Preview: {template.name} — <a href={`/builder?template=${template.id}`} className="underline">Use This Template</a>
      </div>
      {blocks.sort((a, b) => a.order - b.order).map((block) => (
        <BlockRenderer key={block.id} block={block} />
      ))}
      <footer className="py-6 text-center text-sm text-muted-foreground border-t border-border">
        Built with <a href="/" className="text-primary hover:underline">Kashpages</a>
      </footer>
    </div>
  );
};

const PreviewUserPage = () => {
  const { id } = useParams<{ id: string }>();
  const { data: page, isLoading } = useQuery({
    queryKey: ["page-preview", id],
    queryFn: async () => {
      const { data, error } = await supabase.from("pages").select("*").eq("id", id).single();
      if (error) throw error;
      return data;
    },
  });

  if (isLoading) return <div className="min-h-screen flex items-center justify-center bg-background"><Loader2 className="animate-spin text-primary" size={32} /></div>;
  if (!page) return <div className="min-h-screen flex items-center justify-center bg-background"><p className="text-muted-foreground">Page not found</p></div>;

  const blocks = (page.content_schema as unknown as ContentBlock[]) || [];

  return (
    <div className="min-h-screen bg-background">
      <div className="bg-primary text-primary-foreground text-center py-2 text-sm font-medium">
        Preview: {page.title} ({page.status})
      </div>
      {blocks.sort((a, b) => a.order - b.order).map((block) => (
        <BlockRenderer key={block.id} block={block} />
      ))}
    </div>
  );
};

export { PreviewTemplate, PreviewUserPage };
