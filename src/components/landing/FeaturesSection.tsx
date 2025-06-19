
import React from "react";
import { Rocket, Shield, Zap, Globe, TrendingUp, Users } from "lucide-react";

const FeaturesSection: React.FC = () => {
  const features = [
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
  ];

  return (
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
          {features.map((feature, index) => (
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
  );
};

export default FeaturesSection;
