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

  const run = async () => {
    const resp = await fetch(`/api/v1/chat`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        message: `cloud ${provider} ${action} ${region}`,
        tenant_id: tenantId,
        params: JSON.parse(params)
      })
    });
    const data = await resp.json();
    alert(data.response || 'Executed');
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
      </CardContent>
    </Card>
  );
};

export default CloudOpsPanel;


