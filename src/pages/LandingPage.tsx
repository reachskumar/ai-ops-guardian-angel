
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
      {/* Animated Night Sky Hero Section */}
      <div className="relative min-h-screen flex items-center justify-center overflow-hidden bg-gradient-to-b from-gray-900 via-blue-900 to-purple-900">
        {/* Animated Stars Background */}
        <div className="absolute inset-0">
          {/* Static stars */}
          {[...Array(100)].map((_, i) => (
            <div
              key={i}
              className="absolute bg-white rounded-full animate-pulse"
              style={{
                width: Math.random() * 3 + 1 + 'px',
                height: Math.random() * 3 + 1 + 'px',
                top: Math.random() * 100 + '%',
                left: Math.random() * 100 + '%',
                animationDelay: Math.random() * 3 + 's',
                animationDuration: (Math.random() * 3 + 2) + 's'
              }}
            />
          ))}
          
          {/* Shooting stars */}
          {[...Array(5)].map((_, i) => (
            <div
              key={`shooting-${i}`}
              className="absolute w-1 h-1 bg-white rounded-full opacity-80"
              style={{
                top: Math.random() * 50 + '%',
                left: '-10px',
                animation: `shootingStar ${3 + Math.random() * 2}s linear infinite`,
                animationDelay: Math.random() * 5 + 's'
              }}
            />
          ))}
          
          {/* Meteors */}
          {[...Array(3)].map((_, i) => (
            <div
              key={`meteor-${i}`}
              className="absolute w-2 h-2 bg-gradient-to-r from-yellow-400 via-orange-500 to-red-500 rounded-full opacity-70"
              style={{
                top: Math.random() * 30 + '%',
                right: '-20px',
                animation: `meteorFall ${4 + Math.random() * 3}s linear infinite`,
                animationDelay: Math.random() * 7 + 's'
              }}
            />
          ))}
        </div>

        {/* Content */}
        <div className="text-center text-white z-10 px-4 max-w-4xl mx-auto">
          {/* Logo/Brand */}
          <div className="mb-8">
            <h1 className="text-4xl md:text-6xl font-bold tracking-wider mb-2 bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent animate-pulse">
              ORBIT OPS
            </h1>
            <div className="flex items-center justify-center gap-2 text-lg md:text-xl text-gray-300">
              <Star className="h-4 w-4 animate-spin" style={{ animationDuration: '8s' }} />
              <span>Intelligent Infrastructure Management</span>
              <Star className="h-4 w-4 animate-spin" style={{ animationDuration: '8s', animationDirection: 'reverse' }} />
            </div>
          </div>

          {/* Main Content */}
          <div className="mb-12">
            <p className="text-xl md:text-2xl text-gray-200 max-w-3xl mx-auto leading-relaxed">
              Experience the future of cloud infrastructure monitoring and management. 
              AI-powered insights, real-time analytics, and intelligent automation.
            </p>
          </div>

          {/* Feature Highlights */}
          <div className="grid md:grid-cols-3 gap-8 mb-12 max-w-4xl mx-auto">
            <div className="text-center transform hover:scale-105 transition-transform duration-300">
              <div className="bg-white/10 backdrop-blur-sm rounded-full p-4 w-16 h-16 mx-auto mb-4 flex items-center justify-center hover:bg-white/20 transition-colors">
                <Rocket className="h-8 w-8" />
              </div>
              <h3 className="text-lg font-semibold mb-2">AI-Powered</h3>
              <p className="text-gray-300 text-sm">Intelligent insights and automated optimization</p>
            </div>
            <div className="text-center transform hover:scale-105 transition-transform duration-300">
              <div className="bg-white/10 backdrop-blur-sm rounded-full p-4 w-16 h-16 mx-auto mb-4 flex items-center justify-center hover:bg-white/20 transition-colors">
                <Shield className="h-8 w-8" />
              </div>
              <h3 className="text-lg font-semibold mb-2">Secure</h3>
              <p className="text-gray-300 text-sm">Enterprise-grade security and compliance</p>
            </div>
            <div className="text-center transform hover:scale-105 transition-transform duration-300">
              <div className="bg-white/10 backdrop-blur-sm rounded-full p-4 w-16 h-16 mx-auto mb-4 flex items-center justify-center hover:bg-white/20 transition-colors">
                <Zap className="h-8 w-8" />
              </div>
              <h3 className="text-lg font-semibold mb-2">Real-time</h3>
              <p className="text-gray-300 text-sm">Live monitoring and instant alerts</p>
            </div>
          </div>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Button 
              onClick={handleGetStarted}
              size="lg" 
              className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white px-8 py-3 text-lg transform hover:scale-105 transition-all duration-300 shadow-lg"
            >
              Get Early Access
            </Button>
            <Button 
              onClick={handleContactUs}
              variant="outline" 
              size="lg"
              className="border-white/30 text-white hover:bg-white/10 px-8 py-3 text-lg transform hover:scale-105 transition-all duration-300"
            >
              Contact Us
            </Button>
          </div>

          {/* Early Access Notice */}
          <div className="mt-12 bg-white/5 backdrop-blur-sm rounded-lg p-6 max-w-2xl mx-auto border border-white/10">
            <p className="text-gray-200">
              🚀 <strong>Early Access Available</strong> - Join our beta program and be among the first to experience OrbitOps
            </p>
          </div>
        </div>

        {/* Scroll Indicator */}
        <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 animate-bounce">
          <div className="w-6 h-10 border-2 border-white/30 rounded-full flex justify-center">
            <div className="w-1 h-3 bg-white/50 rounded-full mt-2 animate-pulse"></div>
          </div>
        </div>
      </div>

      {/* Contact Section */}
      <div id="contact" className="py-20 bg-card/50">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h2 className="text-4xl md:text-5xl font-serif font-light mb-8 text-foreground">
            Contact Us
          </h2>
          <p className="text-xl text-muted-foreground mb-12 max-w-2xl mx-auto">
            Ready to transform your infrastructure management? Get in touch with our team to learn more about OrbitOps.
          </p>
          
          <div className="grid md:grid-cols-2 gap-8 max-w-2xl mx-auto">
            <div className="text-center">
              <h3 className="text-lg font-semibold mb-2 text-foreground">Email</h3>
              <p className="text-muted-foreground">hello@orbitops.net</p>
            </div>
            <div className="text-center">
              <h3 className="text-lg font-semibold mb-2 text-foreground">Website</h3>
              <p className="text-muted-foreground">www.orbitops.net</p>
            </div>
          </div>

          <div className="mt-12">
            <Button 
              onClick={handleGetStarted}
              size="lg"
              className="bg-primary hover:bg-primary/90 text-white px-8 py-3"
            >
              Join the Beta
            </Button>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="py-8 border-t border-border">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <p className="text-sm text-muted-foreground">
            © 2024 OrbitOps. All rights reserved. | Powered by Innovation
          </p>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
