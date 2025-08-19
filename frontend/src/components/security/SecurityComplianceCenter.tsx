import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { ShieldCheck, PackageSearch, KeyRound, Scale, ScrollText, Loader2, Play } from 'lucide-react';
import aiServicesAPI from '../../lib/api';
import { Breadcrumb, BreadcrumbList, BreadcrumbItem, BreadcrumbLink, BreadcrumbSeparator, BreadcrumbPage } from '../ui/breadcrumb';
import { toast } from 'sonner';

const pretty = (v: any) => JSON.stringify(v, null, 2);

const SecurityComplianceCenter: React.FC = () => {
  // Supply chain
  const [image, setImage] = useState('ghcr.io/org/app:1.0.0');
  const [scLoading, setScLoading] = useState(false);
  const [scResult, setScResult] = useState<any>(null);

  // SBOM
  const [sbImage, setSbImage] = useState('');
  const [sbLoading, setSbLoading] = useState(false);
  const [sbResult, setSbResult] = useState<any>(null);

  // Data classification
  const [source, setSource] = useState('s3://bucket/path');
  const [dcLoading, setDcLoading] = useState(false);
  const [dcResult, setDcResult] = useState<any>(null);

  // OPA
  const [target, setTarget] = useState('opa-server');
  const [scope, setScope] = useState('prod');
  const [opaLoading, setOpaLoading] = useState(false);
  const [opaResult, setOpaResult] = useState<any>(null);

  // Auditor mode
  const [sessionId, setSessionId] = useState('');
  const [audLoading, setAudLoading] = useState(false);
  const [audResult, setAudResult] = useState<any>(null);

  const runSign = async () => {
    setScLoading(true);
    try {
      const r = await aiServicesAPI.secCosignSign(image);
      if (!r.success) throw new Error(r.error || 'Failed');
      setScResult(r.data ?? r);
      toast.success('Image signed');
    } catch (e: any) {
      toast.error(e.message || 'Sign failed');
    } finally {
      setScLoading(false);
    }
  };

  const runVerify = async () => {
    setScLoading(true);
    try {
      const r = await aiServicesAPI.secCosignVerify(image);
      if (!r.success) throw new Error(r.error || 'Failed');
      setScResult(r.data ?? r);
      toast.success('Verification ok');
    } catch (e: any) {
      toast.error(e.message || 'Verify failed');
    } finally {
      setScLoading(false);
    }
  };

  const runProvenance = async () => {
    setScLoading(true);
    try {
      const r = await aiServicesAPI.secSlsaProvenance();
      if (!r.success) throw new Error(r.error || 'Failed');
      setScResult(r.data ?? r);
      toast.success('Provenance generated');
    } catch (e: any) {
      toast.error(e.message || 'Provenance failed');
    } finally {
      setScLoading(false);
    }
  };

  const runSbom = async () => {
    setSbLoading(true);
    try {
      const r = await aiServicesAPI.secSbomGenerate(sbImage ? { image: sbImage } : {});
      if (!r.success) throw new Error(r.error || 'Failed');
      setSbResult(r.data ?? r);
      toast.success('SBOM generated');
    } catch (e: any) {
      toast.error(e.message || 'SBOM failed');
    } finally {
      setSbLoading(false);
    }
  };

  const runScanCorrelate = async () => {
    setSbLoading(true);
    try {
      const r = await aiServicesAPI.secSbomScanCorrelate();
      if (!r.success) throw new Error(r.error || 'Failed');
      setSbResult(r.data ?? r);
      toast.success('Scan correlation complete');
    } catch (e: any) {
      toast.error(e.message || 'Scan correlation failed');
    } finally {
      setSbLoading(false);
    }
  };

  const runPII = async () => {
    setDcLoading(true);
    try {
      const r = await aiServicesAPI.secDataPiiDetect(source);
      if (!r.success) throw new Error(r.error || 'Failed');
      setDcResult(r.data ?? r);
      toast.success('PII scan complete');
    } catch (e: any) {
      toast.error(e.message || 'PII scan failed');
    } finally {
      setDcLoading(false);
    }
  };

  const runSecrets = async () => {
    setDcLoading(true);
    try {
      const r = await aiServicesAPI.secDataSecretDetect(source);
      if (!r.success) throw new Error(r.error || 'Failed');
      setDcResult(r.data ?? r);
      toast.success('Secrets scan complete');
    } catch (e: any) {
      toast.error(e.message || 'Secrets scan failed');
    } finally {
      setDcLoading(false);
    }
  };

  const runResidency = async () => {
    setDcLoading(true);
    try {
      const r = await aiServicesAPI.secDataResidencyEnforce(scope);
      if (!r.success) throw new Error(r.error || 'Failed');
      setDcResult(r.data ?? r);
      toast.success('Residency check done');
    } catch (e: any) {
      toast.error(e.message || 'Residency failed');
    } finally {
      setDcLoading(false);
    }
  };

  const runBundle = async () => {
    setOpaLoading(true);
    try {
      const r = await aiServicesAPI.secOpaBundle(target);
      if (!r.success) throw new Error(r.error || 'Failed');
      setOpaResult(r.data ?? r);
      toast.success('Bundle ready');
    } catch (e: any) {
      toast.error(e.message || 'Bundle failed');
    } finally {
      setOpaLoading(false);
    }
  };

  const runSimulate = async () => {
    setOpaLoading(true);
    try {
      const r = await aiServicesAPI.secOpaSimulate();
      if (!r.success) throw new Error(r.error || 'Failed');
      setOpaResult(r.data ?? r);
      toast.success('Simulation done');
    } catch (e: any) {
      toast.error(e.message || 'Simulation failed');
    } finally {
      setOpaLoading(false);
    }
  };

  const runAllowlist = async () => {
    setOpaLoading(true);
    try {
      const r = await aiServicesAPI.secAllowlistEnforce(scope);
      if (!r.success) throw new Error(r.error || 'Failed');
      setOpaResult(r.data ?? r);
      toast.success('Allow-list enforced');
    } catch (e: any) {
      toast.error(e.message || 'Allow-list failed');
    } finally {
      setOpaLoading(false);
    }
  };

  const runAudStart = async () => {
    setAudLoading(true);
    try {
      const r = await aiServicesAPI.secAuditorSessionStart();
      if (!r.success) throw new Error(r.error || 'Failed');
      setAudResult(r.data ?? r);
      const sid = (r.data as any)?.result?.session_id || (r as any)?.result?.session_id || '';
      if (sid) setSessionId(sid);
      toast.success('Auditor session started');
    } catch (e: any) {
      toast.error(e.message || 'Start failed');
    } finally {
      setAudLoading(false);
    }
  };

  const runAudEnd = async () => {
    if (!sessionId) { toast.error('Set session id'); return; }
    setAudLoading(true);
    try {
      const r = await aiServicesAPI.secAuditorSessionEnd(sessionId);
      if (!r.success) throw new Error(r.error || 'Failed');
      setAudResult(r.data ?? r);
      toast.success('Auditor session ended');
    } catch (e: any) {
      toast.error(e.message || 'End failed');
    } finally {
      setAudLoading(false);
    }
  };

  const runTrail = async () => {
    setAudLoading(true);
    try {
      const r = await aiServicesAPI.secAuditorTrailExport();
      if (!r.success) throw new Error(r.error || 'Failed');
      setAudResult(r.data ?? r);
      toast.success('Trail exported');
    } catch (e: any) {
      toast.error(e.message || 'Export failed');
    } finally {
      setAudLoading(false);
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
                <BreadcrumbPage>Security & Compliance</BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
          <h1 className="text-3xl font-bold mt-2">Security & Compliance</h1>
          <p className="text-muted-foreground">Supply chain, SBOMs, data classification, OPA, and auditor mode</p>
        </div>
      </div>

      <Tabs defaultValue="supply" className="w-full">
        <TabsList>
          <TabsTrigger value="supply" className="gap-2"><ShieldCheck className="h-4 w-4" /> Supply Chain</TabsTrigger>
          <TabsTrigger value="sbom" className="gap-2"><PackageSearch className="h-4 w-4" /> SBOM</TabsTrigger>
          <TabsTrigger value="data" className="gap-2"><KeyRound className="h-4 w-4" /> Data</TabsTrigger>
          <TabsTrigger value="opa" className="gap-2"><Scale className="h-4 w-4" /> OPA</TabsTrigger>
          <TabsTrigger value="auditor" className="gap-2"><ScrollText className="h-4 w-4" /> Auditor</TabsTrigger>
        </TabsList>

        <TabsContent value="supply" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Supply Chain Security</CardTitle>
              <CardDescription>Cosign signing/verification, SLSA provenance, digest pinning</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid md:grid-cols-3 gap-4">
                <div>
                  <Label>Image</Label>
                  <Input value={image} onChange={(e) => setImage(e.target.value)} />
                </div>
              </div>
              <div className="flex gap-2">
                <Button onClick={runSign} disabled={scLoading}>{scLoading ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Play className="h-4 w-4 mr-2" />}Sign</Button>
                <Button onClick={runVerify} variant="outline" disabled={scLoading}>Verify</Button>
                <Button onClick={runProvenance} variant="outline" disabled={scLoading}>Provenance</Button>
              </div>
              {scResult && <pre className="mt-2 p-3 bg-muted rounded-md overflow-auto text-sm">{pretty(scResult)}</pre>}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="sbom" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>SBOM Management</CardTitle>
              <CardDescription>Generate SBOMs and correlate scans, track license drift</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <Label>Image (optional)</Label>
                  <Input value={sbImage} onChange={(e) => setSbImage(e.target.value)} />
                </div>
              </div>
              <div className="flex gap-2">
                <Button onClick={runSbom} disabled={sbLoading}>{sbLoading ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Play className="h-4 w-4 mr-2" />}Generate</Button>
                <Button onClick={runScanCorrelate} variant="outline" disabled={sbLoading}>Scan Correlate</Button>
              </div>
              {sbResult && <pre className="mt-2 p-3 bg-muted rounded-md overflow-auto text-sm">{pretty(sbResult)}</pre>}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="data" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Data Classification</CardTitle>
              <CardDescription>PII/secret detection and residency enforcement</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid md:grid-cols-3 gap-4">
                <div>
                  <Label>Source</Label>
                  <Input value={source} onChange={(e) => setSource(e.target.value)} />
                </div>
                <div>
                  <Label>Scope</Label>
                  <Input value={scope} onChange={(e) => setScope(e.target.value)} />
                </div>
              </div>
              <div className="flex gap-2">
                <Button onClick={runPII} disabled={dcLoading}>{dcLoading ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Play className="h-4 w-4 mr-2" />}PII</Button>
                <Button onClick={runSecrets} variant="outline" disabled={dcLoading}>Secrets</Button>
                <Button onClick={runResidency} variant="outline" disabled={dcLoading}>Residency</Button>
              </div>
              {dcResult && <pre className="mt-2 p-3 bg-muted rounded-md overflow-auto text-sm">{pretty(dcResult)}</pre>}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="opa" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>OPA Enforcer</CardTitle>
              <CardDescription>Bundle/publish policies, simulate impacts, enforce allow-lists</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <Label>Target</Label>
                  <Input value={target} onChange={(e) => setTarget(e.target.value)} />
                </div>
                <div>
                  <Label>Scope</Label>
                  <Input value={scope} onChange={(e) => setScope(e.target.value)} />
                </div>
              </div>
              <div className="flex gap-2">
                <Button onClick={runBundle} disabled={opaLoading}>{opaLoading ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Play className="h-4 w-4 mr-2" />}Bundle</Button>
                <Button onClick={runSimulate} variant="outline" disabled={opaLoading}>Simulate</Button>
                <Button onClick={runAllowlist} variant="outline" disabled={opaLoading}>Enforce</Button>
              </div>
              {opaResult && <pre className="mt-2 p-3 bg-muted rounded-md overflow-auto text-sm">{pretty(opaResult)}</pre>}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="auditor" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Auditor Mode</CardTitle>
              <CardDescription>Time-boxed read-only access with exportable trails</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <Label>Session ID</Label>
                  <Input value={sessionId} onChange={(e) => setSessionId(e.target.value)} />
                </div>
              </div>
              <div className="flex gap-2">
                <Button onClick={runAudStart} disabled={audLoading}>{audLoading ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Play className="h-4 w-4 mr-2" />}Start</Button>
                <Button onClick={runAudEnd} variant="outline" disabled={audLoading}>End</Button>
                <Button onClick={runTrail} variant="outline" disabled={audLoading}>Export Trail</Button>
              </div>
              {audResult && <pre className="mt-2 p-3 bg-muted rounded-md overflow-auto text-sm">{pretty(audResult)}</pre>}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default SecurityComplianceCenter;


