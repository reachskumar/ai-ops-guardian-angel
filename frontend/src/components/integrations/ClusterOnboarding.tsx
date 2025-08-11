import React, { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

const ClusterOnboarding: React.FC = () => {
  const [tenantId, setTenantId] = useState('default');
  const [repo, setRepo] = useState('org/repo');
  const [kubeconfigB64, setKubeconfigB64] = useState('');
  const [promStg, setPromStg] = useState('');
  const [promProd, setPromProd] = useState('');
  const [slackWebhook, setSlackWebhook] = useState('');
  const [pagerDuty, setPagerDuty] = useState('');

  const call = async (path: string, body: any) => {
    const resp = await fetch(path, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body)
    });
    if (!resp.ok) throw new Error(await resp.text());
  };

  const handleSaveSecrets = async () => {
    await call(`/api/v1/integrations/${tenantId}/save`, { provider: 'monitoring', secrets: { prometheus_url_staging: promStg, prometheus_url_production: promProd }});
    await call(`/api/v1/integrations/${tenantId}/save`, { provider: 'alerting', secrets: { slack_webhook_url: slackWebhook, pagerduty_routing_key: pagerDuty }});
    alert('Saved monitoring/alerting settings');
  };

  const handleInstallControllers = async () => {
    // Use GitOps PR workflow to push controller manifests via tenant repo (simple signal dispatch)
    // In a real flow, this would dispatch a repo workflow that runs helm installs in their cluster
    alert('Dispatching install-controllers workflow (placeholder).');
  };

  const handleAddRepoSecrets = async () => {
    // Call backend to set repo secrets via GitHub App (future enhancement)
    alert('Adding repo secrets via backend (placeholder).');
  };

  return (
    <Card className="mt-6">
      <CardHeader>
        <CardTitle>Cluster Onboarding</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex gap-4 items-end">
          <div>
            <Label>Tenant</Label>
            <Input value={tenantId} onChange={(e) => setTenantId(e.target.value)} className="w-64" />
          </div>
          <div>
            <Label>Tenant Repo (org/repo)</Label>
            <Input value={repo} onChange={(e) => setRepo(e.target.value)} className="w-80" />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label>Prometheus URL (staging)</Label>
            <Input value={promStg} onChange={(e) => setPromStg(e.target.value)} />
          </div>
          <div>
            <Label>Prometheus URL (production)</Label>
            <Input value={promProd} onChange={(e) => setPromProd(e.target.value)} />
          </div>
          <div>
            <Label>Slack Webhook</Label>
            <Input value={slackWebhook} onChange={(e) => setSlackWebhook(e.target.value)} />
          </div>
          <div>
            <Label>PagerDuty Routing Key</Label>
            <Input value={pagerDuty} onChange={(e) => setPagerDuty(e.target.value)} />
          </div>
          <div>
            <Label>Kubeconfig (base64)</Label>
            <Input value={kubeconfigB64} onChange={(e) => setKubeconfigB64(e.target.value)} />
          </div>
        </div>

        <div className="flex gap-3">
          <Button onClick={handleSaveSecrets}>Save Monitoring/Alerting</Button>
          <Button variant="outline" onClick={handleInstallControllers}>Install Controllers</Button>
          <Button variant="outline" onClick={handleAddRepoSecrets}>Add Repo Secrets</Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default ClusterOnboarding;


