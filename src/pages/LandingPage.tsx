
import React from "react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { Rocket, Star, Shield, Zap } from "lucide-react";

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
      {/* Enhanced Night Sky Hero Section */}
      <div className="relative min-h-screen flex items-center justify-center overflow-hidden">
        {/* Galaxy Background */}
        <div 
          className="absolute inset-0 bg-cover bg-center bg-no-repeat"
          style={{
            backgroundImage: `url('/lovable-uploads/67136609-4373-4092-9e65-982fdf71ae0d.png')`,
          }}
        />
        
        {/* Enhanced Overlay for better text readability */}
        <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-black/20 to-black/60" />
        
        {/* Animated Stars Layer */}
        <div className="absolute inset-0">
          {/* Twinkling stars */}
          {[...Array(150)].map((_, i) => (
            <div
              key={i}
              className="absolute bg-white rounded-full animate-pulse opacity-60"
              style={{
                width: Math.random() * 2 + 0.5 + 'px',
                height: Math.random() * 2 + 0.5 + 'px',
                top: Math.random() * 100 + '%',
                left: Math.random() * 100 + '%',
                animationDelay: Math.random() * 4 + 's',
                animationDuration: (Math.random() * 3 + 1) + 's'
              }}
            />
          ))}
          
          {/* Enhanced shooting stars */}
          {[...Array(8)].map((_, i) => (
            <div
              key={`shooting-${i}`}
              className="absolute"
              style={{
                top: Math.random() * 60 + '%',
                left: '-20px',
                animation: `shootingStar ${4 + Math.random() * 3}s linear infinite`,
                animationDelay: Math.random() * 8 + 's'
              }}
            >
              <div className="w-1 h-1 bg-white rounded-full shadow-lg shadow-white/50" />
              <div className="absolute -left-8 top-0 w-8 h-px bg-gradient-to-r from-transparent via-white to-transparent opacity-70" />
            </div>
          ))}
          
          {/* Floating particles */}
          {[...Array(30)].map((_, i) => (
            <div
              key={`particle-${i}`}
              className="absolute w-px h-px bg-white/30 rounded-full animate-float"
              style={{
                top: Math.random() * 100 + '%',
                left: Math.random() * 100 + '%',
                animationDelay: Math.random() * 10 + 's',
                animationDuration: (Math.random() * 8 + 6) + 's'
              }}
            />
          ))}
          
          {/* Galaxy dust effect */}
          <div className="absolute inset-0 opacity-20">
            <div className="absolute top-1/4 left-1/3 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl animate-pulse" 
                 style={{ animationDuration: '6s' }} />
            <div className="absolute top-1/2 right-1/4 w-64 h-64 bg-blue-500/10 rounded-full blur-2xl animate-pulse" 
                 style={{ animationDuration: '8s', animationDelay: '2s' }} />
            <div className="absolute bottom-1/3 left-1/2 w-48 h-48 bg-pink-500/10 rounded-full blur-xl animate-pulse" 
                 style={{ animationDuration: '5s', animationDelay: '4s' }} />
          </div>
        </div>

        {/* Content */}
        <div className="text-center text-white z-10 px-4 max-w-5xl mx-auto">
          {/* Logo/Brand */}
          <div className="mb-8">
            <h1 className="text-5xl md:text-7xl font-bold tracking-wider mb-4 bg-gradient-to-r from-blue-300 via-purple-300 to-pink-300 bg-clip-text text-transparent animate-pulse">
              ORBIT OPS
            </h1>
            <div className="flex items-center justify-center gap-3 text-xl md:text-2xl text-gray-200">
              <Star className="h-5 w-5 animate-spin text-yellow-300" style={{ animationDuration: '8s' }} />
              <span className="font-light tracking-wide">Intelligent Infrastructure Management</span>
              <Star className="h-5 w-5 animate-spin text-yellow-300" style={{ animationDuration: '8s', animationDirection: 'reverse' }} />
            </div>
          </div>

          {/* Main Content */}
          <div className="mb-12">
            <p className="text-xl md:text-3xl text-gray-100 max-w-4xl mx-auto leading-relaxed font-light">
              Experience the future of cloud infrastructure monitoring and management. 
              <br />
              <span className="bg-gradient-to-r from-cyan-300 to-blue-300 bg-clip-text text-transparent font-medium">
                AI-powered insights, real-time analytics, and intelligent automation.
              </span>
            </p>
          </div>

          {/* Feature Highlights */}
          <div className="grid md:grid-cols-3 gap-8 mb-16 max-w-5xl mx-auto">
            <div className="text-center transform hover:scale-110 transition-all duration-500 group">
              <div className="bg-white/5 backdrop-blur-md rounded-full p-6 w-20 h-20 mx-auto mb-6 flex items-center justify-center hover:bg-white/10 transition-all duration-300 border border-white/10 group-hover:border-white/30">
                <Rocket className="h-10 w-10 text-blue-300 group-hover:text-blue-200 transition-colors" />
              </div>
              <h3 className="text-xl font-semibold mb-3 text-blue-200">AI-Powered</h3>
              <p className="text-gray-300 text-sm leading-relaxed">Intelligent insights and automated optimization for your infrastructure</p>
            </div>
            <div className="text-center transform hover:scale-110 transition-all duration-500 group">
              <div className="bg-white/5 backdrop-blur-md rounded-full p-6 w-20 h-20 mx-auto mb-6 flex items-center justify-center hover:bg-white/10 transition-all duration-300 border border-white/10 group-hover:border-white/30">
                <Shield className="h-10 w-10 text-purple-300 group-hover:text-purple-200 transition-colors" />
              </div>
              <h3 className="text-xl font-semibold mb-3 text-purple-200">Secure</h3>
              <p className="text-gray-300 text-sm leading-relaxed">Enterprise-grade security and compliance monitoring</p>
            </div>
            <div className="text-center transform hover:scale-110 transition-all duration-500 group">
              <div className="bg-white/5 backdrop-blur-md rounded-full p-6 w-20 h-20 mx-auto mb-6 flex items-center justify-center hover:bg-white/10 transition-all duration-300 border border-white/10 group-hover:border-white/30">
                <Zap className="h-10 w-10 text-yellow-300 group-hover:text-yellow-200 transition-colors" />
              </div>
              <h3 className="text-xl font-semibold mb-3 text-yellow-200">Real-time</h3>
              <p className="text-gray-300 text-sm leading-relaxed">Live monitoring and instant alerts for critical events</p>
            </div>
          </div>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-6 justify-center items-center mb-8">
            <Button 
              onClick={handleGetStarted}
              size="lg" 
              className="bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 hover:from-blue-600 hover:via-purple-600 hover:to-pink-600 text-white px-12 py-4 text-xl font-semibold transform hover:scale-105 transition-all duration-300 shadow-xl hover:shadow-2xl border-0 rounded-full"
            >
              Get Early Access
            </Button>
            <Button 
              onClick={handleContactUs}
              variant="outline" 
              size="lg"
              className="border-white/40 text-white hover:bg-white/5 px-12 py-4 text-xl font-semibold transform hover:scale-105 transition-all duration-300 backdrop-blur-sm rounded-full hover:border-white/60"
            >
              Contact Us
            </Button>
          </div>

          {/* Early Access Notice */}
          <div className="bg-white/5 backdrop-blur-md rounded-2xl p-8 max-w-3xl mx-auto border border-white/10 shadow-xl">
            <p className="text-gray-100 text-lg">
              🚀 <strong className="text-blue-300">Early Access Available</strong> - Join our beta program and be among the first to experience the next generation of infrastructure management
            </p>
          </div>
        </div>

        {/* Enhanced Scroll Indicator */}
        <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 animate-bounce">
          <div className="w-8 h-12 border-2 border-white/40 rounded-full flex justify-center backdrop-blur-sm bg-white/5">
            <div className="w-1 h-3 bg-white/60 rounded-full mt-3 animate-pulse"></div>
          </div>
        </div>
      </div>

      {/* Contact Section */}
      <div id="contact" className="py-24 bg-gradient-to-b from-card/30 to-card/60 backdrop-blur-sm">
        <div className="max-w-5xl mx-auto px-4 text-center">
          <h2 className="text-5xl md:text-6xl font-serif font-light mb-12 text-foreground">
            Contact Us
          </h2>
          <p className="text-2xl text-muted-foreground mb-16 max-w-3xl mx-auto leading-relaxed">
            Ready to transform your infrastructure management? Get in touch with our team to learn more about OrbitOps.
          </p>
          
          <div className="grid md:grid-cols-2 gap-12 max-w-3xl mx-auto mb-16">
            <div className="text-center bg-white/5 backdrop-blur-sm rounded-2xl p-8 border border-white/10">
              <h3 className="text-2xl font-semibold mb-4 text-foreground">Email</h3>
              <p className="text-muted-foreground text-lg">hello@orbitops.net</p>
            </div>
            <div className="text-center bg-white/5 backdrop-blur-sm rounded-2xl p-8 border border-white/10">
              <h3 className="text-2xl font-semibold mb-4 text-foreground">Website</h3>
              <p className="text-muted-foreground text-lg">www.orbitops.net</p>
            </div>
          </div>

          <Button 
            onClick={handleGetStarted}
            size="lg"
            className="bg-primary hover:bg-primary/90 text-white px-12 py-4 text-xl rounded-full transform hover:scale-105 transition-all duration-300"
          >
            Join the Beta
          </Button>
        </div>
      </div>

      {/* Footer */}
      <footer className="py-12 border-t border-border/50 bg-card/20">
        <div className="max-w-5xl mx-auto px-4 text-center">
          <p className="text-muted-foreground text-lg">
            © 2024 OrbitOps. All rights reserved. | Powered by Innovation
          </p>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
