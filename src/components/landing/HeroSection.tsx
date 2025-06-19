
import React from "react";
import { Button } from "@/components/ui/button";
import { Rocket, Star, Shield, Zap, ArrowRight, CheckCircle, Users, Globe, TrendingUp } from "lucide-react";

interface HeroSectionProps {
  onGetStarted: () => void;
  onContactUs: () => void;
}

const HeroSection: React.FC<HeroSectionProps> = ({ onGetStarted, onContactUs }) => {
  return (
    <div className="relative min-h-screen flex items-center justify-center overflow-hidden">
      {/* Modern gradient background */}
      <div className="absolute inset-0 bg-gradient-to-br from-slate-900 via-blue-900/20 to-slate-900" />
      
      {/* Subtle geometric pattern overlay */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute inset-0" style={{
          backgroundImage: `radial-gradient(circle at 25% 25%, white 2px, transparent 2px),
                           radial-gradient(circle at 75% 75%, white 2px, transparent 2px)`,
          backgroundSize: '60px 60px'
        }} />
      </div>

      {/* Floating elements for depth */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-purple-500/10 rounded-full blur-3xl animate-pulse" style={{animationDelay: '2s'}} />
      </div>

      {/* Content */}
      <div className="relative z-10 text-center text-white px-4 max-w-6xl mx-auto">
        {/* Logo/Brand */}
        <div className="mb-12">
          <h1 className="text-6xl md:text-8xl font-bold tracking-tight mb-6 bg-gradient-to-r from-white via-blue-100 to-white bg-clip-text text-transparent">
            OrbitOps
          </h1>
          <p className="text-xl md:text-2xl text-gray-300 font-light tracking-wide">
            Next-Generation Infrastructure Management Platform
          </p>
        </div>

        {/* Main Content */}
        <div className="mb-16">
          <h2 className="text-2xl md:text-4xl text-gray-100 max-w-4xl mx-auto leading-relaxed font-light mb-8">
            Transform your cloud infrastructure with 
            <span className="bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent font-medium"> AI-powered insights</span>, 
            real-time monitoring, and intelligent automation.
          </h2>
        </div>

        {/* Feature Grid */}
        <div className="grid md:grid-cols-3 gap-8 mb-16 max-w-4xl mx-auto">
          <div className="group p-8 rounded-2xl bg-white/5 backdrop-blur-sm border border-white/10 hover:bg-white/10 hover:border-white/20 transition-all duration-300">
            <div className="w-16 h-16 mx-auto mb-6 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
              <Rocket className="h-8 w-8 text-white" />
            </div>
            <h3 className="text-xl font-semibold mb-4 text-blue-100">AI-Powered Optimization</h3>
            <p className="text-gray-300 text-sm leading-relaxed">Intelligent resource allocation and cost optimization powered by machine learning algorithms</p>
          </div>
          
          <div className="group p-8 rounded-2xl bg-white/5 backdrop-blur-sm border border-white/10 hover:bg-white/10 hover:border-white/20 transition-all duration-300">
            <div className="w-16 h-16 mx-auto mb-6 bg-gradient-to-br from-purple-500 to-pink-500 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
              <Shield className="h-8 w-8 text-white" />
            </div>
            <h3 className="text-xl font-semibold mb-4 text-purple-100">Enterprise Security</h3>
            <p className="text-gray-300 text-sm leading-relaxed">Zero-trust architecture with automated compliance monitoring and threat detection</p>
          </div>
          
          <div className="group p-8 rounded-2xl bg-white/5 backdrop-blur-sm border border-white/10 hover:bg-white/10 hover:border-white/20 transition-all duration-300">
            <div className="w-16 h-16 mx-auto mb-6 bg-gradient-to-br from-green-500 to-emerald-500 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
              <Zap className="h-8 w-8 text-white" />
            </div>
            <h3 className="text-xl font-semibold mb-4 text-green-100">Real-time Analytics</h3>
            <p className="text-gray-300 text-sm leading-relaxed">Live infrastructure monitoring with predictive analytics and instant alerting</p>
          </div>
        </div>

        {/* CTA Buttons */}
        <div className="flex flex-col sm:flex-row gap-6 justify-center items-center mb-12">
          <Button 
            onClick={onGetStarted}
            size="lg" 
            className="bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-700 hover:to-blue-600 text-white px-8 py-4 text-lg font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 group"
          >
            Start Free Trial
            <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
          </Button>
          <Button 
            onClick={onContactUs}
            variant="outline" 
            size="lg"
            className="border-white/30 text-white hover:bg-white/10 px-8 py-4 text-lg font-semibold rounded-xl backdrop-blur-sm hover:border-white/50 transition-all duration-300"
          >
            Schedule Demo
          </Button>
        </div>

        {/* Trust Indicators */}
        <div className="flex flex-wrap justify-center items-center gap-8 text-gray-400 text-sm">
          <div className="flex items-center gap-2">
            <CheckCircle className="h-4 w-4 text-green-400" />
            <span>SOC 2 Certified</span>
          </div>
          <div className="flex items-center gap-2">
            <Users className="h-4 w-4 text-blue-400" />
            <span>10,000+ Servers Managed</span>
          </div>
          <div className="flex items-center gap-2">
            <Globe className="h-4 w-4 text-purple-400" />
            <span>Multi-Cloud Support</span>
          </div>
          <div className="flex items-center gap-2">
            <TrendingUp className="h-4 w-4 text-cyan-400" />
            <span>99.9% Uptime</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HeroSection;
