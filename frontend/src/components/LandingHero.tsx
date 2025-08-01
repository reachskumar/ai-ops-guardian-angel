import { ArrowRight, Play, Cloud, Shield, DollarSign, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Link } from "react-router-dom";
import heroImage from "@/assets/hero-bg.jpg";

const LandingHero = () => {
  const stats = [
    { number: "28", label: "AI Agents", icon: Zap },
    { number: "99.9%", label: "Uptime", icon: Shield },
    { number: "30%", label: "Cost Savings", icon: DollarSign },
    { number: "24/7", label: "Monitoring", icon: Cloud },
  ];

  const features = [
    {
      title: "Multi-Cloud Management",
      description: "Unified control across AWS, Azure, and GCP with intelligent automation.",
      icon: Cloud,
    },
    {
      title: "AI-Powered Security",
      description: "Advanced threat detection and automated security compliance monitoring.",
      icon: Shield,
    },
    {
      title: "Cost Optimization",
      description: "Smart resource allocation and automated cost reduction strategies.",
      icon: DollarSign,
    },
    {
      title: "DevOps Automation",
      description: "Streamlined CI/CD pipelines with intelligent deployment strategies.",
      icon: Zap,
    },
  ];

  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* Hero Background */}
      <div 
        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{ backgroundImage: `url(${heroImage})` }}
      >
        <div className="absolute inset-0 bg-gradient-hero opacity-80" />
        <div className="absolute inset-0 bg-black/20" />
      </div>

      {/* Content */}
      <div className="relative z-10 flex flex-col items-center justify-center min-h-screen px-4 text-center text-white">
        {/* Main Hero Content */}
        <div className="max-w-6xl mx-auto mb-16">
          <div className="mb-8 animate-float">
            <h1 className="text-5xl md:text-7xl font-bold mb-6 leading-tight">
              The Future of{" "}
              <span className="bg-gradient-to-r from-blue-300 to-purple-300 bg-clip-text text-transparent">
                Infrastructure
              </span>
            </h1>
            <p className="text-xl md:text-2xl text-gray-200 max-w-3xl mx-auto leading-relaxed">
              Harness the power of 28 specialized AI agents to revolutionize your multi-cloud 
              infrastructure management across AWS, Azure, and GCP.
            </p>
          </div>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-16">
            <Link to="/auth">
              <Button variant="hero" size="xl" className="group">
                Get Started Free
                <ArrowRight className="ml-2 group-hover:translate-x-1 infra-transition" />
              </Button>
            </Link>
            <Button variant="outline" size="xl" className="text-white border-white/30 hover:bg-white/10">
              <Play className="mr-2" />
              Watch Demo
            </Button>
          </div>

          {/* Statistics */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-16">
            {stats.map((stat, index) => (
              <Card 
                key={index} 
                className="relative overflow-hidden bg-white/10 backdrop-blur-lg border-white/20 hover:bg-white/15 infra-transition group hover-lift"
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <div className="absolute inset-0 bg-gradient-to-br from-white/20 via-transparent to-transparent opacity-0 group-hover:opacity-100 infra-transition" />
                <CardContent className="p-8 relative z-10 text-center">
                  <div className="mb-6">
                    <div className="w-16 h-16 mx-auto bg-gradient-to-br from-primary-glow to-accent-glow rounded-2xl flex items-center justify-center group-hover:scale-110 infra-transition shadow-glow">
                      <stat.icon className="w-8 h-8 text-white" />
                    </div>
                  </div>
                  <div className="text-4xl font-bold text-white mb-2 group-hover:scale-105 infra-transition">
                    {stat.number}
                  </div>
                  <div className="text-sm text-gray-200 font-medium tracking-wide">
                    {stat.label}
                  </div>
                  <div className="absolute inset-x-0 bottom-0 h-1 bg-gradient-to-r from-primary to-accent opacity-50 group-hover:opacity-100 infra-transition" />
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Feature Cards */}
        <div className="max-w-7xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-bold mb-12">
            Enterprise-Grade Cloud Management
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <Card 
                key={index} 
                className="relative overflow-hidden bg-white/10 backdrop-blur-lg border-white/20 hover:bg-white/15 infra-transition group hover-lift"
                style={{ animationDelay: `${(index + 4) * 0.1}s` }}
              >
                <div className="absolute inset-0 bg-gradient-to-br from-primary/20 via-transparent to-accent/20 opacity-0 group-hover:opacity-100 infra-transition" />
                <CardContent className="p-8 text-center relative z-10">
                  <div className="mb-6">
                    <div className="w-20 h-20 mx-auto bg-gradient-to-br from-white/20 to-white/10 rounded-3xl flex items-center justify-center group-hover:scale-110 infra-transition backdrop-blur-sm border border-white/30">
                      <feature.icon className="w-10 h-10 text-white" />
                    </div>
                  </div>
                  <h3 className="text-xl font-bold text-white mb-4 group-hover:text-primary-glow infra-transition">
                    {feature.title}
                  </h3>
                  <p className="text-gray-300 leading-relaxed text-sm">
                    {feature.description}
                  </p>
                  <div className="absolute inset-x-4 bottom-4 h-0.5 bg-gradient-to-r from-transparent via-white/50 to-transparent opacity-0 group-hover:opacity-100 infra-transition" />
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Scroll Indicator */}
        <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 animate-bounce">
          <div className="w-6 h-10 border-2 border-white/30 rounded-full flex justify-center">
            <div className="w-1 h-3 bg-white/50 rounded-full mt-2 animate-pulse" />
          </div>
        </div>
      </div>
    </div>
  );
};

export default LandingHero;