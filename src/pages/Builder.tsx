import { useState, useCallback, useEffect } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Link, useSearchParams, useNavigate } from "react-router-dom";
import {
  ArrowLeft, Eye, Save, Undo2, Redo2, Monitor, Tablet, Smartphone,
  Plus, GripVertical, Type, AlignLeft, Image, Video, MousePointer,
  Layout, Star, DollarSign, HelpCircle, Grid, Mail, Minus, Move,
  Share2, MapPin, Trash2, Send, Loader2
} from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useQuery } from "@tanstack/react-query";
import type { Json } from "@/integrations/supabase/types";

type BlockType =
  | "hero" | "features" | "testimonials" | "pricing"
  | "faq" | "gallery" | "contact" | "footer"
  | "heading" | "paragraph" | "button" | "image"
  | "video" | "form" | "divider" | "spacer"
  | "social-links" | "map";

interface ContentBlock {
  id: string;
  type: BlockType;
  props: Record<string, unknown>;
  order: number;
}

const blockCategories = [
  {
    label: "Sections",
    blocks: [
      { type: "hero" as BlockType, icon: Layout, label: "Hero" },
      { type: "features" as BlockType, icon: Grid, label: "Features" },
      { type: "testimonials" as BlockType, icon: Star, label: "Testimonials" },
      { type: "pricing" as BlockType, icon: DollarSign, label: "Pricing" },
      { type: "faq" as BlockType, icon: HelpCircle, label: "FAQ" },
      { type: "gallery" as BlockType, icon: Image, label: "Gallery" },
      { type: "contact" as BlockType, icon: Mail, label: "Contact" },
    ],
  },
  {
    label: "Elements",
    blocks: [
      { type: "heading" as BlockType, icon: Type, label: "Heading" },
      { type: "paragraph" as BlockType, icon: AlignLeft, label: "Paragraph" },
      { type: "button" as BlockType, icon: MousePointer, label: "Button" },
      { type: "image" as BlockType, icon: Image, label: "Image" },
      { type: "video" as BlockType, icon: Video, label: "Video" },
      { type: "divider" as BlockType, icon: Minus, label: "Divider" },
      { type: "spacer" as BlockType, icon: Move, label: "Spacer" },
      { type: "social-links" as BlockType, icon: Share2, label: "Social Links" },
      { type: "map" as BlockType, icon: MapPin, label: "Map" },
    ],
  },
];

const defaultBlockProps: Record<BlockType, Record<string, unknown>> = {
  hero: { title: "Welcome to My Business", subtitle: "We provide the best services in Kashmir", buttonText: "Learn More", buttonUrl: "#" },
  features: { title: "Our Features", items: [{ title: "Quality", desc: "Best quality products" }, { title: "Fast", desc: "Quick delivery" }, { title: "Trusted", desc: "Trusted by thousands" }] },
  testimonials: { title: "What People Say", items: [{ name: "Ahmed", text: "Excellent service!", rating: 5 }] },
  pricing: { title: "Pricing", plans: [{ name: "Basic", price: "₹499", features: ["Feature 1", "Feature 2"] }] },
  faq: { title: "FAQ", items: [{ q: "How does it work?", a: "Simply sign up and start building." }] },
  gallery: { title: "Gallery", images: [] },
  contact: { title: "Contact Us", email: "", phone: "" },
  footer: { text: "© 2026 My Business" },
  heading: { text: "Section Heading", level: "h2" },
  paragraph: { text: "Add your content here. Click to edit." },
  button: { text: "Click Me", url: "#", variant: "primary" },
  image: { src: "", alt: "Image description" },
  video: { src: "", title: "Video" },
  form: { fields: [] },
  divider: { style: "solid" },
  spacer: { height: 48 },
  "social-links": { links: [] },
  map: { address: "Srinagar, Kashmir" },
};

