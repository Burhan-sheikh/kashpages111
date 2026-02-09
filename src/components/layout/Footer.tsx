import { Link } from "react-router-dom";

const footerLinks = {
  Product: [
    { label: "Features", href: "/explore" },
    { label: "Pricing", href: "/pricing" },
    { label: "Templates", href: "/explore" },
  ],
  Company: [
    { label: "About", href: "/about" },
    { label: "Privacy", href: "/privacy" },
    { label: "Terms", href: "/terms" },
  ],
  Support: [
    { label: "Help Center", href: "#" },
    { label: "Contact", href: "#" },
    { label: "Status", href: "#" },
  ],
};

const Footer = () => {
  return (
    <footer className="bg-secondary text-secondary-foreground">
      <div className="container mx-auto px-4 lg:px-8 py-16">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="col-span-2 md:col-span-1">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
                <span className="font-display font-bold text-primary-foreground text-sm">K</span>
              </div>
              <span className="font-display font-bold text-xl text-secondary-foreground">
                Kashpages
              </span>
            </div>
            <p className="text-secondary-foreground/60 text-sm leading-relaxed">
              Empowering Kashmir's businesses with beautiful, instant web presence.
            </p>
          </div>

          {/* Links */}
          {Object.entries(footerLinks).map(([category, links]) => (
            <div key={category}>
              <h4 className="font-body font-semibold text-sm text-secondary-foreground/80 uppercase tracking-wider mb-4">
                {category}
              </h4>
              <ul className="space-y-2.5">
                {links.map((link) => (
                  <li key={link.label}>
                    <Link
                      to={link.href}
                      className="text-sm text-secondary-foreground/50 hover:text-primary transition-colors"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="border-t border-secondary-foreground/10 mt-12 pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-xs text-secondary-foreground/40">
            © {new Date().getFullYear()} Kashpages. All rights reserved.
          </p>
          <p className="text-xs text-secondary-foreground/40">
            Made with ❤️ for Kashmir
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
