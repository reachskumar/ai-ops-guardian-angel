import React, { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import aiServicesAPI from '../../lib/api';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface CutoverStepForm {
  name: string;
  resource_id: string;
  action: string;
  parametersText: string; // JSON text
  health_check_url?: string;
}

const defaultStep = (): CutoverStepForm => ({
  name: '',
  resource_id: '',
  action: 'dns_weighted_update',
  parametersText: '{\n  "domain": "example.com",\n  "records": [],\n  "weights": []\n}',
});

const CutoverPlannerModal: React.FC = () => {
  const { user } = useAuth();
  const [open, setOpen] = useState(false);
  const [name, setName] = useState('Blue-Green Cutover');
  const [strategy, setStrategy] = useState('blue_green');
  const [sourceEnv, setSourceEnv] = useState('blue');
  const [targetEnv, setTargetEnv] = useState('green');
  const [steps, setSteps] = useState<CutoverStepForm[]>([defaultStep()]);
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState<any | null>(null);

  const addStep = () => setSteps(prev => [...prev, defaultStep()]);
  const removeStep = (idx: number) => setSteps(prev => prev.filter((_, i) => i !== idx));
  const updateStep = (idx: number, patch: Partial<CutoverStepForm>) => {
    setSteps(prev => prev.map((s, i) => (i === idx ? { ...s, ...patch } : s)));
  };

  const onSubmit = async () => {
    if (!user?.tenantId) return;
    setSubmitting(true);
    setResult(null);
    try {
      const parsedSteps = steps.map((s) => {
        let params: any = {};
        try { params = JSON.parse(s.parametersText || '{}'); } catch {}
        return {
          name: s.name || s.action,
          description: s.name || s.action,
          resource_id: s.resource_id,
          action: s.action,
          parameters: params,
          health_check_url: s.health_check_url || undefined,
        };
      });
      const resp = await aiServicesAPI.cutoverExecute({
        tenant_id: user.tenantId,
        name,
        strategy,
        source_env: sourceEnv,
        target_env: targetEnv,
        steps: parsedSteps,
      });
      setResult(resp.data || resp);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="default">Plan Safe Cutover</Button>
      </DialogTrigger>
      <DialogContent className="max-w-3xl">
        <DialogHeader>
          <DialogTitle>Safe Cutover Planner</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label className="mb-1 block">Name</Label>
              <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="Cutover name" />
            </div>
            <div>
              <Label className="mb-1 block">Strategy</Label>
              <Select value={strategy} onValueChange={setStrategy}>
                <SelectTrigger><SelectValue placeholder="Select strategy" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="blue_green">Blue/Green</SelectItem>
                  <SelectItem value="weighted">Weighted</SelectItem>
                  <SelectItem value="canary">Canary</SelectItem>
                  <SelectItem value="batched">Batched</SelectItem>
                  <SelectItem value="instant">Instant</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label className="mb-1 block">Source Env</Label>
              <Input value={sourceEnv} onChange={(e) => setSourceEnv(e.target.value)} />
            </div>
            <div>
              <Label className="mb-1 block">Target Env</Label>
              <Input value={targetEnv} onChange={(e) => setTargetEnv(e.target.value)} />
            </div>
          </div>

          <div className="space-y-2">
            <div className="font-medium">Steps</div>
            {steps.map((s, idx) => (
              <div key={idx} className="p-3 border rounded-md space-y-2">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  <div>
                    <Label className="mb-1 block">Name</Label>
                    <Input value={s.name} onChange={(e) => updateStep(idx, { name: e.target.value })} placeholder="Step name" />
                  </div>
                  <div>
                    <Label className="mb-1 block">Resource ID</Label>
                    <Input value={s.resource_id} onChange={(e) => updateStep(idx, { resource_id: e.target.value })} placeholder="resource-123" />
                  </div>
                  <div>
                    <Label className="mb-1 block">Action</Label>
                    <Select value={s.action} onValueChange={(v) => updateStep(idx, { action: v })}>
                      <SelectTrigger><SelectValue placeholder="Select action" /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="dns_weighted_update">DNS Weighted Update</SelectItem>
                        <SelectItem value="dns_batch_update">DNS Batch Update</SelectItem>
                        <SelectItem value="dns_health_check">DNS Health Check</SelectItem>
                        <SelectItem value="lb_weighted_update">LB Weighted Update</SelectItem>
                        <SelectItem value="lb_batch_update">LB Batch Update</SelectItem>
                        <SelectItem value="lb_health_check">LB Health Check</SelectItem>
                        <SelectItem value="weight_traffic_shift">Traffic Shift</SelectItem>
                        <SelectItem value="batch_target_update">Batch Target Update</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div>
                  <Label className="mb-1 block">Parameters (JSON)</Label>
                  <Textarea rows={5} value={s.parametersText} onChange={(e) => updateStep(idx, { parametersText: e.target.value })} />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div>
                    <Label className="mb-1 block">Health Check URL (optional)</Label>
                    <Input value={s.health_check_url || ''} onChange={(e) => updateStep(idx, { health_check_url: e.target.value })} />
                  </div>
                  <div className="flex items-end justify-end">
                    <Button variant="outline" onClick={() => removeStep(idx)}>Remove Step</Button>
                  </div>
                </div>
              </div>
            ))}
            <Button variant="secondary" onClick={addStep}>Add Step</Button>
          </div>

          {result && (
            <div className="p-3 bg-secondary/40 rounded-md">
              <div className="font-medium mb-2">Result</div>
              <pre className="text-xs whitespace-pre-wrap">{JSON.stringify(result, null, 2)}</pre>
            </div>
          )}
        </div>
        <DialogFooter>
          <Button onClick={onSubmit} disabled={submitting || !user?.tenantId}>
            {submitting ? 'Submitting…' : 'Execute Cutover'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default CutoverPlannerModal;


