import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";

const Privacy = () => (
  <div className="min-h-screen bg-background">
    <Navbar />
    <section className="pt-32 pb-20 container mx-auto px-4 lg:px-8 max-w-3xl">
      <h1 className="text-4xl font-display font-bold text-foreground mb-6">Privacy Policy</h1>
      <div className="prose prose-sm text-muted-foreground space-y-4">
        <p>Last updated: February 2026</p>
        <p>Kashpages ("we", "our", or "us") is committed to protecting your privacy. This policy describes how we collect, use, and share information about you when you use our services.</p>
        <h2 className="font-display text-lg font-semibold text-foreground mt-8">Information We Collect</h2>
        <p>We collect information you provide directly, such as your name, email address, and content you create. We also collect usage data automatically when you interact with our platform.</p>
        <h2 className="font-display text-lg font-semibold text-foreground mt-8">How We Use Your Information</h2>
        <p>We use your information to provide, improve, and personalize our services, communicate with you, and ensure security of the platform.</p>
        <h2 className="font-display text-lg font-semibold text-foreground mt-8">Contact Us</h2>
        <p>If you have questions about this policy, please contact us at privacy@kashpages.com.</p>
      </div>
    </section>
    <Footer />
  </div>
);

const Terms = () => (
  <div className="min-h-screen bg-background">
    <Navbar />
    <section className="pt-32 pb-20 container mx-auto px-4 lg:px-8 max-w-3xl">
      <h1 className="text-4xl font-display font-bold text-foreground mb-6">Terms of Service</h1>
      <div className="prose prose-sm text-muted-foreground space-y-4">
        <p>Last updated: February 2026</p>
        <p>By using Kashpages, you agree to these terms. Please read them carefully before using our platform.</p>
        <h2 className="font-display text-lg font-semibold text-foreground mt-8">Use of Service</h2>
        <p>You may use Kashpages to create and publish landing pages for your business. You must not use the service for any illegal or unauthorized purpose.</p>
        <h2 className="font-display text-lg font-semibold text-foreground mt-8">User Content</h2>
        <p>You retain ownership of content you create. By publishing content, you grant us a license to display and distribute it through our platform.</p>
        <h2 className="font-display text-lg font-semibold text-foreground mt-8">Termination</h2>
        <p>We may terminate or suspend your account at any time for violations of these terms or for any other reason with reasonable notice.</p>
      </div>
    </section>
    <Footer />
  </div>
);

export { Privacy, Terms };
