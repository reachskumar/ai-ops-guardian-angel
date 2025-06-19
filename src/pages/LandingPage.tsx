
import React from "react";
import { useNavigate } from "react-router-dom";
import { HeroSection, FeaturesSection, ContactSection, Footer } from "@/components/landing";

const LandingPage: React.FC = () => {
  const navigate = useNavigate();

  const handleGetStarted = () => {
    navigate("/auth");
  };

  const handleContactUs = () => {
    document.getElementById('contact')?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen bg-background">
      <HeroSection onGetStarted={handleGetStarted} onContactUs={handleContactUs} />
      <FeaturesSection />
      <ContactSection onGetStarted={handleGetStarted} />
      <Footer />
    </div>
  );
};

export default LandingPage;
