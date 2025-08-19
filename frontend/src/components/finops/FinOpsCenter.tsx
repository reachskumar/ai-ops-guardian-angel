import React, { useMemo, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Textarea } from '../ui/textarea';
import { Label } from '../ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { AlertTriangle, BarChart3, Database, Network, TrendingUp, Loader2, Play } from 'lucide-react';
import aiServicesAPI from '../../lib/api';
import { toast } from 'sonner';

const pretty = (v: any) => JSON.stringify(v, null, 2);

const FinOpsCenter: React.FC = () => {
  // Cost Anomaly
  const [caWindow, setCaWindow] = useState('1d');
  const [caGran, setCaGran] = useState('service');
  const [caLoading, setCaLoading] = useState(false);
  const [caResult, setCaResult] = useState<any>(null);
  const [caExplainId, setCaExplainId] = useState('');
  const [caExplainLoading, setCaExplainLoading] = useState(false);
  const [caExplainResult, setCaExplainResult] = useState<any>(null);

  // Data Lifecycle
  const [dlBucket, setDlBucket] = useState('logs-bucket');
  const [dlAfterDays, setDlAfterDays] = useState('30');
  const [dlDataset, setDlDataset] = useState('audit');
  const [dlRetainDays, setDlRetainDays] = useState('365');
  const [dlLoading, setDlLoading] = useState(false);
  const [dlResult, setDlResult] = useState<any>(null);

  // Cleanup
  const [clPrefix, setClPrefix] = useState('');
  const [clMinSize, setClMinSize] = useState('50');
  const [clLoading, setClLoading] = useState(false);
  const [clResult, setClResult] = useState<any>(null);

  // Egress
  const [egWindow, setEgWindow] = useState('7d');
  const [egService, setEgService] = useState('');
  const [egLoading, setEgLoading] = useState(false);
  const [egResult, setEgResult] = useState<any>(null);
  const [egSuggestLoading, setEgSuggestLoading] = useState(false);
  const [egSuggestResult, setEgSuggestResult] = useState<any>(null);

  // Unit Economics
  const [ueBasis, setUeBasis] = useState('per_request');
  const [ueWindow, setUeWindow] = useState('7d');
  const [ueMapLoading, setUeMapLoading] = useState(false);
  const [ueMapResult, setUeMapResult] = useState<any>(null);
  const [ueRegLoading, setUeRegLoading] = useState(false);
  const [ueRegResult, setUeRegResult] = useState<any>(null);

  const runDetect = async () => {
    setCaLoading(true);
    try {
      const resp = await aiServicesAPI.finopsCostAnomalyDetect({ window: caWindow, granularity: caGran });
      if (!resp.success) throw new Error(resp.error || 'Failed');
      setCaResult(resp.data ?? resp);
      toast.success('Anomaly detection complete');
    } catch (e: any) {
      toast.error(e.message || 'Anomaly detection failed');
    } finally {
      setCaLoading(false);
    }
  };

  const runExplain = async () => {
    if (!caExplainId) { toast.error('Provide anomaly id'); return; }
    setCaExplainLoading(true);
    try {
      const resp = await aiServicesAPI.finopsCostAnomalyExplain(caExplainId);
      if (!resp.success) throw new Error(resp.error || 'Failed');
      setCaExplainResult(resp.data ?? resp);
      toast.success('Explanation ready');
    } catch (e: any) {
      toast.error(e.message || 'Explain failed');
    } finally {
      setCaExplainLoading(false);
    }
  };

  const runTierPlan = async () => {
    setDlLoading(true);
    try {
      const resp = await aiServicesAPI.finopsDataTieringPlan({ bucket: dlBucket, after_days: Number(dlAfterDays) });
      if (!resp.success) throw new Error(resp.error || 'Failed');
      setDlResult(resp.data ?? resp);
      toast.success('Tiering plan ready');
    } catch (e: any) {
      toast.error(e.message || 'Tiering failed');
    } finally {
      setDlLoading(false);
    }
  };

  const runRetention = async () => {
    setDlLoading(true);
    try {
      const resp = await aiServicesAPI.finopsRetentionPolicy({ dataset: dlDataset, retain_days: Number(dlRetainDays) });
      if (!resp.success) throw new Error(resp.error || 'Failed');
      setDlResult(resp.data ?? resp);
      toast.success('Retention policy ready');
    } catch (e: any) {
      toast.error(e.message || 'Retention failed');
    } finally {
      setDlLoading(false);
    }
  };

  const runCleanup = async () => {
    setClLoading(true);
    try {
      const resp = await aiServicesAPI.finopsCleanupScan({ path_prefix: clPrefix || undefined, min_size_gb: Number(clMinSize) });
      if (!resp.success) throw new Error(resp.error || 'Failed');
      setClResult(resp.data ?? resp);
      toast.success('Cleanup candidates listed');
    } catch (e: any) {
      toast.error(e.message || 'Cleanup failed');
    } finally {
      setClLoading(false);
    }
  };

  const runHotspots = async () => {
    setEgLoading(true);
    try {
      const resp = await aiServicesAPI.finopsEgressHotspots({ window: egWindow });
      if (!resp.success) throw new Error(resp.error || 'Failed');
      setEgResult(resp.data ?? resp);
      toast.success('Egress hotspots detected');
    } catch (e: any) {
      toast.error(e.message || 'Hotspot detection failed');
    } finally {
      setEgLoading(false);
    }
  };

  const runSuggest = async () => {
    setEgSuggestLoading(true);
    try {
      const resp = await aiServicesAPI.finopsEgressSuggest({ service: egService || undefined });
      if (!resp.success) throw new Error(resp.error || 'Failed');
      setEgSuggestResult(resp.data ?? resp);
      toast.success('Suggestions ready');
    } catch (e: any) {
      toast.error(e.message || 'Suggest failed');
    } finally {
      setEgSuggestLoading(false);
    }
  };

  const runUnitMap = async () => {
    setUeMapLoading(true);
    try {
      const resp = await aiServicesAPI.finopsUnitMap({ basis: ueBasis });
      if (!resp.success) throw new Error(resp.error || 'Failed');
      setUeMapResult(resp.data ?? resp);
      toast.success('Unit map ready');
    } catch (e: any) {
      toast.error(e.message || 'Unit map failed');
    } finally {
      setUeMapLoading(false);
    }
  };

  const runUnitReg = async () => {
    setUeRegLoading(true);
    try {
      const resp = await aiServicesAPI.finopsUnitRegressions({ window: ueWindow });
      if (!resp.success) throw new Error(resp.error || 'Failed');
      setUeRegResult(resp.data ?? resp);
      toast.success('Regressions computed');
    } catch (e: any) {
      toast.error(e.message || 'Regressions failed');
    } finally {
      setUeRegLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">FinOps Center</h1>
          <p className="text-muted-foreground">Anomalies, lifecycle policies, egress optimization, and unit economics</p>
        </div>
      </div>

      <Tabs defaultValue="anomaly" className="w-full">
        <TabsList>
          <TabsTrigger value="anomaly" className="gap-2"><AlertTriangle className="h-4 w-4" /> Cost Anomalies</TabsTrigger>
          <TabsTrigger value="lifecycle" className="gap-2"><Database className="h-4 w-4" /> Data Lifecycle</TabsTrigger>
          <TabsTrigger value="egress" className="gap-2"><Network className="h-4 w-4" /> Egress Optimizer</TabsTrigger>
          <TabsTrigger value="unit" className="gap-2"><BarChart3 className="h-4 w-4" /> Unit Economics</TabsTrigger>
        </TabsList>

        <TabsContent value="anomaly" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Cost Anomalies</CardTitle>
              <CardDescription>Real-time detection with explainers and Slack alerts</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid md:grid-cols-3 gap-4">
                <div>
                  <Label>Window</Label>
                  <Input value={caWindow} onChange={(e) => setCaWindow(e.target.value)} />
                </div>
                <div>
                  <Label>Granularity</Label>
                  <Input value={caGran} onChange={(e) => setCaGran(e.target.value)} />
                </div>
              </div>
              <div className="flex gap-2">
                <Button onClick={runDetect} disabled={caLoading}>
                  {caLoading ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Play className="h-4 w-4 mr-2" />}
                  Detect
                </Button>
              </div>
              {caResult && <pre className="mt-2 p-3 bg-muted rounded-md overflow-auto text-sm">{pretty(caResult)}</pre>}

              <div className="grid md:grid-cols-3 gap-4 pt-4 border-t">
                <div className="md:col-span-2">
                  <Label>Anomaly ID</Label>
                  <Input value={caExplainId} onChange={(e) => setCaExplainId(e.target.value)} placeholder="a-123" />
                </div>
                <div className="flex items-end">
                  <Button onClick={runExplain} disabled={caExplainLoading}>
                    {caExplainLoading ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <TrendingUp className="h-4 w-4 mr-2" />}
                    Explain
                  </Button>
                </div>
              </div>
              {caExplainResult && <pre className="mt-2 p-3 bg-muted rounded-md overflow-auto text-sm">{pretty(caExplainResult)}</pre>}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="lifecycle" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Data Lifecycle</CardTitle>
              <CardDescription>Tiering and retention policies; large-object cleanup</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid md:grid-cols-4 gap-4">
                <div>
                  <Label>Bucket</Label>
                  <Input value={dlBucket} onChange={(e) => setDlBucket(e.target.value)} />
                </div>
                <div>
                  <Label>Move after (days)</Label>
                  <Input type="number" value={dlAfterDays} onChange={(e) => setDlAfterDays(e.target.value)} />
                </div>
                <div>
                  <Label>Dataset</Label>
                  <Input value={dlDataset} onChange={(e) => setDlDataset(e.target.value)} />
                </div>
                <div>
                  <Label>Retain (days)</Label>
                  <Input type="number" value={dlRetainDays} onChange={(e) => setDlRetainDays(e.target.value)} />
                </div>
              </div>
              <div className="flex gap-2">
                <Button onClick={runTierPlan} disabled={dlLoading}>
                  {dlLoading ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Play className="h-4 w-4 mr-2" />}
                  Tiering Plan
                </Button>
                <Button onClick={runRetention} variant="outline" disabled={dlLoading}>Retention Policy</Button>
              </div>
              {dlResult && <pre className="mt-2 p-3 bg-muted rounded-md overflow-auto text-sm">{pretty(dlResult)}</pre>}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Large-object Cleanup</CardTitle>
              <CardDescription>Identify large files for cleanup</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <Label>Path prefix</Label>
                  <Input value={clPrefix} onChange={(e) => setClPrefix(e.target.value)} placeholder="s3://bucket/path/" />
                </div>
                <div>
                  <Label>Min size (GB)</Label>
                  <Input type="number" value={clMinSize} onChange={(e) => setClMinSize(e.target.value)} />
                </div>
              </div>
              <div className="flex gap-2">
                <Button onClick={runCleanup} disabled={clLoading}>
                  {clLoading ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Play className="h-4 w-4 mr-2" />}
                  Scan
                </Button>
              </div>
              {clResult && <pre className="mt-2 p-3 bg-muted rounded-md overflow-auto text-sm">{pretty(clResult)}</pre>}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="egress" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Egress Optimizer</CardTitle>
              <CardDescription>Detect hotspots and get routing/placement suggestions</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid md:grid-cols-3 gap-4">
                <div>
                  <Label>Window</Label>
                  <Input value={egWindow} onChange={(e) => setEgWindow(e.target.value)} />
                </div>
                <div>
                  <Label>Service (optional)</Label>
                  <Input value={egService} onChange={(e) => setEgService(e.target.value)} />
                </div>
              </div>
              <div className="flex gap-2">
                <Button onClick={runHotspots} disabled={egLoading}>
                  {egLoading ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Play className="h-4 w-4 mr-2" />}
                  Detect Hotspots
                </Button>
                <Button onClick={runSuggest} variant="outline" disabled={egSuggestLoading}>Get Suggestions</Button>
              </div>
              {egResult && <pre className="mt-2 p-3 bg-muted rounded-md overflow-auto text-sm">{pretty(egResult)}</pre>}
              {egSuggestResult && <pre className="mt-2 p-3 bg-muted rounded-md overflow-auto text-sm">{pretty(egSuggestResult)}</pre>}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="unit" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Unit Economics</CardTitle>
              <CardDescription>Map costs to services/tenants/SLO targets; spot regressions</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid md:grid-cols-3 gap-4">
                <div>
                  <Label>Basis</Label>
                  <Input value={ueBasis} onChange={(e) => setUeBasis(e.target.value)} placeholder="per_request" />
                </div>
                <div>
                  <Label>Window</Label>
                  <Input value={ueWindow} onChange={(e) => setUeWindow(e.target.value)} />
                </div>
              </div>
              <div className="flex gap-2">
                <Button onClick={runUnitMap} disabled={ueMapLoading}>
                  {ueMapLoading ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Play className="h-4 w-4 mr-2" />}
                  Map Costs
                </Button>
                <Button onClick={runUnitReg} variant="outline" disabled={ueRegLoading}>Find Regressions</Button>
              </div>
              {ueMapResult && <pre className="mt-2 p-3 bg-muted rounded-md overflow-auto text-sm">{pretty(ueMapResult)}</pre>}
              {ueRegResult && <pre className="mt-2 p-3 bg-muted rounded-md overflow-auto text-sm">{pretty(ueRegResult)}</pre>}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default FinOpsCenter;


