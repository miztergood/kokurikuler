import Navbar from "@/components/landing/Navbar";
import HeroSection from "@/components/landing/HeroSection";
import StatsSection from "@/components/landing/StatsSection";
import FeaturesSection from "@/components/landing/FeaturesSection";
import WhyUsSection from "@/components/landing/WhyUsSection";
import TestimonialsSection from "@/components/landing/TestimonialsSection";
import ProductShowcase from "@/components/landing/ProductShowcase";
import CTASection from "@/components/landing/CTASection";
import Footer from "@/components/landing/Footer";

const Index = () => (
  <div className="min-h-screen bg-background flex flex-col">
    <Navbar />
    <main>
      <HeroSection />
      <StatsSection />
      <FeaturesSection />
      <WhyUsSection />
      <TestimonialsSection />
      <ProductShowcase />
      <CTASection />
    </main>
    <Footer />
  </div>
);

export default Index;