const BlockPreview = ({ block, isSelected, onClick, onDelete }: { block: ContentBlock; isSelected: boolean; onClick: () => void; onDelete: () => void }) => {
  const renderContent = () => {
    switch (block.type) {
      case "hero":
        return (
          <div className="bg-hero-gradient p-8 rounded-lg text-center">
            <h2 className="text-2xl font-display font-bold text-secondary-foreground mb-2">{block.props.title as string}</h2>
            <p className="text-secondary-foreground/60 text-sm mb-4">{block.props.subtitle as string}</p>
            <span className="inline-block px-4 py-2 rounded-lg bg-primary text-primary-foreground text-sm font-medium">{block.props.buttonText as string}</span>
          </div>
        );
      case "heading":
        return <h2 className="text-xl font-display font-bold text-foreground">{block.props.text as string}</h2>;
      case "paragraph":
        return <p className="text-muted-foreground text-sm">{block.props.text as string}</p>;
      case "divider":
        return <hr className="border-border" />;
      case "spacer":
        return <div style={{ height: block.props.height as number }} className="bg-muted/30 rounded flex items-center justify-center text-xs text-muted-foreground">{block.props.height as number}px</div>;
      case "button":
        return <span className="inline-block px-4 py-2 rounded-lg bg-primary text-primary-foreground text-sm font-medium">{block.props.text as string}</span>;
      case "features":
        return (
          <div className="text-center">
            <h3 className="font-display font-bold text-foreground mb-3">{block.props.title as string}</h3>
            <div className="grid grid-cols-3 gap-2">
              {(block.props.items as Array<{ title: string; desc: string }>).map((item, i) => (
                <div key={i} className="p-3 rounded-lg bg-muted/50">
                  <p className="text-xs font-semibold text-foreground">{item.title}</p>
                  <p className="text-xs text-muted-foreground">{item.desc}</p>
                </div>
              ))}
            </div>
          </div>
        );
      case "testimonials":
        return (
          <div className="text-center">
            <h3 className="font-display font-bold text-foreground mb-3">{block.props.title as string}</h3>
            {(block.props.items as Array<{ name: string; text: string }>).map((item, i) => (
              <div key={i} className="p-3 bg-muted/50 rounded-lg">
                <p className="text-sm italic text-muted-foreground">"{item.text}"</p>
                <p className="text-xs font-medium text-foreground mt-1">— {item.name}</p>
              </div>
            ))}
          </div>
        );
      case "pricing":
        return (
          <div className="text-center">
            <h3 className="font-display font-bold text-foreground mb-3">{block.props.title as string}</h3>
            {(block.props.plans as Array<{ name: string; price: string; features: string[] }>).map((plan, i) => (
              <div key={i} className="p-4 bg-muted/50 rounded-lg">
                <p className="font-semibold text-foreground">{plan.name}</p>
                <p className="text-xl font-bold text-primary">{plan.price}</p>
                <ul className="text-xs text-muted-foreground mt-2 space-y-1">{plan.features.map((f, fi) => <li key={fi}>✓ {f}</li>)}</ul>
              </div>
            ))}
          </div>
        );
      case "faq":
        return (
          <div>
            <h3 className="font-display font-bold text-foreground mb-3 text-center">{block.props.title as string}</h3>
            {(block.props.items as Array<{ q: string; a: string }>).map((item, i) => (
              <div key={i} className="p-3 bg-muted/50 rounded-lg mb-2">
                <p className="text-sm font-medium text-foreground">{item.q}</p>
                <p className="text-xs text-muted-foreground mt-1">{item.a}</p>
              </div>
            ))}
          </div>
        );
      case "contact":
        return (
          <div className="text-center p-4 bg-muted/30 rounded-lg">
            <h3 className="font-display font-bold text-foreground mb-2">{block.props.title as string}</h3>
            <p className="text-sm text-muted-foreground">{(block.props.email as string) || "email@example.com"}</p>
            <p className="text-sm text-muted-foreground">{(block.props.phone as string) || "+91 XXXXXXXXXX"}</p>
          </div>
        );
      default:
        return (
          <div className="p-4 bg-muted/30 rounded-lg text-center">
            <p className="text-sm text-muted-foreground capitalize">{block.type} Block</p>
          </div>
        );
    }
  };

  return (
    <motion.div layout onClick={onClick} className={`group relative p-4 rounded-xl border-2 transition-all cursor-pointer ${isSelected ? "border-primary shadow-saffron" : "border-transparent hover:border-border"}`}>
      <div className="absolute -left-3 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity cursor-grab">
        <GripVertical size={16} className="text-muted-foreground" />
      </div>
      {renderContent()}
      {isSelected && (
        <div className="absolute -top-2 -right-2 flex gap-1">
          <button onClick={(e) => { e.stopPropagation(); onDelete(); }} className="w-6 h-6 rounded-full bg-destructive flex items-center justify-center shadow-sm">
            <Trash2 size={12} className="text-destructive-foreground" />
          </button>
        </div>
      )}
    </motion.div>
  );
};

