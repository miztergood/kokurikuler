import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Menu, X } from "lucide-react";
import { Button } from "@/components/ui/button";

const PURCHASE_URL = "https://aidukasi.shop/checkout?id=PRD-15";

const navLinks = [
  { label: "Fitur", href: "#fitur" },
  { label: "Keunggulan", href: "#mengapa-kami" },
  { label: "Testimoni", href: "#testimoni" },
];

const Navbar = () => {
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();

  const handleGetAccess = () => window.open(PURCHASE_URL, "_blank");

  return (
    <header className="sticky top-0 z-50 bg-card/95 backdrop-blur-sm border-b-2 border-foreground">
      <div className="container mx-auto px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-9 h-9 border-2 border-foreground rounded-lg shadow-brutal-sm flex items-center justify-center bg-primary">
            <img src="/favicon.png" alt="Kokurikuler Online logo" className="w-5 h-5" />
          </div>
          <div className="flex flex-col leading-tight">
            <span className="font-extrabold text-sm md:text-base">Kokurikuler Online</span>
            <span className="text-[10px] text-muted-foreground hidden sm:block">Kokurikuler — Kurikulum Merdeka</span>
          </div>
        </div>

        <nav className="hidden md:flex items-center gap-6">
          {navLinks.map((l) => (
            <a key={l.href} href={l.href} className="text-sm font-bold hover:text-primary transition-colors">
              {l.label}
            </a>
          ))}
        </nav>

        <div className="hidden md:flex items-center gap-2">
          <Button variant="outline" className="border-2 border-foreground shadow-brutal-sm hover:shadow-brutal-hover hover:translate-x-[2px] hover:translate-y-[2px] transition-all" onClick={() => navigate("/auth")}>
            Masuk
          </Button>
          <Button className="border-2 border-foreground shadow-brutal-sm hover:shadow-brutal-hover hover:translate-x-[2px] hover:translate-y-[2px] transition-all" onClick={handleGetAccess}>
            Dapatkan Akses
          </Button>
        </div>

        <button className="md:hidden p-2" onClick={() => setOpen(!open)} aria-label="Toggle menu">
          {open ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {open && (
        <div className="md:hidden border-t-2 border-foreground bg-card px-4 py-4 flex flex-col gap-3">
          {navLinks.map((l) => (
            <a key={l.href} href={l.href} className="text-sm font-bold hover:text-primary" onClick={() => setOpen(false)}>
              {l.label}
            </a>
          ))}
          <div className="flex flex-col gap-2 pt-2 border-t border-foreground/10">
            <Button variant="outline" className="border-2 border-foreground shadow-brutal-sm w-full" onClick={() => { navigate("/auth"); setOpen(false); }}>
              Masuk
            </Button>
            <Button className="border-2 border-foreground shadow-brutal-sm w-full" onClick={() => { handleGetAccess(); setOpen(false); }}>
              Dapatkan Akses
            </Button>
          </div>
        </div>
      )}
    </header>
  );
};

export default Navbar;
