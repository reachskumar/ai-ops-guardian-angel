
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Download, Search, Filter } from 'lucide-react';

export type AuditAction = 'submit' | 'approve' | 'reject' | 'deploy' | 'terminate' | 'modify';
export type AuditStatus = 'success' | 'pending' | 'failed' | 'approved' | 'rejected';

export interface AuditEntry {
  id: string;
  timestamp: string;
  user: string;
  action: AuditAction;
  resourceType: string;
  resourceName: string;
  status: AuditStatus;
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
  const [filterAction, setFilterAction] = useState<string>('all');
  const [filterStatus, setFilterStatus] = useState<string>('all');

  const filteredEntries = entries.filter(entry => {
    const matchesSearch = !searchTerm || 
      entry.user.toLowerCase().includes(searchTerm.toLowerCase()) ||
      entry.resourceType.toLowerCase().includes(searchTerm.toLowerCase()) ||
      entry.resourceName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      entry.details.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesAction = filterAction === 'all' || entry.action === filterAction;
    const matchesStatus = filterStatus === 'all' || entry.status === filterStatus;
    
    return matchesSearch && matchesAction && matchesStatus;
  });

  const getStatusBadge = (status: AuditStatus) => {
    const variants = {
      success: 'default',
      pending: 'secondary',
      failed: 'destructive',
      approved: 'default',
      rejected: 'destructive'
    } as const;

    return (
      <Badge variant={variants[status] || 'secondary'}>
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </Badge>
    );
  };

  const getActionBadge = (action: AuditAction) => {
    const colors = {
      submit: 'bg-blue-100 text-blue-800',
      approve: 'bg-green-100 text-green-800', 
      reject: 'bg-red-100 text-red-800',
      deploy: 'bg-purple-100 text-purple-800',
      terminate: 'bg-orange-100 text-orange-800',
      modify: 'bg-yellow-100 text-yellow-800'
    };

    return (
      <Badge variant="outline" className={colors[action]}>
        {action.charAt(0).toUpperCase() + action.slice(1)}
      </Badge>
    );
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">Audit Log</h3>
        <div className="flex gap-2">
          <Button
            onClick={() => onExport('csv')}
            variant="outline"
            size="sm"
          >
            <Download className="h-4 w-4 mr-1" />
            Export CSV
          </Button>
          <Button
            onClick={() => onExport('json')}
            variant="outline"
            size="sm"
          >
            <Download className="h-4 w-4 mr-1" />
            Export JSON
          </Button>
        </div>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex gap-4 items-center">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search audit logs..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-8"
                />
              </div>
            </div>
            <Select value={filterAction} onValueChange={setFilterAction}>
              <SelectTrigger className="w-32">
                <SelectValue placeholder="Action" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Actions</SelectItem>
                <SelectItem value="submit">Submit</SelectItem>
                <SelectItem value="approve">Approve</SelectItem>
                <SelectItem value="reject">Reject</SelectItem>
                <SelectItem value="deploy">Deploy</SelectItem>
                <SelectItem value="terminate">Terminate</SelectItem>
                <SelectItem value="modify">Modify</SelectItem>
              </SelectContent>
            </Select>
            <Select value={filterStatus} onValueChange={setFilterStatus}>
              <SelectTrigger className="w-32">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="success">Success</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="failed">Failed</SelectItem>
                <SelectItem value="approved">Approved</SelectItem>
                <SelectItem value="rejected">Rejected</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Audit Entries */}
      <div className="space-y-2">
        {filteredEntries.length === 0 ? (
          <Card>
            <CardContent className="pt-6">
              <div className="text-center text-muted-foreground">
                No audit entries found matching your criteria.
              </div>
            </CardContent>
          </Card>
        ) : (
          filteredEntries.map((entry) => (
            <Card key={entry.id}>
              <CardContent className="pt-4">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      {getActionBadge(entry.action)}
                      {getStatusBadge(entry.status)}
                      <span className="text-sm text-muted-foreground">
                        {new Date(entry.timestamp).toLocaleString()}
                      </span>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                      <div>
                        <p><strong>User:</strong> {entry.user}</p>
                        <p><strong>Resource:</strong> {entry.resourceType} - {entry.resourceName}</p>
                        <p><strong>Details:</strong> {entry.details}</p>
                      </div>
                      <div>
                        <p><strong>IP Address:</strong> {entry.ipAddress}</p>
                        {entry.cost && <p><strong>Cost:</strong> ${entry.cost}/month</p>}
                        {entry.region && <p><strong>Region:</strong> {entry.region}</p>}
                        {entry.tags && Object.keys(entry.tags).length > 0 && (
                          <div>
                            <strong>Tags:</strong>
                            <div className="flex flex-wrap gap-1 mt-1">
                              {Object.entries(entry.tags).map(([key, value]) => (
                                <Badge key={key} variant="outline" className="text-xs">
                                  {key}: {value}
                                </Badge>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
};

export default AuditLog;
