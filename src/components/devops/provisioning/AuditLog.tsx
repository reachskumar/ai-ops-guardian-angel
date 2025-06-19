
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  Download, 
  Search, 
  Filter,
  Calendar,
  User,
  Server,
  CheckCircle,
  XCircle,
  Clock,
  Shield,
  Activity
} from 'lucide-react';

export interface AuditEntry {
  id: string;
  timestamp: string;
  user: string;
  action: string;
  resourceType: string;
  resourceName: string;
  status: 'success' | 'failed' | 'pending';
  details: string;
  ipAddress: string;
  userAgent: string;
  cost?: number;
  region?: string;
  tags?: Record<string, string>;
}

interface AuditLogProps {
  entries: AuditEntry[];
  onExport: (format: 'json' | 'csv') => void;
}

const AuditLog: React.FC<AuditLogProps> = ({ entries, onExport }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [actionFilter, setActionFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [dateRange, setDateRange] = useState<string>('7d');

  // Filter audit entries
  const filteredEntries = entries.filter(entry => {
    const matchesSearch = entry.user.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         entry.resourceName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         entry.details.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesAction = actionFilter === 'all' || entry.action === actionFilter;
    const matchesStatus = statusFilter === 'all' || entry.status === statusFilter;
    
    // Date filtering
    const entryDate = new Date(entry.timestamp);
    const now = new Date();
    let matchesDate = true;
    
    switch (dateRange) {
      case '1d':
        matchesDate = (now.getTime() - entryDate.getTime()) <= 24 * 60 * 60 * 1000;
        break;
      case '7d':
        matchesDate = (now.getTime() - entryDate.getTime()) <= 7 * 24 * 60 * 60 * 1000;
        break;
      case '30d':
        matchesDate = (now.getTime() - entryDate.getTime()) <= 30 * 24 * 60 * 60 * 1000;
        break;
    }
    
    return matchesSearch && matchesAction && matchesStatus && matchesDate;
  });

  const getActionIcon = (action: string) => {
    switch (action) {
      case 'provision':
        return <Server className="h-4 w-4" />;
      case 'approve':
        return <CheckCircle className="h-4 w-4" />;
      case 'reject':
        return <XCircle className="h-4 w-4" />;
      case 'delete':
        return <XCircle className="h-4 w-4" />;
      default:
        return <Activity className="h-4 w-4" />;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'success':
        return <Badge variant="default" className="bg-green-500">Success</Badge>;
      case 'failed':
        return <Badge variant="destructive">Failed</Badge>;
      case 'pending':
        return <Badge variant="secondary">Pending</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  const formatCurrency = (amount?: number) => amount ? `₹${amount.toFixed(2)}` : 'N/A';

  return (
    <div className="space-y-6">
      {/* Filters and Controls */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Audit Log & Compliance
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search logs..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9"
              />
            </div>
            
            <Select value={actionFilter} onValueChange={setActionFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Filter by action" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Actions</SelectItem>
                <SelectItem value="provision">Provision</SelectItem>
                <SelectItem value="approve">Approve</SelectItem>
                <SelectItem value="reject">Reject</SelectItem>
                <SelectItem value="delete">Delete</SelectItem>
                <SelectItem value="update">Update</SelectItem>
              </SelectContent>
            </Select>
            
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="success">Success</SelectItem>
                <SelectItem value="failed">Failed</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
              </SelectContent>
            </Select>
            
            <Select value={dateRange} onValueChange={setDateRange}>
              <SelectTrigger>
                <SelectValue placeholder="Date range" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="1d">Last 24 hours</SelectItem>
                <SelectItem value="7d">Last 7 days</SelectItem>
                <SelectItem value="30d">Last 30 days</SelectItem>
                <SelectItem value="90d">Last 90 days</SelectItem>
              </SelectContent>
            </Select>
            
            <div className="flex gap-2">
              <Button variant="outline" onClick={() => onExport('json')} size="sm">
                <Download className="h-4 w-4 mr-1" />
                JSON
              </Button>
              <Button variant="outline" onClick={() => onExport('csv')} size="sm">
                <Download className="h-4 w-4 mr-1" />
                CSV
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Audit Entries */}
      <Card>
        <CardHeader>
          <CardTitle>Audit Entries ({filteredEntries.length})</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {filteredEntries.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <Shield className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>No audit entries found matching your criteria</p>
              </div>
            ) : (
              filteredEntries.map((entry) => (
                <div key={entry.id} className="border rounded-lg p-4">
                  <div className="flex items-start justify-between">
                    <div className="space-y-2 flex-1">
                      <div className="flex items-center gap-2">
                        {getActionIcon(entry.action)}
                        <span className="font-medium capitalize">{entry.action}</span>
                        {getStatusBadge(entry.status)}
                        <Badge variant="outline">{entry.resourceType}</Badge>
                      </div>
                      
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm text-muted-foreground">
                        <div className="flex items-center gap-1">
                          <User className="h-3 w-3" />
                          {entry.user}
                        </div>
                        <div className="flex items-center gap-1">
                          <Server className="h-3 w-3" />
                          {entry.resourceName}
                        </div>
                        <div className="flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          {new Date(entry.timestamp).toLocaleString()}
                        </div>
                        {entry.cost && (
                          <div className="flex items-center gap-1">
                            Cost: {formatCurrency(entry.cost)}
                          </div>
                        )}
                      </div>
                      
                      <p className="text-sm">{entry.details}</p>
                      
                      {entry.region && (
                        <div className="text-sm text-muted-foreground">
                          Region: {entry.region}
                        </div>
                      )}
                      
                      {entry.tags && Object.keys(entry.tags).length > 0 && (
                        <div className="flex flex-wrap gap-1">
                          {Object.entries(entry.tags).map(([key, value]) => (
                            <Badge key={key} variant="outline" className="text-xs">
                              {key}={value}
                            </Badge>
                          ))}
                        </div>
                      )}
                      
                      <details className="text-sm text-muted-foreground">
                        <summary className="cursor-pointer">Technical Details</summary>
                        <div className="mt-2 space-y-1">
                          <div>IP Address: {entry.ipAddress}</div>
                          <div>User Agent: {entry.userAgent}</div>
                        </div>
                      </details>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>

      {/* Summary Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-2">
              <CheckCircle className="h-5 w-5 text-green-600" />
              <div>
                <p className="text-sm font-medium">Successful Actions</p>
                <p className="text-2xl font-bold">
                  {filteredEntries.filter(e => e.status === 'success').length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-2">
              <XCircle className="h-5 w-5 text-red-600" />
              <div>
                <p className="text-sm font-medium">Failed Actions</p>
                <p className="text-2xl font-bold">
                  {filteredEntries.filter(e => e.status === 'failed').length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-2">
              <User className="h-5 w-5 text-blue-600" />
              <div>
                <p className="text-sm font-medium">Unique Users</p>
                <p className="text-2xl font-bold">
                  {new Set(filteredEntries.map(e => e.user)).size}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-2">
              <Activity className="h-5 w-5 text-purple-600" />
              <div>
                <p className="text-sm font-medium">Total Actions</p>
                <p className="text-2xl font-bold">{filteredEntries.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AuditLog;
