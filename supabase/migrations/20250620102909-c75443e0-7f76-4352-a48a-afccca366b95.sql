
-- Create table for alert rules
CREATE TABLE IF NOT EXISTS public.alert_rules (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  resource_type TEXT NOT NULL,
  metric TEXT NOT NULL,
  operator TEXT NOT NULL CHECK (operator IN ('gt', 'lt', 'eq')),
  threshold NUMERIC NOT NULL,
  duration INTEGER NOT NULL DEFAULT 300,
  severity TEXT NOT NULL CHECK (severity IN ('low', 'medium', 'high', 'critical')),
  enabled BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create table for alerts
CREATE TABLE IF NOT EXISTS public.alerts (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  rule_id UUID NOT NULL REFERENCES public.alert_rules(id) ON DELETE CASCADE,
  resource_id UUID REFERENCES public.cloud_resources(id) ON DELETE CASCADE,
  message TEXT NOT NULL,
  severity TEXT NOT NULL CHECK (severity IN ('low', 'medium', 'high', 'critical')),
  status TEXT NOT NULL CHECK (status IN ('active', 'resolved', 'acknowledged')) DEFAULT 'active',
  triggered_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  resolved_at TIMESTAMP WITH TIME ZONE,
  acknowledged_at TIMESTAMP WITH TIME ZONE,
  acknowledged_by UUID REFERENCES auth.users(id)
);

-- Enable RLS on alert_rules table
ALTER TABLE public.alert_rules ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for alert_rules
CREATE POLICY "Users can view their own alert rules" 
  ON public.alert_rules 
  FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own alert rules" 
  ON public.alert_rules 
  FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own alert rules" 
  ON public.alert_rules 
  FOR UPDATE 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own alert rules" 
  ON public.alert_rules 
  FOR DELETE 
  USING (auth.uid() = user_id);

-- Enable RLS on alerts table
ALTER TABLE public.alerts ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for alerts
CREATE POLICY "Users can view alerts for their resources" 
  ON public.alerts 
  FOR SELECT 
  USING (
    rule_id IN (
      SELECT id FROM public.alert_rules 
      WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Users can create alerts for their resources" 
  ON public.alerts 
  FOR INSERT 
  WITH CHECK (
    rule_id IN (
      SELECT id FROM public.alert_rules 
      WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update alerts for their resources" 
  ON public.alerts 
  FOR UPDATE 
  USING (
    rule_id IN (
      SELECT id FROM public.alert_rules 
      WHERE user_id = auth.uid()
    )
  );

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_alert_rules_user_id ON public.alert_rules(user_id);
CREATE INDEX IF NOT EXISTS idx_alert_rules_enabled ON public.alert_rules(enabled);
CREATE INDEX IF NOT EXISTS idx_alerts_rule_id ON public.alerts(rule_id);
CREATE INDEX IF NOT EXISTS idx_alerts_status ON public.alerts(status);
CREATE INDEX IF NOT EXISTS idx_alerts_triggered_at ON public.alerts(triggered_at);
