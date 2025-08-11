import React, { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

const CloudOpsPanel: React.FC = () => {
  const [tenantId, setTenantId] = useState('default');
  const [provider, setProvider] = useState('aws');
  const [action, setAction] = useState('inventory');
  const [region, setRegion] = useState('us-east-1');
  const [params, setParams] = useState('{}');
  const [dryRun, setDryRun] = useState(true);
  const [requireApproval, setRequireApproval] = useState(true);
  const [confirm, setConfirm] = useState('');
  const [costThreshold, setCostThreshold] = useState('0');
  const [override, setOverride] = useState('');

  const run = async () => {
    const resp = await fetch(`/api/v1/integrations/${tenantId}/cloud/ops`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ provider, action, region, params: JSON.parse(params), dry_run: dryRun, require_approval: requireApproval, confirm, cost_threshold: costThreshold, override })
    });
    const data = await resp.json();
    alert('Dispatched cloud-ops workflow.');
  };

  return (
    <Card className="mt-6">
      <CardHeader>
        <CardTitle>Cloud Operations</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <Label>Tenant</Label>
            <Input value={tenantId} onChange={(e) => setTenantId(e.target.value)} />
          </div>
          <div>
            <Label>Provider</Label>
            <Input value={provider} onChange={(e) => setProvider(e.target.value)} />
          </div>
          <div>
            <Label>Action</Label>
            <Input value={action} onChange={(e) => setAction(e.target.value)} />
          </div>
          <div>
            <Label>Region</Label>
            <Input value={region} onChange={(e) => setRegion(e.target.value)} />
          </div>
          <div className="md:col-span-2">
            <Label>Params (JSON)</Label>
            <Input value={params} onChange={(e) => setParams(e.target.value)} />
          </div>
        </div>
        <Button onClick={run}>Run</Button>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
          <div>
            <Label>Dry Run</Label>
            <Input value={dryRun ? 'true' : 'false'} onChange={(e) => setDryRun(e.target.value === 'true')} />
          </div>
          <div>
            <Label>Require Approval</Label>
            <Input value={requireApproval ? 'true' : 'false'} onChange={(e) => setRequireApproval(e.target.value === 'true')} />
          </div>
          <div>
            <Label>Confirm (yes)</Label>
            <Input value={confirm} onChange={(e) => setConfirm(e.target.value)} />
          </div>
          <div>
            <Label>Cost Threshold (USD)</Label>
            <Input value={costThreshold} onChange={(e) => setCostThreshold(e.target.value)} />
          </div>
          <div>
            <Label>Override (yes)</Label>
            <Input value={override} onChange={(e) => setOverride(e.target.value)} />
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default CloudOpsPanel;


