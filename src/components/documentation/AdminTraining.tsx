
import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Shield, 
  Users, 
  Settings, 
  Database,
  Key,
  AlertTriangle,
  FileText,
  CheckCircle,
  Clock,
  Lock
} from "lucide-react";

const AdminTraining: React.FC = () => {
  const [completedModules, setCompletedModules] = useState<string[]>([]);

  const toggleModule = (moduleId: string) => {
    setCompletedModules(prev => 
      prev.includes(moduleId) 
        ? prev.filter(id => id !== moduleId)
        : [...prev, moduleId]
    );
  };

  const trainingModules = [
    {
      id: "user-management",
      title: "User Management & Roles",
      icon: <Users className="h-5 w-5" />,
      difficulty: "Beginner",
      duration: "15 min",
      description: "Learn how to manage users, assign roles, and configure permissions",
      topics: [
        "Understanding role hierarchy (Admin > Developer > Operator > Viewer)",
        "Adding and removing team members",
        "Configuring role-based access control",
        "Managing user permissions and restrictions",
        "Monitoring user activity and audit logs"
      ],
      practicalExercises: [
        "Create a new user account with Developer role",
        "Modify user permissions for specific cloud accounts",
        "Review and analyze user activity logs",
        "Set up approval workflows for sensitive operations"
      ],
      bestPractices: [
        "Follow principle of least privilege",
        "Regularly audit user access and permissions",
        "Use groups for efficient permission management",
        "Implement multi-factor authentication for all users"
      ]
    },
    {
      id: "security-configuration",
      title: "Security Configuration",
      icon: <Shield className="h-5 w-5" />,
      difficulty: "Intermediate",
      duration: "25 min",
      description: "Advanced security settings and compliance management",
      topics: [
        "Configuring security scan engines and schedules",
        "Managing compliance standards (SOC 2, PCI DSS, HIPAA)",
        "Setting up vulnerability assessment workflows",
        "Configuring security alert thresholds and notifications",
        "Managing security policies and exceptions"
      ],
      practicalExercises: [
        "Configure automated security scanning schedule",
        "Set up compliance reporting for SOC 2",
        "Create custom security policies",
        "Configure security incident response workflows"
      ],
      bestPractices: [
        "Schedule regular security scans during off-peak hours",
        "Maintain up-to-date compliance documentation",
        "Implement security incident response procedures",
        "Regular security awareness training for team members"
      ]
    },
    {
      id: "system-configuration",
      title: "System Configuration",
      icon: <Settings className="h-5 w-5" />,
      difficulty: "Advanced",
      duration: "30 min",
      description: "Platform-wide settings and system administration",
      topics: [
        "Managing system-wide settings and preferences",
        "Configuring notification channels and webhooks",
        "Setting up backup and disaster recovery procedures",
        "Managing API keys and service integrations",
        "Configuring monitoring and alerting thresholds"
      ],
      practicalExercises: [
        "Configure Slack integration for notifications",
        "Set up automated backup schedules",
        "Create and manage API keys for external integrations",
        "Configure system-wide monitoring thresholds"
      ],
      bestPractices: [
        "Implement proper backup and recovery procedures",
        "Use secure communication channels for notifications",
        "Regularly rotate API keys and credentials",
        "Monitor system performance and capacity"
      ]
    },
    {
      id: "data-management",
      title: "Data Management & Backup",
      icon: <Database className="h-5 w-5" />,
      difficulty: "Advanced",
      duration: "20 min",
      description: "Database administration and data protection",
      topics: [
        "Managing database schemas and migrations",
        "Configuring automated backups and retention policies",
        "Data archival and cleanup procedures",
        "Managing sensitive data and encryption",
        "Database performance monitoring and optimization"
      ],
      practicalExercises: [
        "Configure automated database backups",
        "Set up data retention policies",
        "Perform database cleanup and optimization",
        "Test backup restoration procedures"
      ],
      bestPractices: [
        "Regular backup testing and verification",
        "Implement data encryption at rest and in transit",
        "Monitor database performance metrics",
        "Maintain data retention compliance"
      ]
    }
  ];

  const adminResponsibilities = [
    {
      area: "User Management",
      tasks: [
        "Add/remove team members and assign appropriate roles",
        "Monitor user activity and maintain access logs",
        "Conduct regular access reviews and permission audits"
      ]
    },
    {
      area: "Security Oversight",
      tasks: [
        "Configure and monitor security scanning schedules",
        "Review and approve security policy exceptions",
        "Maintain compliance documentation and reports"
      ]
    },
    {
      area: "System Maintenance",
      tasks: [
        "Monitor system performance and capacity",
        "Manage system updates and maintenance windows",
        "Configure backup and disaster recovery procedures"
      ]
    },
    {
      area: "Compliance Management",
      tasks: [
        "Ensure adherence to regulatory requirements",
        "Generate compliance reports for audits",
        "Maintain documentation and evidence collection"
      ]
    }
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center space-x-2">
                <Shield className="h-6 w-6 text-red-500" />
                <span>Administrator Training Program</span>
              </CardTitle>
              <p className="text-muted-foreground mt-2">
                Comprehensive training for platform administrators
              </p>
            </div>
            <Badge variant="secondary" className="flex items-center space-x-1">
              <CheckCircle className="h-4 w-4" />
              <span>{completedModules.length}/{trainingModules.length} Complete</span>
            </Badge>
          </div>
        </CardHeader>
      </Card>

      <Tabs defaultValue="modules" className="space-y-4">
        <TabsList>
          <TabsTrigger value="modules">Training Modules</TabsTrigger>
          <TabsTrigger value="responsibilities">Admin Responsibilities</TabsTrigger>
          <TabsTrigger value="best-practices">Best Practices</TabsTrigger>
        </TabsList>

        <TabsContent value="modules">
          <div className="space-y-4">
            {trainingModules.map((module) => (
              <Card key={module.id}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => toggleModule(module.id)}
                        className="p-0"
                      >
                        {completedModules.includes(module.id) ? (
                          <CheckCircle className="h-5 w-5 text-green-500" />
                        ) : (
                          <div className="h-5 w-5 border-2 border-muted-foreground rounded-full" />
                        )}
                      </Button>
                      {module.icon}
                      <div>
                        <CardTitle className="text-lg">{module.title}</CardTitle>
                        <p className="text-sm text-muted-foreground">{module.description}</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Badge variant="outline">{module.difficulty}</Badge>
                      <Badge variant="outline" className="flex items-center space-x-1">
                        <Clock className="h-3 w-3" />
                        <span>{module.duration}</span>
                      </Badge>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <Tabs defaultValue="topics" className="space-y-4">
                    <TabsList className="grid w-full grid-cols-3">
                      <TabsTrigger value="topics">Topics</TabsTrigger>
                      <TabsTrigger value="exercises">Exercises</TabsTrigger>
                      <TabsTrigger value="practices">Best Practices</TabsTrigger>
                    </TabsList>

                    <TabsContent value="topics">
                      <ul className="space-y-2">
                        {module.topics.map((topic, index) => (
                          <li key={index} className="flex items-start space-x-2">
                            <div className="w-2 h-2 bg-primary rounded-full mt-2 flex-shrink-0" />
                            <span className="text-sm">{topic}</span>
                          </li>
                        ))}
                      </ul>
                    </TabsContent>

                    <TabsContent value="exercises">
                      <div className="space-y-2">
                        {module.practicalExercises.map((exercise, index) => (
                          <div key={index} className="flex items-start space-x-2 p-3 bg-blue-50 rounded-lg">
                            <FileText className="h-4 w-4 text-blue-500 mt-0.5 flex-shrink-0" />
                            <span className="text-sm">{exercise}</span>
                          </div>
                        ))}
                      </div>
                    </TabsContent>

                    <TabsContent value="practices">
                      <div className="space-y-2">
                        {module.bestPractices.map((practice, index) => (
                          <div key={index} className="flex items-start space-x-2 p-3 bg-green-50 rounded-lg">
                            <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                            <span className="text-sm">{practice}</span>
                          </div>
                        ))}
                      </div>
                    </TabsContent>
                  </Tabs>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="responsibilities">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {adminResponsibilities.map((area, index) => (
              <Card key={index}>
                <CardHeader>
                  <CardTitle className="text-lg">{area.area}</CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2">
                    {area.tasks.map((task, taskIndex) => (
                      <li key={taskIndex} className="flex items-start space-x-2">
                        <div className="w-2 h-2 bg-primary rounded-full mt-2 flex-shrink-0" />
                        <span className="text-sm">{task}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="best-practices">
          <div className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Lock className="h-5 w-5 text-yellow-500" />
                  <span>Security Best Practices</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  <li className="flex items-start space-x-2">
                    <AlertTriangle className="h-4 w-4 text-yellow-500 mt-0.5 flex-shrink-0" />
                    <span className="text-sm">Enable multi-factor authentication for all admin accounts</span>
                  </li>
                  <li className="flex items-start space-x-2">
                    <AlertTriangle className="h-4 w-4 text-yellow-500 mt-0.5 flex-shrink-0" />
                    <span className="text-sm">Regularly rotate API keys and service credentials</span>
                  </li>
                  <li className="flex items-start space-x-2">
                    <AlertTriangle className="h-4 w-4 text-yellow-500 mt-0.5 flex-shrink-0" />
                    <span className="text-sm">Monitor and audit all administrative activities</span>
                  </li>
                  <li className="flex items-start space-x-2">
                    <AlertTriangle className="h-4 w-4 text-yellow-500 mt-0.5 flex-shrink-0" />
                    <span className="text-sm">Implement proper backup and disaster recovery procedures</span>
                  </li>
                </ul>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Users className="h-5 w-5 text-blue-500" />
                  <span>User Management Best Practices</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  <li className="flex items-start space-x-2">
                    <CheckCircle className="h-4 w-4 text-blue-500 mt-0.5 flex-shrink-0" />
                    <span className="text-sm">Follow the principle of least privilege when assigning roles</span>
                  </li>
                  <li className="flex items-start space-x-2">
                    <CheckCircle className="h-4 w-4 text-blue-500 mt-0.5 flex-shrink-0" />
                    <span className="text-sm">Conduct regular access reviews and permission audits</span>
                  </li>
                  <li className="flex items-start space-x-2">
                    <CheckCircle className="h-4 w-4 text-blue-500 mt-0.5 flex-shrink-0" />
                    <span className="text-sm">Promptly remove access for departing team members</span>
                  </li>
                  <li className="flex items-start space-x-2">
                    <CheckCircle className="h-4 w-4 text-blue-500 mt-0.5 flex-shrink-0" />
                    <span className="text-sm">Document role assignments and permission changes</span>
                  </li>
                </ul>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AdminTraining;