const Builder = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { user, profile } = useAuth();
  const { toast } = useToast();

  const templateId = searchParams.get("template");
  const pageId = searchParams.get("page");

  const [blocks, setBlocks] = useState<ContentBlock[]>([]);
  const [selectedBlockId, setSelectedBlockId] = useState<string | null>(null);
  const [previewMode, setPreviewMode] = useState<"desktop" | "tablet" | "mobile">("desktop");
  const [title, setTitle] = useState("Untitled Page");
  const [slug, setSlug] = useState("");
  const [saving, setSaving] = useState(false);
  const [loaded, setLoaded] = useState(false);

  // Load template schema
  const { data: template } = useQuery({
    queryKey: ["template", templateId],
    queryFn: async () => {
      if (!templateId) return null;
      const { data, error } = await supabase.from("templates").select("*").eq("id", templateId).single();
      if (error) throw error;
      return data;
    },
    enabled: !!templateId && !pageId,
  });

  // Load existing page
  const { data: existingPage } = useQuery({
    queryKey: ["page-edit", pageId],
    queryFn: async () => {
      if (!pageId) return null;
      const { data, error } = await supabase.from("pages").select("*").eq("id", pageId).single();
      if (error) throw error;
      return data;
    },
    enabled: !!pageId,
  });

  useEffect(() => {
    if (loaded) return;
    if (existingPage) {
      setBlocks((existingPage.content_schema as unknown as ContentBlock[]) || []);
      setTitle(existingPage.title);
      setSlug(existingPage.slug);
      setLoaded(true);
    } else if (template && !pageId) {
      setBlocks((template.schema as unknown as ContentBlock[]) || []);
      setTitle(template.name);
      setSlug(template.name.toLowerCase().replace(/[^a-z0-9]+/g, "-"));
      setLoaded(true);
    } else if (!templateId && !pageId) {
      setBlocks([
        { id: "1", type: "hero", props: defaultBlockProps.hero, order: 0 },
      ]);
      setLoaded(true);
    }
  }, [template, existingPage, templateId, pageId, loaded]);

  const addBlock = useCallback((type: BlockType) => {
    const newBlock: ContentBlock = {
      id: Date.now().toString(),
      type,
      props: { ...defaultBlockProps[type] },
      order: blocks.length,
    };
    setBlocks((prev) => [...prev, newBlock]);
    setSelectedBlockId(newBlock.id);
  }, [blocks.length]);

  const removeBlock = useCallback((id: string) => {
    setBlocks((prev) => prev.filter((b) => b.id !== id));
    setSelectedBlockId((prev) => (prev === id ? null : prev));
  }, []);

  const handleSave = async (submitForApproval = false) => {
    if (!user || !profile) {
      toast({ title: "Please log in first", variant: "destructive" });
      navigate("/login");
      return;
    }
    if (!title.trim() || !slug.trim()) {
      toast({ title: "Title and slug required", variant: "destructive" });
      return;
    }
    setSaving(true);
    try {
      const pageData = {
        title: title.trim(),
        slug: slug.trim().toLowerCase().replace(/[^a-z0-9-]/g, ""),
        content_schema: blocks as unknown as Json,
        status: submitForApproval ? "pending" : "draft",
        template_id: templateId || undefined,
      };
      if (pageId) {
        const { error } = await supabase.from("pages").update(pageData).eq("id", pageId);
        if (error) throw error;
      } else {
        const { error } = await supabase.from("pages").insert({ ...pageData, owner_id: user.id });
        if (error) throw error;
      }
      toast({ title: submitForApproval ? "Submitted for approval!" : "Page saved!" });
      navigate("/dashboard");
    } catch (err: any) {
      toast({ title: "Save failed", description: err.message, variant: "destructive" });
    } finally {
      setSaving(false);
    }
  };

  const previewWidths = { desktop: "100%", tablet: "768px", mobile: "375px" };

  return (
    <div className="h-screen flex flex-col bg-background overflow-hidden">
      <header className="h-14 border-b border-border flex items-center justify-between px-4 bg-card-gradient flex-shrink-0">
        <div className="flex items-center gap-3">
          <Link to="/dashboard">
            <Button variant="ghost" size="icon"><ArrowLeft size={18} /></Button>
          </Link>
          <div className="flex items-center gap-2">
            <input value={title} onChange={(e) => setTitle(e.target.value)} className="text-sm font-semibold text-foreground bg-transparent border-none focus:outline-none focus:ring-0 w-48" />
            <span className="text-xs text-muted-foreground">/</span>
            <input value={slug} onChange={(e) => setSlug(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ""))} placeholder="slug" className="text-xs text-muted-foreground bg-transparent border-none focus:outline-none focus:ring-0 w-32" />
          </div>
        </div>

        <div className="flex items-center gap-1 bg-muted rounded-lg p-1">
          {([["desktop", Monitor], ["tablet", Tablet], ["mobile", Smartphone]] as const).map(([mode, Icon]) => (
            <button key={mode} onClick={() => setPreviewMode(mode)} className={`p-1.5 rounded-md transition-colors ${previewMode === mode ? "bg-background shadow-sm text-foreground" : "text-muted-foreground hover:text-foreground"}`}>
              <Icon size={16} />
            </button>
          ))}
        </div>

        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={() => handleSave(false)} disabled={saving}>
            <Save size={14} className="mr-1" /> {saving ? "Saving…" : "Save Draft"}
          </Button>
          <Button variant="hero" size="sm" onClick={() => handleSave(true)} disabled={saving}>
            <Send size={14} className="mr-1" /> Submit
          </Button>
        </div>
      </header>

      <div className="flex flex-1 overflow-hidden">
        <aside className="w-64 border-r border-border bg-card-gradient overflow-y-auto flex-shrink-0">
          <div className="p-4">
            <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">Add Blocks</h3>
            {blockCategories.map((cat) => (
              <div key={cat.label} className="mb-4">
                <p className="text-xs font-medium text-muted-foreground mb-2">{cat.label}</p>
                <div className="grid grid-cols-3 gap-1.5">
                  {cat.blocks.map((block) => (
                    <button key={block.type} onClick={() => addBlock(block.type)} className="flex flex-col items-center gap-1 p-2 rounded-lg hover:bg-accent transition-colors text-muted-foreground hover:text-foreground">
                      <block.icon size={18} />
                      <span className="text-[10px] font-medium">{block.label}</span>
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </aside>

        <main className="flex-1 overflow-auto bg-muted/30 p-6">
          <div className="mx-auto bg-background rounded-xl border border-border shadow-card min-h-[600px] transition-all duration-300" style={{ maxWidth: previewWidths[previewMode] }}>
            <div className="p-6 space-y-2">
              {blocks.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-20 text-muted-foreground">
                  <Plus size={32} className="mb-3 text-border" />
                  <p className="text-sm">Click a block from the sidebar to start building</p>
                </div>
              ) : (
                blocks.map((block) => (
                  <BlockPreview key={block.id} block={block} isSelected={selectedBlockId === block.id} onClick={() => setSelectedBlockId(block.id)} onDelete={() => removeBlock(block.id)} />
                ))
              )}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default Builder;
