import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Checkbox } from '@/components/ui/checkbox';
import { 
  Shield, 
  Server, 
  Settings, 
  PlayCircle,
  FileCode,
  CheckCircle,
  Loader2,
  AlertTriangle,
  Lock,
  Scan,
  Package,
  Network,
  Database,
  Monitor
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface ServerTarget {
  id: string;
  hostname: string;
  ip: string;
  os: 'ubuntu' | 'centos' | 'rhel' | 'debian';
  status: 'online' | 'offline' | 'unknown';
  lastSeen: string;
}

interface PlaybookTask {
  id: string;
  name: string;
  category: 'hardening' | 'scanning' | 'configuration' | 'deployment';
  description: string;
  enabled: boolean;
  severity?: 'low' | 'medium' | 'high' | 'critical';
}

const AnsibleAutomation: React.FC = () => {
  const [servers, setServers] = useState<ServerTarget[]>([
    {
      id: 'srv-001',
      hostname: 'web-server-01',
      ip: '10.0.1.10',
      os: 'ubuntu',
      status: 'online',
      lastSeen: '2025-01-19T10:30:00Z'
    },
    {
      id: 'srv-002',
      hostname: 'db-server-01',
      ip: '10.0.2.10',
      os: 'centos',
      status: 'online',
      lastSeen: '2025-01-19T10:25:00Z'
    }
  ]);

  const [selectedServers, setSelectedServers] = useState<string[]>([]);
  const [selectedTasks, setSelectedTasks] = useState<PlaybookTask[]>([]);
  const [isExecuting, setIsExecuting] = useState(false);
  const [executionResults, setExecutionResults] = useState<any>(null);
  const { toast } = useToast();

  const hardeningTasks: PlaybookTask[] = [
    {
      id: 'harden-ssh',
      name: 'SSH Hardening',
      category: 'hardening',
      description: 'Disable root login, change default port, key-only auth',
      enabled: true,
      severity: 'high'
    },
    {
      id: 'firewall-config',
      name: 'Firewall Configuration',
      category: 'hardening',
      description: 'Configure UFW/iptables with secure defaults',
      enabled: true,
      severity: 'critical'
    },
    {
      id: 'disable-services',
      name: 'Disable Unnecessary Services',
      category: 'hardening',
      description: 'Stop and disable unused system services',
      enabled: true,
      severity: 'medium'
    },
    {
      id: 'user-management',
      name: 'User Account Security',
      category: 'hardening',
      description: 'Password policies, sudo configuration',
      enabled: true,
      severity: 'high'
    },
    {
      id: 'system-updates',
      name: 'System Updates',
      category: 'hardening',
      description: 'Update packages and security patches',
      enabled: true,
      severity: 'critical'
    }
  ];

  const scanningTasks: PlaybookTask[] = [
    {
      id: 'port-scan',
      name: 'Port Scanning',
      category: 'scanning',
      description: 'Scan for open ports and services',
      enabled: false,
      severity: 'medium'
    },
    {
      id: 'vuln-scan',
      name: 'Vulnerability Assessment',
      category: 'scanning',
      description: 'Run OpenVAS/Nessus vulnerability scans',
      enabled: false,
      severity: 'high'
    },
    {
      id: 'compliance-check',
      name: 'Compliance Scanning',
      category: 'scanning',
      description: 'CIS benchmarks and security compliance',
      enabled: false,
      severity: 'high'
    },
    {
      id: 'malware-scan',
      name: 'Malware Detection',
      category: 'scanning',
      description: 'ClamAV antivirus scanning',
      enabled: false,
      severity: 'critical'
    }
  ];

  const configurationTasks: PlaybookTask[] = [
    {
      id: 'nginx-setup',
      name: 'Nginx Configuration',
      category: 'configuration',
      description: 'Install and configure Nginx web server',
      enabled: false
    },
    {
      id: 'mysql-setup',
      name: 'MySQL Setup',
      category: 'configuration',
      description: 'Install MySQL and secure installation',
      enabled: false
    },
    {
      id: 'docker-install',
      name: 'Docker Installation',
      category: 'configuration',
      description: 'Install Docker and Docker Compose',
      enabled: false
    },
    {
      id: 'monitoring-agent',
      name: 'Monitoring Agent',
      category: 'configuration',
      description: 'Install Prometheus node exporter',
      enabled: false
    }
  ];

  const deploymentTasks: PlaybookTask[] = [
    {
      id: 'app-deploy',
      name: 'Application Deployment',
      category: 'deployment',
      description: 'Deploy application from Git repository',
      enabled: false
    },
    {
      id: 'config-deploy',
      name: 'Configuration Files',
      category: 'deployment',
      description: 'Deploy configuration files and templates',
      enabled: false
    },
    {
      id: 'ssl-certs',
      name: 'SSL Certificates',
      category: 'deployment',
      description: 'Deploy and configure SSL certificates',
      enabled: false
    },
    {
      id: 'backup-setup',
      name: 'Backup Configuration',
      category: 'deployment',
      description: 'Setup automated backup scripts',
      enabled: false
    }
  ];

  const allTasks = [...hardeningTasks, ...scanningTasks, ...configurationTasks, ...deploymentTasks];

  const toggleServerSelection = (serverId: string) => {
    setSelectedServers(prev => 
      prev.includes(serverId) 
        ? prev.filter(id => id !== serverId)
        : [...prev, serverId]
    );
  };

  const toggleTaskSelection = (task: PlaybookTask) => {
    setSelectedTasks(prev => {
      const exists = prev.find(t => t.id === task.id);
      if (exists) {
        return prev.filter(t => t.id !== task.id);
      }
      return [...prev, task];
    });
  };

  const executePlaybook = async () => {
    if (selectedServers.length === 0 || selectedTasks.length === 0) {
      toast({
        title: 'Selection Required',
        description: 'Please select servers and tasks to execute',
        variant: 'destructive'
      });
      return;
    }

    setIsExecuting(true);
    setExecutionResults(null);

    try {
      // Simulate playbook execution
      await new Promise(resolve => setTimeout(resolve, 5000));
      
      const mockResults = {
        status: 'success',
        servers: selectedServers.length,
        tasks: selectedTasks.length,
        duration: '4m 32s',
        details: selectedTasks.map(task => ({
          task: task.name,
          status: Math.random() > 0.1 ? 'success' : 'failed',
          changes: Math.floor(Math.random() * 5)
        }))
      };

      setExecutionResults(mockResults);
      
      toast({
        title: 'Playbook Executed',
        description: `Successfully executed ${selectedTasks.length} tasks on ${selectedServers.length} servers`,
      });
    } catch (error: any) {
      toast({
        title: 'Execution Failed',
        description: error.message || 'Failed to execute Ansible playbook',
        variant: 'destructive'
      });
    } finally {
      setIsExecuting(false);
    }
  };

  const getTaskIcon = (category: string) => {
    switch (category) {
      case 'hardening':
        return Shield;
      case 'scanning':
        return Scan;
      case 'configuration':
        return Settings;
      case 'deployment':
        return Package;
      default:
        return FileCode;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'online':
        return 'bg-green-500';
      case 'offline':
        return 'bg-red-500';
      default:
        return 'bg-gray-500';
    }
  };

  const getSeverityColor = (severity?: string) => {
    switch (severity) {
      case 'critical':
        return 'bg-red-500';
      case 'high':
        return 'bg-orange-500';
      case 'medium':
        return 'bg-yellow-500';
      case 'low':
        return 'bg-blue-500';
      default:
        return 'bg-gray-500';
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold">Ansible Automation</h2>
        <p className="text-muted-foreground">
          Automated server hardening, security scanning, and configuration management
        </p>
      </div>

      <Tabs defaultValue="servers" className="space-y-4">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="servers">Target Servers</TabsTrigger>
          <TabsTrigger value="hardening">Hardening</TabsTrigger>
          <TabsTrigger value="scanning">Security Scans</TabsTrigger>
          <TabsTrigger value="configuration">Configuration</TabsTrigger>
          <TabsTrigger value="execute">Execute</TabsTrigger>
        </TabsList>

        <TabsContent value="servers" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Server Inventory</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {servers.map((server) => (
                  <div key={server.id} className="flex items-center space-x-4 p-4 border rounded-lg">
                    <Checkbox
                      checked={selectedServers.includes(server.id)}
                      onCheckedChange={() => toggleServerSelection(server.id)}
                    />
                    <div className="flex-1 space-y-1">
                      <div className="flex items-center gap-2">
                        <Server className="h-4 w-4" />
                        <span className="font-medium">{server.hostname}</span>
                        <Badge variant="outline" className={getStatusColor(server.status)}>
                          {server.status}
                        </Badge>
                        <Badge variant="secondary">{server.os.toUpperCase()}</Badge>
                      </div>
                      <div className="text-sm text-muted-foreground">
                        IP: {server.ip} • Last seen: {new Date(server.lastSeen).toLocaleString()}
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-4 pt-4 border-t">
                <Button variant="outline" className="w-full">
                  <Server className="mr-2 h-4 w-4" />
                  Add New Server
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="hardening" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Security Hardening Tasks</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {hardeningTasks.map((task) => {
                  const TaskIcon = getTaskIcon(task.category);
                  const isSelected = selectedTasks.some(t => t.id === task.id);
                  
                  return (
                    <div 
                      key={task.id} 
                      className={`flex items-center space-x-4 p-4 border rounded-lg cursor-pointer transition-colors ${
                        isSelected ? 'bg-primary/5 border-primary' : 'hover:bg-muted/50'
                      }`}
                      onClick={() => toggleTaskSelection(task)}
                    >
                      <Checkbox checked={isSelected} />
                      <TaskIcon className="h-5 w-5 text-primary" />
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <span className="font-medium">{task.name}</span>
                          {task.severity && (
                            <Badge variant="outline" className={getSeverityColor(task.severity)}>
                              {task.severity}
                            </Badge>
                          )}
                        </div>
                        <p className="text-sm text-muted-foreground">{task.description}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="scanning" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Security Scanning Tasks</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {scanningTasks.map((task) => {
                  const TaskIcon = getTaskIcon(task.category);
                  const isSelected = selectedTasks.some(t => t.id === task.id);
                  
                  return (
                    <div 
                      key={task.id} 
                      className={`flex items-center space-x-4 p-4 border rounded-lg cursor-pointer transition-colors ${
                        isSelected ? 'bg-primary/5 border-primary' : 'hover:bg-muted/50'
                      }`}
                      onClick={() => toggleTaskSelection(task)}
                    >
                      <Checkbox checked={isSelected} />
                      <TaskIcon className="h-5 w-5 text-primary" />
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <span className="font-medium">{task.name}</span>
                          {task.severity && (
                            <Badge variant="outline" className={getSeverityColor(task.severity)}>
                              {task.severity}
                            </Badge>
                          )}
                        </div>
                        <p className="text-sm text-muted-foreground">{task.description}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="configuration" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Configuration Tasks</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {configurationTasks.map((task) => {
                    const TaskIcon = getTaskIcon(task.category);
                    const isSelected = selectedTasks.some(t => t.id === task.id);
                    
                    return (
                      <div 
                        key={task.id} 
                        className={`flex items-center space-x-4 p-3 border rounded-lg cursor-pointer transition-colors ${
                          isSelected ? 'bg-primary/5 border-primary' : 'hover:bg-muted/50'
                        }`}
                        onClick={() => toggleTaskSelection(task)}
                      >
                        <Checkbox checked={isSelected} />
                        <TaskIcon className="h-4 w-4 text-primary" />
                        <div className="flex-1">
                          <span className="font-medium text-sm">{task.name}</span>
                          <p className="text-xs text-muted-foreground">{task.description}</p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Deployment Tasks</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {deploymentTasks.map((task) => {
                    const TaskIcon = getTaskIcon(task.category);
                    const isSelected = selectedTasks.some(t => t.id === task.id);
                    
                    return (
                      <div 
                        key={task.id} 
                        className={`flex items-center space-x-4 p-3 border rounded-lg cursor-pointer transition-colors ${
                          isSelected ? 'bg-primary/5 border-primary' : 'hover:bg-muted/50'
                        }`}
                        onClick={() => toggleTaskSelection(task)}
                      >
                        <Checkbox checked={isSelected} />
                        <TaskIcon className="h-4 w-4 text-primary" />
                        <div className="flex-1">
                          <span className="font-medium text-sm">{task.name}</span>
                          <p className="text-xs text-muted-foreground">{task.description}</p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="execute" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Execution Summary</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm font-medium">Selected Servers:</span>
                    <span className="text-sm">{selectedServers.length}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm font-medium">Selected Tasks:</span>
                    <span className="text-sm">{selectedTasks.length}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm font-medium">Estimated Time:</span>
                    <span className="text-sm">~{Math.max(selectedTasks.length * 2, 5)} minutes</span>
                  </div>
                </div>

                {selectedTasks.length > 0 && (
                  <div className="space-y-2">
                    <h4 className="text-sm font-medium">Selected Tasks:</h4>
                    <div className="space-y-1">
                      {selectedTasks.map((task) => (
                        <div key={task.id} className="flex items-center gap-2">
                          <Badge variant="outline">
                            {task.category}
                          </Badge>
                          <span className="text-sm">{task.name}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <Button 
                  onClick={executePlaybook}
                  disabled={isExecuting || selectedServers.length === 0 || selectedTasks.length === 0}
                  className="w-full"
                  size="lg"
                >
                  {isExecuting ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  ) : (
                    <PlayCircle className="mr-2 h-4 w-4" />
                  )}
                  {isExecuting ? 'Executing Playbook...' : 'Execute Ansible Playbook'}
                </Button>
              </CardContent>
            </Card>

            {executionResults && (
              <Card>
                <CardHeader>
                  <CardTitle>Execution Results</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center gap-2">
                    <CheckCircle className="h-5 w-5 text-green-500" />
                    <span className="font-medium">Playbook Completed</span>
                  </div>
                  
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span>Servers:</span>
                      <span>{executionResults.servers}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Tasks:</span>
                      <span>{executionResults.tasks}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Duration:</span>
                      <span>{executionResults.duration}</span>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <h4 className="text-sm font-medium">Task Results:</h4>
                    <div className="space-y-1">
                      {executionResults.details.map((detail: any, index: number) => (
                        <div key={index} className="flex items-center justify-between text-sm">
                          <span>{detail.task}</span>
                          <div className="flex items-center gap-2">
                            <Badge variant={detail.status === 'success' ? 'default' : 'destructive'}>
                              {detail.status}
                            </Badge>
                            <span className="text-muted-foreground">
                              {detail.changes} changes
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AnsibleAutomation;
