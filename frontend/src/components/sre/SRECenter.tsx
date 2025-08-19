import React, { useMemo, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Textarea } from '../ui/textarea';
import { Label } from '../ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { Activity, Beaker, BookOpen, GitCompare, Loader2, Play, Clipboard, Download } from 'lucide-react';
import aiServicesAPI from '../../lib/api';
import { Breadcrumb, BreadcrumbList, BreadcrumbItem, BreadcrumbLink, BreadcrumbSeparator, BreadcrumbPage } from '../ui/breadcrumb';
import { toast } from 'sonner';

const pretty = (val: any) => JSON.stringify(val, null, 2);

const SRECenter: React.FC = () => {
  // Incident Manage state
  const [imTenantId, setImTenantId] = useState('');
  const [imService, setImService] = useState('');
  const [imAlerts, setImAlerts] = useState('[\n  {"id": "a1", "severity": "critical", "metric": "latency", "value": 1200, "threshold": 800 },\n  {"id": "a2", "severity": "warning", "metric": "errors", "value": 0.09, "threshold": 0.05 }\n]');
  const [imLoading, setImLoading] = useState(false);
  const [imResult, setImResult] = useState<any>(null);

  // SLO Evaluate state
  const [sloName, setSloName] = useState('checkout-availability');
  const [sloTarget, setSloTarget] = useState('99.9');
  const [sloWindow, setSloWindow] = useState('30d');
  const [sloLoading, setSloLoading] = useState(false);
  const [sloResult, setSloResult] = useState<any>(null);

  // Change Correlation state
  const [ccIncidentId, setCcIncidentId] = useState('INC-12345');
  const [ccService, setCcService] = useState('web-frontend');
  const [ccLoading, setCcLoading] = useState(false);
  const [ccResult, setCcResult] = useState<any>(null);

  // Runbook Generator state
  const [rbTenantId, setRbTenantId] = useState('');
  const [rbIncident, setRbIncident] = useState('{\n  "id": "INC-5678",\n  "service": "payments",\n  "symptoms": ["elevated latency", "sporadic 5xx"],\n  "start_time": "2025-08-19T09:30:00Z"\n}');
  const [rbLoading, setRbLoading] = useState(false);
  const [rbResult, setRbResult] = useState<any>(null);

  const rbText = useMemo(() => {
    if (!rbResult) return '';
    if (typeof rbResult === 'string') return rbResult;
    if (rbResult?.runbook) return String(rbResult.runbook);
    return pretty(rbResult);
  }, [rbResult]);

  const copy = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      toast.success('Copied to clipboard');
    } catch (e) {
      toast.error('Copy failed');
    }
  };

  const download = (filename: string, text: string) => {
    const blob = new Blob([text], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    URL.revokeObjectURL(url);
    document.body.removeChild(a);
  };

  const onIncidentManage = async () => {
    setImLoading(true);
    try {
      let alerts: any[] = [];
      try {
        alerts = JSON.parse(imAlerts);
        if (!Array.isArray(alerts)) throw new Error('Alerts JSON must be an array');
      } catch (e: any) {
        toast.error(`Invalid alerts JSON: ${e.message}`);
        setImLoading(false);
        return;
      }
      const resp = await aiServicesAPI.sreIncidentManage({
        tenant_id: imTenantId || undefined,
        service: imService || undefined,
        alerts,
      });
      if (!resp.success) throw new Error(resp.error || 'Failed');
      setImResult(resp.data ?? resp);
      toast.success('Incident analysis completed');
    } catch (e: any) {
      toast.error(e.message || 'Incident analysis failed');
    } finally {
      setImLoading(false);
    }
  };

  const onSLOEvaluate = async () => {
    setSloLoading(true);
    try {
      const slo = {
        name: sloName,
        target: Number(sloTarget),
        window: sloWindow,
      } as any;
      const resp = await aiServicesAPI.sreSLOEvaluate(slo);
      if (!resp.success) throw new Error(resp.error || 'Failed');
      setSloResult(resp.data ?? resp);
      toast.success('SLO evaluation completed');
    } catch (e: any) {
      toast.error(e.message || 'SLO evaluation failed');
    } finally {
      setSloLoading(false);
    }
  };

  const onChangeCorrelate = async () => {
    setCcLoading(true);
    try {
      if (!ccIncidentId) throw new Error('Incident ID is required');
      const resp = await aiServicesAPI.sreChangeCorrelate({
        incident_id: ccIncidentId,
        service: ccService || undefined,
      });
      if (!resp.success) throw new Error(resp.error || 'Failed');
      setCcResult(resp.data ?? resp);
      toast.success('Change correlation completed');
    } catch (e: any) {
      toast.error(e.message || 'Change correlation failed');
    } finally {
      setCcLoading(false);
    }
  };

  const onRunbookGenerate = async () => {
    setRbLoading(true);
    try {
      let incident: any = {};
      try {
        incident = JSON.parse(rbIncident);
      } catch (e: any) {
        toast.error(`Invalid incident JSON: ${e.message}`);
        setRbLoading(false);
        return;
      }
      const resp = await aiServicesAPI.sreRunbookGenerate({
        tenant_id: rbTenantId || undefined,
        incident,
      });
      if (!resp.success) throw new Error(resp.error || 'Failed');
      setRbResult(resp.data ?? resp);
      toast.success('Runbook generated');
    } catch (e: any) {
      toast.error(e.message || 'Runbook generation failed');
    } finally {
      setRbLoading(false);
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
                <BreadcrumbPage>SRE Center</BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
          <h1 className="text-3xl font-bold mt-2">SRE Center</h1>
          <p className="text-muted-foreground">Alert correlation, SLO evaluation, change analysis, and runbook generation</p>
        </div>
      </div>

      <Tabs defaultValue="incident" className="w-full">
        <TabsList>
          <TabsTrigger value="incident" className="gap-2"><Activity className="h-4 w-4" /> Alert Correlation</TabsTrigger>
          <TabsTrigger value="slo" className="gap-2"><Beaker className="h-4 w-4" /> SLO Evaluator</TabsTrigger>
          <TabsTrigger value="changes" className="gap-2"><GitCompare className="h-4 w-4" /> Change Correlation</TabsTrigger>
          <TabsTrigger value="runbook" className="gap-2"><BookOpen className="h-4 w-4" /> Runbook Generator</TabsTrigger>
        </TabsList>

        <TabsContent value="incident" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Alert Correlation</CardTitle>
              <CardDescription>Paste alerts JSON and let the Incident Manager analyze duplicates and likely causes.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="imTenant">Tenant ID (optional)</Label>
                  <Input id="imTenant" placeholder="tenant-123" value={imTenantId} onChange={(e) => setImTenantId(e.target.value)} />
                </div>
                <div>
                  <Label htmlFor="imService">Service (optional)</Label>
                  <Input id="imService" placeholder="web-frontend" value={imService} onChange={(e) => setImService(e.target.value)} />
                </div>
              </div>
              <div>
                <Label htmlFor="imAlerts">Alerts JSON</Label>
                <Textarea id="imAlerts" rows={10} value={imAlerts} onChange={(e) => setImAlerts(e.target.value)} />
              </div>
              <div className="flex gap-2">
                <Button onClick={onIncidentManage} disabled={imLoading}>
                  {imLoading ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Play className="h-4 w-4 mr-2" />}
                  Analyze
                </Button>
              </div>
              {imResult ? (
                <div>
                  <Label>Result</Label>
                  <pre className="mt-2 p-3 bg-muted rounded-md overflow-auto text-sm">{pretty(imResult)}</pre>
                </div>
              ) : (
                <div className="text-sm text-muted-foreground">No results yet. Run Analyze to see output.</div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="slo" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>SLO Evaluator</CardTitle>
              <CardDescription>Compute burn rates and gating decisions for a given SLO target and window.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid md:grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="sloName">Objective</Label>
                  <Input id="sloName" placeholder="checkout-availability" value={sloName} onChange={(e) => setSloName(e.target.value)} />
                </div>
                <div>
                  <Label htmlFor="sloTarget">Target (%)</Label>
                  <Input id="sloTarget" type="number" step="0.001" placeholder="99.9" value={sloTarget} onChange={(e) => setSloTarget(e.target.value)} />
                </div>
                <div>
                  <Label htmlFor="sloWindow">Window</Label>
                  <Input id="sloWindow" placeholder="30d" value={sloWindow} onChange={(e) => setSloWindow(e.target.value)} />
                </div>
              </div>
              <div className="flex gap-2">
                <Button onClick={onSLOEvaluate} disabled={sloLoading}>
                  {sloLoading ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Play className="h-4 w-4 mr-2" />}
                  Evaluate
                </Button>
              </div>
              {sloResult ? (
                <div>
                  <Label>Result</Label>
                  <pre className="mt-2 p-3 bg-muted rounded-md overflow-auto text-sm">{pretty(sloResult)}</pre>
                </div>
              ) : (
                <div className="text-sm text-muted-foreground">No results yet. Evaluate to see output.</div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="changes" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Change Correlation</CardTitle>
              <CardDescription>Correlate the incident with recent deploys or configuration changes.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="ccIncident">Incident ID</Label>
                  <Input id="ccIncident" placeholder="INC-12345" value={ccIncidentId} onChange={(e) => setCcIncidentId(e.target.value)} />
                </div>
                <div>
                  <Label htmlFor="ccService">Service (optional)</Label>
                  <Input id="ccService" placeholder="web-frontend" value={ccService} onChange={(e) => setCcService(e.target.value)} />
                </div>
              </div>
              <div className="flex gap-2">
                <Button onClick={onChangeCorrelate} disabled={ccLoading}>
                  {ccLoading ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Play className="h-4 w-4 mr-2" />}
                  Correlate
                </Button>
              </div>
              {ccResult ? (
                <div>
                  <Label>Result</Label>
                  <pre className="mt-2 p-3 bg-muted rounded-md overflow-auto text-sm">{pretty(ccResult)}</pre>
                </div>
              ) : (
                <div className="text-sm text-muted-foreground">No results yet. Correlate to see output.</div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="runbook" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Runbook Generator</CardTitle>
              <CardDescription>Generate a runbook based on incident context and service metadata.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="rbTenant">Tenant ID (optional)</Label>
                  <Input id="rbTenant" placeholder="tenant-123" value={rbTenantId} onChange={(e) => setRbTenantId(e.target.value)} />
                </div>
              </div>
              <div>
                <Label htmlFor="rbIncident">Incident JSON</Label>
                <Textarea id="rbIncident" rows={10} value={rbIncident} onChange={(e) => setRbIncident(e.target.value)} />
              </div>
              <div className="flex gap-2">
                <Button onClick={onRunbookGenerate} disabled={rbLoading}>
                  {rbLoading ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Play className="h-4 w-4 mr-2" />}
                  Generate
                </Button>
                {rbText && (
                  <>
                    <Button variant="outline" onClick={() => copy(rbText)} className="gap-2">
                      <Clipboard className="h-4 w-4" /> Copy
                    </Button>
                    <Button variant="outline" onClick={() => download('runbook.md', rbText)} className="gap-2">
                      <Download className="h-4 w-4" /> Download
                    </Button>
                  </>
                )}
              </div>
              {rbResult ? (
                <div>
                  <Label>Result</Label>
                  <pre className="mt-2 p-3 bg-muted rounded-md overflow-auto text-sm">{rbText}</pre>
                </div>
              ) : (
                <div className="text-sm text-muted-foreground">No results yet. Generate to see output.</div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default SRECenter;


