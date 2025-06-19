
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
      {/* Realistic Night Sky Hero Section */}
      <div className="relative min-h-screen flex items-center justify-center overflow-hidden">
        {/* Deep Space Background */}
        <div className="absolute inset-0 bg-gradient-radial from-slate-900 via-slate-800 to-black" />
        
        {/* Galaxy Background Image */}
        <div 
          className="absolute inset-0 bg-cover bg-center bg-no-repeat opacity-40"
          style={{
            backgroundImage: `url('/lovable-uploads/67136609-4373-4092-9e65-982fdf71ae0d.png')`,
          }}
        />
        
        {/* Subtle gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-black/10 to-black/30" />
        
        {/* Realistic Star Field */}
        <div className="absolute inset-0">
          {/* Various sized stars with natural twinkling */}
          {[...Array(200)].map((_, i) => {
            const size = Math.random() * 1.5 + 0.3;
            const opacity = Math.random() * 0.8 + 0.2;
            const animationDelay = Math.random() * 8;
            const animationDuration = Math.random() * 4 + 2;
            
            return (
              <div
                key={i}
                className="absolute bg-white rounded-full"
                style={{
                  width: size + 'px',
                  height: size + 'px',
                  top: Math.random() * 100 + '%',
                  left: Math.random() * 100 + '%',
                  opacity: opacity,
                  animation: `twinkle ${animationDuration}s ease-in-out infinite`,
                  animationDelay: animationDelay + 's'
                }}
              />
            );
          })}
          
          {/* Larger prominent stars */}
          {[...Array(15)].map((_, i) => (
            <div
              key={`bright-${i}`}
              className="absolute bg-white rounded-full shadow-white shadow-sm"
              style={{
                width: '2px',
                height: '2px',
                top: Math.random() * 100 + '%',
                left: Math.random() * 100 + '%',
                opacity: 0.9,
                animation: `slowTwinkle ${3 + Math.random() * 3}s ease-in-out infinite`,
                animationDelay: Math.random() * 5 + 's'
              }}
            />
          ))}
          
          {/* Subtle meteor trails - very infrequent */}
          {[...Array(3)].map((_, i) => (
            <div
              key={`meteor-${i}`}
              className="absolute opacity-0"
              style={{
                top: Math.random() * 40 + '%',
                left: '-10px',
                animation: `meteor ${8 + Math.random() * 5}s linear infinite`,
                animationDelay: Math.random() * 15 + 's'
              }}
            >
              <div className="w-0.5 h-0.5 bg-blue-200 rounded-full" />
              <div className="absolute -left-4 top-0 w-4 h-px bg-gradient-to-r from-transparent via-blue-200/40 to-transparent" />
            </div>
          ))}
          
          {/* Distant nebula glow */}
          <div className="absolute inset-0 opacity-20">
            <div 
              className="absolute w-96 h-96 rounded-full blur-3xl"
              style={{
                background: 'radial-gradient(circle, rgba(99, 102, 241, 0.1) 0%, transparent 70%)',
                top: '20%',
                left: '15%',
                animation: 'slowPulse 12s ease-in-out infinite'
              }}
            />
            <div 
              className="absolute w-64 h-64 rounded-full blur-2xl"
              style={{
                background: 'radial-gradient(circle, rgba(139, 92, 246, 0.08) 0%, transparent 70%)',
                top: '60%',
                right: '20%',
                animation: 'slowPulse 15s ease-in-out infinite reverse'
              }}
            />
          </div>
        </div>

        {/* Content */}
        <div className="text-center text-white z-10 px-4 max-w-5xl mx-auto">
          {/* Logo/Brand */}
          <div className="mb-8">
            <h1 className="text-5xl md:text-7xl font-bold tracking-wider mb-4 bg-gradient-to-r from-blue-200 via-white to-blue-200 bg-clip-text text-transparent">
              ORBIT OPS
            </h1>
            <div className="flex items-center justify-center gap-3 text-xl md:text-2xl text-gray-300">
              <Star className="h-5 w-5 text-blue-300 opacity-80" />
              <span className="font-light tracking-wide">Intelligent Infrastructure Management</span>
              <Star className="h-5 w-5 text-blue-300 opacity-80" />
            </div>
          </div>

          {/* Main Content */}
          <div className="mb-12">
            <p className="text-xl md:text-3xl text-gray-200 max-w-4xl mx-auto leading-relaxed font-light">
              Experience the future of cloud infrastructure monitoring and management. 
              <br />
              <span className="bg-gradient-to-r from-cyan-200 to-blue-200 bg-clip-text text-transparent font-medium">
                AI-powered insights, real-time analytics, and intelligent automation.
              </span>
            </p>
          </div>

          {/* Feature Highlights */}
          <div className="grid md:grid-cols-3 gap-8 mb-16 max-w-5xl mx-auto">
            <div className="text-center transform hover:scale-105 transition-all duration-500 group">
              <div className="bg-white/5 backdrop-blur-sm rounded-full p-6 w-20 h-20 mx-auto mb-6 flex items-center justify-center hover:bg-white/10 transition-all duration-300 border border-white/10 group-hover:border-white/20">
                <Rocket className="h-10 w-10 text-blue-300 group-hover:text-blue-200 transition-colors" />
              </div>
              <h3 className="text-xl font-semibold mb-3 text-blue-200">AI-Powered</h3>
              <p className="text-gray-300 text-sm leading-relaxed">Intelligent insights and automated optimization for your infrastructure</p>
            </div>
            <div className="text-center transform hover:scale-105 transition-all duration-500 group">
              <div className="bg-white/5 backdrop-blur-sm rounded-full p-6 w-20 h-20 mx-auto mb-6 flex items-center justify-center hover:bg-white/10 transition-all duration-300 border border-white/10 group-hover:border-white/20">
                <Shield className="h-10 w-10 text-purple-300 group-hover:text-purple-200 transition-colors" />
              </div>
              <h3 className="text-xl font-semibold mb-3 text-purple-200">Secure</h3>
              <p className="text-gray-300 text-sm leading-relaxed">Enterprise-grade security and compliance monitoring</p>
            </div>
            <div className="text-center transform hover:scale-105 transition-all duration-500 group">
              <div className="bg-white/5 backdrop-blur-sm rounded-full p-6 w-20 h-20 mx-auto mb-6 flex items-center justify-center hover:bg-white/10 transition-all duration-300 border border-white/10 group-hover:border-white/20">
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
              className="bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-700 hover:to-blue-600 text-white px-12 py-4 text-xl font-semibold transform hover:scale-105 transition-all duration-300 shadow-xl hover:shadow-2xl border-0 rounded-full"
            >
              Get Early Access
            </Button>
            <Button 
              onClick={handleContactUs}
              variant="outline" 
              size="lg"
              className="border-white/30 text-white hover:bg-white/5 px-12 py-4 text-xl font-semibold transform hover:scale-105 transition-all duration-300 backdrop-blur-sm rounded-full hover:border-white/50"
            >
              Contact Us
            </Button>
          </div>

          {/* Early Access Notice */}
          <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-8 max-w-3xl mx-auto border border-white/10 shadow-xl">
            <p className="text-gray-200 text-lg">
              🚀 <strong className="text-blue-300">Early Access Available</strong> - Join our beta program and be among the first to experience the next generation of infrastructure management
            </p>
          </div>
        </div>

        {/* Subtle Scroll Indicator */}
        <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 opacity-60">
          <div className="w-6 h-10 border border-white/30 rounded-full flex justify-center backdrop-blur-sm bg-white/5">
            <div className="w-0.5 h-2 bg-white/60 rounded-full mt-2 animate-bounce"></div>
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
