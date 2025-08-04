import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { 
  Home, 
  MessageSquare, 
  Bot, 
  Workflow, 
  Puzzle, 
  BookOpen, 
  Code, 
  Shield, 
  BarChart3, 
  Brain, 
  Settings,
  Cloud,
  DollarSign,
  Users,
  FileText,
  Zap,
  Database,
  Monitor,
  GitBranch,
  Package,
  Search,
  Upload,
  CheckCircle,
  AlertTriangle,
  TrendingUp,
  Activity
} from 'lucide-react';

const Sidebar = () => {
  const location = useLocation();

  const menuItems = [
    {
      title: 'Main',
      items: [
        { icon: Home, label: 'Dashboard', path: '/dashboard' },
        { icon: MessageSquare, label: 'AI Chat', path: '/chat' },
        { icon: Bot, label: 'AI Agents', path: '/agents' },
      ]
    },
    {
      title: 'Workflows',
      items: [
        { icon: Workflow, label: 'LangGraph', path: '/workflows/langgraph' },
        { icon: Users, label: 'HITL', path: '/workflows/hitl' },
      ]
    },
    {
      title: 'Systems',
      items: [
        { icon: Puzzle, label: 'Plugins', path: '/plugins' },
        { icon: BookOpen, label: 'Knowledge', path: '/knowledge' },
        { icon: Code, label: 'IaC Generator', path: '/iac/generator' },
        { icon: CheckCircle, label: 'IaC Validator', path: '/iac/validator' },
      ]
    },
    {
      title: 'Security',
      items: [
        { icon: Shield, label: 'Security', path: '/security' },
        { icon: AlertTriangle, label: 'Compliance', path: '/compliance' },
      ]
    },
    {
      title: 'Analytics',
      items: [
        { icon: BarChart3, label: 'Analytics', path: '/analytics' },
        { icon: Monitor, label: 'Monitoring', path: '/monitoring' },
      ]
    },
    {
      title: 'MLOps',
      items: [
        { icon: Brain, label: 'MLOps Hub', path: '/mlops' },
        { icon: TrendingUp, label: 'Training', path: '/mlops/training' },
      ]
    },
    {
      title: 'Features',
      items: [
        { icon: DollarSign, label: 'Cost Optimization', path: '/cost-optimization' },
        { icon: Cloud, label: 'Multi-Cloud', path: '/multi-cloud' },
        { icon: Database, label: 'Cloud Connection', path: '/cloud-connection' },
        { icon: Zap, label: 'Features', path: '/features' },
      ]
    },
    {
      title: 'Testing',
      items: [
        { icon: Activity, label: 'UAT Dashboard', path: '/uat/dashboard' },
        { icon: GitBranch, label: 'Integration', path: '/integration' },
      ]
    },
    {
      title: 'Tools',
      items: [
        { icon: Search, label: 'Knowledge Upload', path: '/knowledge/upload' },
        { icon: Package, label: 'Plugin Marketplace', path: '/plugins/marketplace' },
        { icon: Settings, label: 'Settings', path: '/settings' },
      ]
    }
  ];

  const isActive = (path: string) => location.pathname === path;

  return (
    <div className="w-64 bg-card border-r border-border min-h-screen p-4">
      <div className="mb-6">
        <h2 className="text-lg font-bold text-primary">AI Ops Guardian Angel</h2>
        <p className="text-sm text-muted-foreground">AI-Powered DevOps Platform</p>
      </div>

      <nav className="space-y-6">
        {menuItems.map((section) => (
          <div key={section.title}>
            <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">
              {section.title}
            </h3>
            <ul className="space-y-1">
              {section.items.map((item) => {
                const Icon = item.icon;
                return (
                  <li key={item.path}>
                    <Link
                      to={item.path}
                      className={`flex items-center px-3 py-2 text-sm rounded-md transition-colors ${
                        isActive(item.path)
                          ? 'bg-primary text-primary-foreground'
                          : 'text-muted-foreground hover:text-foreground hover:bg-accent'
                      }`}
                    >
                      <Icon className="w-4 h-4 mr-3" />
                      {item.label}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </div>
        ))}
      </nav>

      {/* Status Indicator */}
      <div className="absolute bottom-4 left-4 right-4">
        <div className="bg-green-500/10 border border-green-500/20 rounded-lg p-3">
          <div className="flex items-center space-x-2">
            <div className="w-2 h-2 bg-green-500 rounded-full"></div>
            <span className="text-xs text-green-500 font-medium">All Systems Operational</span>
          </div>
          <p className="text-xs text-muted-foreground mt-1">28 AI Agents Active</p>
        </div>
      </div>
    </div>
  );
};

export { Sidebar }; 