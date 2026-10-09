import { Shield } from "lucide-react";

const Footer = () => (
  <footer className="bg-foreground text-background py-10 md:py-14">
    <div className="container mx-auto px-4">
      <div className="grid md:grid-cols-3 gap-8 mb-8">
        <div className="md:col-span-2">
          <div className="flex items-center gap-2 mb-3">
            <div className="w-8 h-8 border-2 border-background/30 rounded-lg flex items-center justify-center bg-primary">
              <img src="/favicon.png" alt="Logo" className="w-4 h-4" />
            </div>
            <span className="font-extrabold text-lg">Kokurikuler Online</span>
          </div>
          <p className="text-sm text-background/70 mb-3">Platform AI untuk membuat dokumen kegiatan kokurikuler sesuai Kurikulum Merdeka.</p>
          <div className="flex items-center gap-1.5 text-xs text-background/70">
            <Shield size={14} /> Aman & Terpercaya
          </div>
        </div>
        <div>
          <p className="font-bold text-sm mb-3">Tautan</p>
          <div className="flex flex-col gap-2 text-sm text-background/70">
            <a href="/auth" className="hover:text-background transition-colors">Masuk</a>
            <a href="mailto:support@kokurikuler.online" className="hover:text-background transition-colors">Hubungi Kami</a>
          </div>
        </div>
      </div>
      <div className="border-t border-background/10 pt-6 flex flex-col md:flex-row justify-between items-center gap-2 text-xs text-background/70">
        <p>© {new Date().getFullYear()} Kokurikuler Online. Hak cipta dilindungi.</p>
        <div className="flex gap-4">
          <a href="#" className="hover:text-background transition-colors">Syarat & Ketentuan</a>
          <a href="#" className="hover:text-background transition-colors">Kebijakan Privasi</a>
        </div>
      </div>
    </div>
  </footer>
);

export default Footer;
