import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { Network, ShieldAlert, GitPullRequestArrow, Database, Loader2, Play } from 'lucide-react';
import aiServicesAPI from '../../lib/api';
import { Breadcrumb, BreadcrumbList, BreadcrumbItem, BreadcrumbLink, BreadcrumbSeparator, BreadcrumbPage } from '../ui/breadcrumb';
import { toast } from 'sonner';

const pretty = (v: any) => JSON.stringify(v, null, 2);

const MLOpsCenter: React.FC = () => {
  // Feature Store Ops
  const [dataset, setDataset] = useState('features:v1');
  const [feature, setFeature] = useState('price');
  const [principal, setPrincipal] = useState('team-ml');
  const [role, setRole] = useState('reader');
  const [fsLoading, setFsLoading] = useState(false);
  const [fsResult, setFsResult] = useState<any>(null);

  // Model Rollback
  const [prevVersion, setPrevVersion] = useState('model:v42');
  const [mrLoading, setMrLoading] = useState(false);
  const [mrResult, setMrResult] = useState<any>(null);

  // Data Drift
  const [ddFeature, setDdFeature] = useState('price');
  const [ddPipeline, setDdPipeline] = useState('training:checkout');
  const [ddLoading, setDdLoading] = useState(false);
  const [ddResult, setDdResult] = useState<any>(null);

  const runLineage = async () => {
    setFsLoading(true);
    try {
      const r = await aiServicesAPI.mlFeatureLineage(dataset);
      if (!r.success) throw new Error(r.error || 'Failed');
      setFsResult(r.data ?? r);
      toast.success('Lineage fetched');
    } catch (e: any) {
      toast.error(e.message || 'Lineage failed');
    } finally {
      setFsLoading(false);
    }
  };

  const runDrift = async () => {
    setFsLoading(true);
    try {
      const r = await aiServicesAPI.mlFeatureDrift(feature);
      if (!r.success) throw new Error(r.error || 'Failed');
      setFsResult(r.data ?? r);
      toast.success('Feature drift checked');
    } catch (e: any) {
      toast.error(e.message || 'Feature drift failed');
    } finally {
      setFsLoading(false);
    }
  };

  const runACL = async () => {
    setFsLoading(true);
    try {
      const r = await aiServicesAPI.mlFeatureACL(principal, role);
      if (!r.success) throw new Error(r.error || 'Failed');
      setFsResult(r.data ?? r);
      toast.success('ACL updated');
    } catch (e: any) {
      toast.error(e.message || 'ACL update failed');
    } finally {
      setFsLoading(false);
    }
  };

  const runCanary = async () => {
    setMrLoading(true);
    try {
      const r = await aiServicesAPI.mlModelCanary();
      if (!r.success) throw new Error(r.error || 'Failed');
      setMrResult(r.data ?? r);
      toast.success('Canary evaluated');
    } catch (e: any) {
      toast.error(e.message || 'Canary failed');
    } finally {
      setMrLoading(false);
    }
  };

  const runRollback = async () => {
    setMrLoading(true);
    try {
      const r = await aiServicesAPI.mlModelRollback(prevVersion);
      if (!r.success) throw new Error(r.error || 'Failed');
      setMrResult(r.data ?? r);
      toast.success('Rollback executed');
    } catch (e: any) {
      toast.error(e.message || 'Rollback failed');
    } finally {
      setMrLoading(false);
    }
  };

  const runSafetyGate = async () => {
    setMrLoading(true);
    try {
      const r = await aiServicesAPI.mlModelSafetyGate();
      if (!r.success) throw new Error(r.error || 'Failed');
      setMrResult(r.data ?? r);
      toast.success('Safety gate evaluated');
    } catch (e: any) {
      toast.error(e.message || 'Safety gate failed');
    } finally {
      setMrLoading(false);
    }
  };

  const runDriftDetect = async () => {
    setDdLoading(true);
    try {
      const r = await aiServicesAPI.mlDataDriftDetect(ddFeature);
      if (!r.success) throw new Error(r.error || 'Failed');
      setDdResult(r.data ?? r);
      toast.success('Data drift detected');
    } catch (e: any) {
      toast.error(e.message || 'Drift detection failed');
    } finally {
      setDdLoading(false);
    }
  };

  const runRetrain = async () => {
    setDdLoading(true);
    try {
      const r = await aiServicesAPI.mlDataRetrain(ddPipeline);
      if (!r.success) throw new Error(r.error || 'Failed');
      setDdResult(r.data ?? r);
      toast.success('Retraining triggered');
    } catch (e: any) {
      toast.error(e.message || 'Retraining failed');
    } finally {
      setDdLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <Breadcrumb>
            <BreadcrumbList>
              <BreadcrumbItem>
                <BreadcrumbLink href="/dashboard">Dashboard</BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                <BreadcrumbPage>MLOps Center</BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
          <h1 className="text-3xl font-bold mt-2">MLOps Center</h1>
          <p className="text-muted-foreground">Feature store ops, model rollback, and data drift</p>
        </div>
      </div>

      <Tabs defaultValue="fs" className="w-full">
        <TabsList>
          <TabsTrigger value="fs" className="gap-2"><Database className="h-4 w-4" /> Feature Store</TabsTrigger>
          <TabsTrigger value="rollback" className="gap-2"><GitPullRequestArrow className="h-4 w-4" /> Model Rollback</TabsTrigger>
          <TabsTrigger value="drift" className="gap-2"><ShieldAlert className="h-4 w-4" /> Data Drift</TabsTrigger>
        </TabsList>

        <TabsContent value="fs" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Feature Store Ops</CardTitle>
              <CardDescription>Lineage, drift monitoring, and ACLs</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid md:grid-cols-4 gap-4">
                <div>
                  <Label>Dataset</Label>
                  <Input value={dataset} onChange={(e) => setDataset(e.target.value)} />
                </div>
                <div>
                  <Label>Feature</Label>
                  <Input value={feature} onChange={(e) => setFeature(e.target.value)} />
                </div>
                <div>
                  <Label>Principal</Label>
                  <Input value={principal} onChange={(e) => setPrincipal(e.target.value)} />
                </div>
                <div>
                  <Label>Role</Label>
                  <Input value={role} onChange={(e) => setRole(e.target.value)} />
                </div>
              </div>
              <div className="flex gap-2">
                <Button onClick={runLineage} disabled={fsLoading}>{fsLoading ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Play className="h-4 w-4 mr-2" />}Lineage</Button>
                <Button onClick={runDrift} variant="outline" disabled={fsLoading}>Feature Drift</Button>
                <Button onClick={runACL} variant="outline" disabled={fsLoading}>Update ACL</Button>
              </div>
              {fsResult && <pre className="mt-2 p-3 bg-muted rounded-md overflow-auto text-sm">{pretty(fsResult)}</pre>}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="rollback" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Model Rollback</CardTitle>
              <CardDescription>Canary evaluation and safety-gated rollback</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <Label>Previous Version</Label>
                  <Input value={prevVersion} onChange={(e) => setPrevVersion(e.target.value)} />
                </div>
              </div>
              <div className="flex gap-2">
                <Button onClick={runCanary} disabled={mrLoading}>{mrLoading ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Play className="h-4 w-4 mr-2" />}Canary Eval</Button>
                <Button onClick={runRollback} variant="outline" disabled={mrLoading}>Rollback</Button>
                <Button onClick={runSafetyGate} variant="outline" disabled={mrLoading}>Safety Gate</Button>
              </div>
              {mrResult && <pre className="mt-2 p-3 bg-muted rounded-md overflow-auto text-sm">{pretty(mrResult)}</pre>}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="drift" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Data Drift</CardTitle>
              <CardDescription>Detect drift and trigger retraining workflows</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <Label>Feature</Label>
                  <Input value={ddFeature} onChange={(e) => setDdFeature(e.target.value)} />
                </div>
                <div>
                  <Label>Training Pipeline</Label>
                  <Input value={ddPipeline} onChange={(e) => setDdPipeline(e.target.value)} />
                </div>
              </div>
              <div className="flex gap-2">
                <Button onClick={runDriftDetect} disabled={ddLoading}>{ddLoading ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Play className="h-4 w-4 mr-2" />}Detect</Button>
                <Button onClick={runRetrain} variant="outline" disabled={ddLoading}>Retrain</Button>
              </div>
              {ddResult && <pre className="mt-2 p-3 bg-muted rounded-md overflow-auto text-sm">{pretty(ddResult)}</pre>}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default MLOpsCenter;


