import React, { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import aiServicesAPI from '../../lib/api';
import { Card } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select';
import { Button } from '@/components/ui/button';

const BackupDRForm: React.FC = () => {
  const { user } = useAuth();
  const [env, setEnv] = useState('staging');
  const [snapshots, setSnapshots] = useState('daily');
  const [retention, setRetention] = useState(30);
  const [drill, setDrill] = useState('monthly');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any | null>(null);

  const submit = async () => {
    if (!user?.tenantId) return;
    setLoading(true);
    setResult(null);
    try {
      const res = await aiServicesAPI.backupDR({ tenant_id: user.tenantId, action: 'plan', env, snapshots, retention_days: retention, drill_schedule: drill });
      setResult(res.data || res);
    } finally { setLoading(false); }
  };

  const validateRestore = async () => {
    if (!user?.tenantId) return;
    setLoading(true);
    try {
      const res = await aiServicesAPI.backupDR({ tenant_id: user.tenantId, action: 'validate_restore', env });
      setResult(res.data || res);
    } finally { setLoading(false); }
  };

  const runDrill = async () => {
    if (!user?.tenantId) return;
    setLoading(true);
    try {
      const res = await aiServicesAPI.backupDR({ tenant_id: user.tenantId, action: 'drill', env });
      setResult(res.data || res);
    } finally { setLoading(false); }
  };

  return (
    <Card className="p-4 space-y-3">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
        <div>
          <Label className="mb-1 block">Environment</Label>
          <Input value={env} onChange={(e) => setEnv(e.target.value)} />
        </div>
        <div>
          <Label className="mb-1 block">Snapshots</Label>
          <Select value={snapshots} onValueChange={setSnapshots}>
            <SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="daily">Daily</SelectItem>
              <SelectItem value="hourly">Hourly</SelectItem>
              <SelectItem value="weekly">Weekly</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div>
          <Label className="mb-1 block">Retention (days)</Label>
          <Input type="number" value={retention} onChange={(e) => setRetention(Number(e.target.value))} />
        </div>
        <div>
          <Label className="mb-1 block">DR Drill</Label>
          <Select value={drill} onValueChange={setDrill}>
            <SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="monthly">Monthly</SelectItem>
              <SelectItem value="quarterly">Quarterly</SelectItem>
              <SelectItem value="yearly">Yearly</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
      <div className="flex gap-2">
        <Button onClick={submit} disabled={loading || !user?.tenantId}>{loading ? 'Submitting…' : 'Generate Plan'}</Button>
        <Button variant="secondary" onClick={runDrill} disabled={loading || !user?.tenantId}>Schedule DR Drill</Button>
        <Button variant="outline" onClick={validateRestore} disabled={loading || !user?.tenantId}>Validate Restore</Button>
      </div>
      {result && (
        <div className="mt-2 text-xs whitespace-pre-wrap bg-secondary/40 p-3 rounded">
          <pre>{JSON.stringify(result, null, 2)}</pre>
        </div>
      )}
    </Card>
  );
};

export default BackupDRForm;


