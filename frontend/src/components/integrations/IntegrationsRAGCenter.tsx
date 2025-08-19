import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { Store, Link2, Activity, Book, RefreshCw, Loader2, Play } from 'lucide-react';
import { Breadcrumb, BreadcrumbList, BreadcrumbItem, BreadcrumbLink, BreadcrumbSeparator, BreadcrumbPage } from '../ui/breadcrumb';
import aiServicesAPI from '../../lib/api';
import { toast } from 'sonner';

const pretty = (v: any) => JSON.stringify(v, null, 2);

const IntegrationsRAGCenter: React.FC = () => {
  // Installer/OAuth
  const [provider, setProvider] = useState('github');
  const [configJson, setConfigJson] = useState('{"repo":"org/app"}');
  const [instLoading, setInstLoading] = useState(false);
  const [instResult, setInstResult] = useState<any>(null);

  // Webhook normalize
  const [whProvider, setWhProvider] = useState('github');
  const [whEvent, setWhEvent] = useState('{"action":"opened","title":"Bug"}');
  const [whLoading, setWhLoading] = useState(false);
  const [whResult, setWhResult] = useState<any>(null);

  // Knowledge ops
  const [sources, setSources] = useState('runbooks,confluence://space/page,git://repo/docs');
  const [collection, setCollection] = useState('ai_ops_knowledge');
  const [ragLoading, setRagLoading] = useState(false);
  const [ragResult, setRagResult] = useState<any>(null);

  const runInstall = async () => {
    setInstLoading(true);
    try {
      let cfg: any = {};
      try { cfg = JSON.parse(configJson || '{}'); } catch (e: any) { toast.error('Invalid config JSON'); setInstLoading(false); return; }
      const r = await aiServicesAPI.irInstall(provider, cfg);
      if (!r.success) throw new Error(r.error || 'Failed');
      setInstResult(r.data ?? r);
      toast.success('Installed');
    } catch (e: any) {
      toast.error(e.message || 'Install failed');
    } finally { setInstLoading(false); }
  };

  const runOAuth = async () => {
    setInstLoading(true);
    try {
      const r = await aiServicesAPI.irOAuthAuthorize(provider);
      if (!r.success) throw new Error(r.error || 'Failed');
      setInstResult(r.data ?? r);
      toast.success('OAuth authorized');
    } catch (e: any) {
      toast.error(e.message || 'OAuth failed');
    } finally { setInstLoading(false); }
  };

  const runConfigApply = async () => {
    setInstLoading(true);
    try {
      let cfg: any = {};
      try { cfg = JSON.parse(configJson || '{}'); } catch (e: any) { toast.error('Invalid config JSON'); setInstLoading(false); return; }
      const r = await aiServicesAPI.irConfigApply(provider, cfg);
      if (!r.success) throw new Error(r.error || 'Failed');
      setInstResult(r.data ?? r);
      toast.success('Config applied');
    } catch (e: any) {
      toast.error(e.message || 'Config failed');
    } finally { setInstLoading(false); }
  };

  const runHealth = async () => {
    setInstLoading(true);
    try {
      const r = await aiServicesAPI.irHealthCheck(provider);
      if (!r.success) throw new Error(r.error || 'Failed');
      setInstResult(r.data ?? r);
      toast.success('Health OK');
    } catch (e: any) {
      toast.error(e.message || 'Health failed');
    } finally { setInstLoading(false); }
  };

  const runNormalize = async () => {
    setWhLoading(true);
    try {
      let ev: any = {};
      try { ev = JSON.parse(whEvent || '{}'); } catch (e: any) { toast.error('Invalid event JSON'); setWhLoading(false); return; }
      const r = await aiServicesAPI.irWebhookNormalize(whProvider, ev);
      if (!r.success) throw new Error(r.error || 'Failed');
      setWhResult(r.data ?? r);
      toast.success('Normalized');
    } catch (e: any) {
      toast.error(e.message || 'Normalize failed');
    } finally { setWhLoading(false); }
  };

  const runIngest = async () => {
    setRagLoading(true);
    try {
      const list = sources.split(',').map(s => s.trim()).filter(Boolean);
      const r = await aiServicesAPI.irKnowledgeIngest(list, collection || undefined);
      if (!r.success) throw new Error(r.error || 'Failed');
      setRagResult(r.data ?? r);
      toast.success('Ingested');
    } catch (e: any) {
      toast.error(e.message || 'Ingest failed');
    } finally { setRagLoading(false); }
  };

  const runChunkEmbed = async () => {
    setRagLoading(true);
    try {
      const r = await aiServicesAPI.irKnowledgeChunkEmbed(collection || undefined);
      if (!r.success) throw new Error(r.error || 'Failed');
      setRagResult(r.data ?? r);
      toast.success('Embedded');
    } catch (e: any) {
      toast.error(e.message || 'Embed failed');
    } finally { setRagLoading(false); }
  };

  const runFreshScan = async () => {
    setRagLoading(true);
    try {
      const r = await aiServicesAPI.irFreshnessScan();
      if (!r.success) throw new Error(r.error || 'Failed');
      setRagResult(r.data ?? r);
      toast.success('Freshness scan complete');
    } catch (e: any) {
      toast.error(e.message || 'Freshness scan failed');
    } finally { setRagLoading(false); }
  };

  const runFreshPrioritize = async () => {
    setRagLoading(true);
    try {
      const r = await aiServicesAPI.irFreshnessPrioritize();
      if (!r.success) throw new Error(r.error || 'Failed');
      setRagResult(r.data ?? r);
      toast.success('Prioritization ready');
    } catch (e: any) {
      toast.error(e.message || 'Prioritization failed');
    } finally { setRagLoading(false); }
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
                <BreadcrumbPage>Integrations & RAG</BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
          <h1 className="text-3xl font-bold mt-2">Integrations & RAG</h1>
          <p className="text-muted-foreground">Marketplace installs, webhooks, knowledge ingestion and freshness</p>
        </div>
      </div>

      <Tabs defaultValue="installer" className="w-full">
        <TabsList>
          <TabsTrigger value="installer" className="gap-2"><Store className="h-4 w-4" /> Installer</TabsTrigger>
          <TabsTrigger value="webhook" className="gap-2"><Link2 className="h-4 w-4" /> Webhook</TabsTrigger>
          <TabsTrigger value="rag" className="gap-2"><Book className="h-4 w-4" /> Knowledge</TabsTrigger>
          <TabsTrigger value="fresh" className="gap-2"><RefreshCw className="h-4 w-4" /> Freshness</TabsTrigger>
        </TabsList>

        <TabsContent value="installer" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Integration Installer</CardTitle>
              <CardDescription>Install from marketplace, OAuth, apply config, health checks</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid md:grid-cols-3 gap-4">
                <div>
                  <Label>Provider</Label>
                  <Input value={provider} onChange={(e) => setProvider(e.target.value)} />
                </div>
                <div className="md:col-span-2">
                  <Label>Config (JSON)</Label>
                  <Input value={configJson} onChange={(e) => setConfigJson(e.target.value)} />
                </div>
              </div>
              <div className="flex gap-2">
                <Button onClick={runInstall} disabled={instLoading}>{instLoading ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Play className="h-4 w-4 mr-2" />}Install</Button>
                <Button onClick={runOAuth} variant="outline" disabled={instLoading}>OAuth</Button>
                <Button onClick={runConfigApply} variant="outline" disabled={instLoading}>Apply Config</Button>
                <Button onClick={runHealth} variant="outline" disabled={instLoading}>Health</Button>
              </div>
              {instResult && <pre className="mt-2 p-3 bg-muted rounded-md overflow-auto text-sm">{pretty(instResult)}</pre>}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="webhook" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Webhook Normalizer</CardTitle>
              <CardDescription>Normalize events from Prometheus, Datadog, Jira, GitHub, etc.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <Label>Provider</Label>
                  <Input value={whProvider} onChange={(e) => setWhProvider(e.target.value)} />
                </div>
                <div>
                  <Label>Event (JSON)</Label>
                  <Input value={whEvent} onChange={(e) => setWhEvent(e.target.value)} />
                </div>
              </div>
              <div className="flex gap-2">
                <Button onClick={runNormalize} disabled={whLoading}>{whLoading ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Play className="h-4 w-4 mr-2" />}Normalize</Button>
              </div>
              {whResult && <pre className="mt-2 p-3 bg-muted rounded-md overflow-auto text-sm">{pretty(whResult)}</pre>}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="rag" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Knowledge Ingestion</CardTitle>
              <CardDescription>Pull sources, chunk, embed with lineage</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <Label>Sources (comma separated)</Label>
                  <Input value={sources} onChange={(e) => setSources(e.target.value)} />
                </div>
                <div>
                  <Label>Collection</Label>
                  <Input value={collection} onChange={(e) => setCollection(e.target.value)} />
                </div>
              </div>
              <div className="flex gap-2">
                <Button onClick={runIngest} disabled={ragLoading}>{ragLoading ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Play className="h-4 w-4 mr-2" />}Ingest</Button>
                <Button onClick={runChunkEmbed} variant="outline" disabled={ragLoading}>Chunk+Embed</Button>
              </div>
              {ragResult && <pre className="mt-2 p-3 bg-muted rounded-md overflow-auto text-sm">{pretty(ragResult)}</pre>}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="fresh" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Freshness Guardian</CardTitle>
              <CardDescription>Detect stale knowledge and prioritize re-ingestion</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex gap-2">
                <Button onClick={runFreshScan} disabled={ragLoading}>{ragLoading ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Play className="h-4 w-4 mr-2" />}Scan</Button>
                <Button onClick={runFreshPrioritize} variant="outline" disabled={ragLoading}>Prioritize</Button>
              </div>
              {ragResult && <pre className="mt-2 p-3 bg-muted rounded-md overflow-auto text-sm">{pretty(ragResult)}</pre>}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default IntegrationsRAGCenter;
