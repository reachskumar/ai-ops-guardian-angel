
import React from "react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { Rocket, Star, Shield, Zap, ArrowRight, CheckCircle, Users, Globe, TrendingUp } from "lucide-react";

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
      {/* Hero Section */}
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
              onClick={handleGetStarted}
              size="lg" 
              className="bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-700 hover:to-blue-600 text-white px-8 py-4 text-lg font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 group"
            >
              Start Free Trial
              <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
            </Button>
            <Button 
              onClick={handleContactUs}
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

      {/* Features Section */}
      <div className="py-24 bg-gradient-to-b from-card/20 to-card/40 backdrop-blur-sm">
        <div className="max-w-6xl mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold mb-6 text-foreground">
              Everything you need to manage your infrastructure
            </h2>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
              From monitoring to optimization, OrbitOps provides a comprehensive suite of tools 
              to streamline your cloud operations and reduce costs.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              {
                icon: <Rocket className="h-8 w-8" />,
                title: "Automated Deployment",
                description: "Deploy applications across multiple environments with zero-downtime deployments and rollback capabilities."
              },
              {
                icon: <Shield className="h-8 w-8" />,
                title: "Security Monitoring",
                description: "Continuous security scanning with automated vulnerability assessment and compliance reporting."
              },
              {
                icon: <Zap className="h-8 w-8" />,
                title: "Performance Optimization",
                description: "AI-driven performance tuning with automatic scaling and resource optimization recommendations."
              },
              {
                icon: <Globe className="h-8 w-8" />,
                title: "Multi-Cloud Management",
                description: "Unified dashboard for AWS, Azure, and GCP with cross-cloud resource management."
              },
              {
                icon: <TrendingUp className="h-8 w-8" />,
                title: "Cost Analytics",
                description: "Detailed cost breakdowns with optimization suggestions to reduce your cloud spending by up to 40%."
              },
              {
                icon: <Users className="h-8 w-8" />,
                title: "Team Collaboration",
                description: "Role-based access control with audit logs and team workspaces for seamless collaboration."
              }
            ].map((feature, index) => (
              <div key={index} className="group p-8 rounded-2xl bg-card/60 backdrop-blur-sm border border-border hover:bg-card/80 hover:shadow-lg transition-all duration-300">
                <div className="w-16 h-16 mb-6 bg-primary/10 rounded-2xl flex items-center justify-center text-primary group-hover:bg-primary/20 transition-colors duration-300">
                  {feature.icon}
                </div>
                <h3 className="text-xl font-semibold mb-4 text-foreground">{feature.title}</h3>
                <p className="text-muted-foreground leading-relaxed">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Contact Section */}
      <div id="contact" className="py-24 bg-gradient-to-b from-card/40 to-card/60 backdrop-blur-sm">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h2 className="text-4xl md:text-5xl font-bold mb-8 text-foreground">
            Ready to transform your infrastructure?
          </h2>
          <p className="text-xl text-muted-foreground mb-12 max-w-2xl mx-auto leading-relaxed">
            Join thousands of companies already using OrbitOps to streamline their cloud operations 
            and reduce infrastructure costs.
          </p>
          
          <div className="grid md:grid-cols-2 gap-8 mb-16">
            <div className="p-8 rounded-2xl bg-card/60 backdrop-blur-sm border border-border">
              <h3 className="text-2xl font-semibold mb-4 text-foreground">Get in Touch</h3>
              <p className="text-muted-foreground mb-4">hello@orbitops.net</p>
              <p className="text-muted-foreground">www.orbitops.net</p>
            </div>
            <div className="p-8 rounded-2xl bg-card/60 backdrop-blur-sm border border-border">
              <h3 className="text-2xl font-semibold mb-4 text-foreground">Start Your Journey</h3>
              <p className="text-muted-foreground mb-4">Free 14-day trial</p>
              <p className="text-muted-foreground">No credit card required</p>
            </div>
          </div>

          <Button 
            onClick={handleGetStarted}
            size="lg"
            className="bg-primary hover:bg-primary/90 text-white px-12 py-4 text-xl rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 group"
          >
            Start Free Trial
            <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
          </Button>
        </div>
      </div>

      {/* Footer */}
      <footer className="py-12 border-t border-border/50 bg-card/20">
        <div className="max-w-6xl mx-auto px-4 text-center">
          <p className="text-muted-foreground text-lg">
            © 2024 OrbitOps. All rights reserved. | Transforming Infrastructure Management
          </p>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
