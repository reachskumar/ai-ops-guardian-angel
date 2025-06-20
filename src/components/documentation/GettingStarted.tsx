
import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { 
  CheckCircle, 
  Circle, 
  Play, 
  ArrowRight, 
  User, 
  Cloud, 
  Shield, 
  Activity,
  Settings,
  Users,
  Clock,
  Book
} from "lucide-react";

const GettingStarted: React.FC = () => {
  const [completedSteps, setCompletedSteps] = useState<number[]>([]);

  const toggleStep = (stepIndex: number) => {
    setCompletedSteps(prev => 
      prev.includes(stepIndex) 
        ? prev.filter(i => i !== stepIndex)
        : [...prev, stepIndex]
    );
  };

  const onboardingSteps = [
    {
      title: "Account Setup",
      description: "Create your account and complete your profile",
      icon: <User className="h-5 w-5" />,
      estimatedTime: "2 min",
      tasks: [
        "Sign up for an account",
        "Verify your email address",
        "Complete your profile information",
        "Set up two-factor authentication (recommended)"
      ]
    },
    {
      title: "Connect Cloud Providers",
      description: "Link your AWS, Azure, or GCP accounts",
      icon: <Cloud className="h-5 w-5" />,
      estimatedTime: "5 min",
      tasks: [
        "Navigate to Cloud Resources page",
        "Click 'Connect Provider'",
        "Enter your cloud credentials",
        "Verify connection status"
      ]
    },
    {
      title: "Dashboard Overview",
      description: "Understand your main dashboard and key metrics",
      icon: <Activity className="h-5 w-5" />,
      estimatedTime: "3 min",
      tasks: [
        "Review resource summary cards",
        "Check system health indicators",
        "Explore real-time monitoring charts",
        "Set up custom alerts"
      ]
    },
    {
      title: "Security Configuration",
      description: "Configure security settings and compliance",
      icon: <Shield className="h-5 w-5" />,
      estimatedTime: "5 min",
      tasks: [
        "Run initial security scan",
        "Review vulnerability reports",
        "Configure compliance standards",
        "Set up security notifications"
      ]
    },
    {
      title: "Team Management",
      description: "Add team members and assign roles",
      icon: <Users className="h-5 w-5" />,
      estimatedTime: "3 min",
      tasks: [
        "Invite team members",
        "Assign appropriate roles",
        "Configure permissions",
        "Set up collaboration workflows"
      ]
    }
  ];

  const quickActions = [
    {
      title: "Take Interactive Tour",
      description: "5-minute guided walkthrough",
      action: "Start Tour",
      variant: "default" as const
    },
    {
      title: "Watch Video Tutorial",
      description: "Complete platform overview",
      action: "Watch Now",
      variant: "outline" as const
    },
    {
      title: "Join Live Demo",
      description: "Weekly group sessions",
      action: "Register",
      variant: "outline" as const
    }
  ];

  const keyFeatures = [
    {
      title: "Real-time Monitoring",
      description: "Monitor your infrastructure health and performance metrics in real-time"
    },
    {
      title: "Multi-cloud Support",
      description: "Manage resources across AWS, Azure, and Google Cloud Platform"
    },
    {
      title: "Security & Compliance",
      description: "Automated security scanning and compliance reporting"
    },
    {
      title: "Cost Optimization",
      description: "Track spending and get recommendations to reduce costs"
    },
    {
      title: "Team Collaboration",
      description: "Role-based access control and team management features"
    },
    {
      title: "Automated Provisioning",
      description: "Infrastructure as Code with approval workflows"
    }
  ];

  return (
    <div className="space-y-6">
      {/* Welcome Section */}
      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold mb-2">Welcome to CloudOps Manager</h2>
        <p className="text-muted-foreground mb-6">
          Get started with your cloud infrastructure management platform in just a few steps
        </p>
        
        <div className="flex justify-center space-x-4">
          {quickActions.map((action, index) => (
            <Card key={index} className="p-4 hover:shadow-md transition-shadow cursor-pointer">
              <div className="text-center">
                <h3 className="font-medium mb-1">{action.title}</h3>
                <p className="text-sm text-muted-foreground mb-3">{action.description}</p>
                <Button variant={action.variant} size="sm">
                  <Play className="h-4 w-4 mr-2" />
                  {action.action}
                </Button>
              </div>
            </Card>
          ))}
        </div>
      </div>

      {/* Onboarding Checklist */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <CheckCircle className="h-5 w-5 text-green-500" />
            <span>Onboarding Checklist</span>
            <Badge variant="secondary">
              {completedSteps.length}/{onboardingSteps.length} Complete
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {onboardingSteps.map((step, index) => (
              <div key={index} className="border rounded-lg p-4">
                <div className="flex items-start space-x-3">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => toggleStep(index)}
                    className="p-0 h-auto"
                  >
                    {completedSteps.includes(index) ? (
                      <CheckCircle className="h-5 w-5 text-green-500" />
                    ) : (
                      <Circle className="h-5 w-5 text-muted-foreground" />
                    )}
                  </Button>
                  
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-2">
                      {step.icon}
                      <h3 className="font-medium">{step.title}</h3>
                      <Badge variant="outline" className="flex items-center space-x-1">
                        <Clock className="h-3 w-3" />
                        <span>{step.estimatedTime}</span>
                      </Badge>
                    </div>
                    
                    <p className="text-sm text-muted-foreground mb-3">
                      {step.description}
                    </p>
                    
                    <div className="space-y-1">
                      {step.tasks.map((task, taskIndex) => (
                        <div key={taskIndex} className="flex items-center space-x-2 text-sm">
                          <ArrowRight className="h-3 w-3 text-muted-foreground" />
                          <span>{task}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Key Features Overview */}
      <Card>
        <CardHeader>
          <CardTitle>Key Features Overview</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {keyFeatures.map((feature, index) => (
              <div key={index} className="p-4 border rounded-lg">
                <h3 className="font-medium mb-2">{feature.title}</h3>
                <p className="text-sm text-muted-foreground">{feature.description}</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Next Steps */}
      <Card>
        <CardHeader>
          <CardTitle>What's Next?</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="flex items-center space-x-3 p-3 border rounded-lg">
              <Book className="h-5 w-5 text-blue-500" />
              <div className="flex-1">
                <h3 className="font-medium">Read the User Guide</h3>
                <p className="text-sm text-muted-foreground">Detailed instructions for all features</p>
              </div>
              <Button variant="outline" size="sm">Read Guide</Button>
            </div>
            
            <div className="flex items-center space-x-3 p-3 border rounded-lg">
              <Settings className="h-5 w-5 text-green-500" />
              <div className="flex-1">
                <h3 className="font-medium">Explore Advanced Features</h3>
                <p className="text-sm text-muted-foreground">Infrastructure as Code, automation, and more</p>
              </div>
              <Button variant="outline" size="sm">Explore</Button>
            </div>
            
            <div className="flex items-center space-x-3 p-3 border rounded-lg">
              <Users className="h-5 w-5 text-purple-500" />
              <div className="flex-1">
                <h3 className="font-medium">Join the Community</h3>
                <p className="text-sm text-muted-foreground">Connect with other users and get support</p>
              </div>
              <Button variant="outline" size="sm">Join</Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default GettingStarted;
