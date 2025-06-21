
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardContent, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { AlertTriangle, CheckCircle, XCircle, Loader2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

const EdgeFunctionDebugger: React.FC = () => {
  const [testing, setTesting] = useState(false);
  const [results, setResults] = useState<any>(null);

  const testEdgeFunction = async () => {
    setTesting(true);
    setResults(null);

    try {
      console.log("Testing edge function connectivity...");
      
      // Test with minimal payload
      const testPayload = {
        provider: 'aws',
        credentials: {
          accessKeyId: 'TEST_ACCESS_KEY_ID_12345',
          secretAccessKey: 'TEST_SECRET_KEY_1234567890123456789012345'
        }
      };

      const startTime = Date.now();
      
      const { data, error } = await supabase.functions.invoke('test-connectivity', {
        body: testPayload
      });
      
      const endTime = Date.now();
      const duration = endTime - startTime;

      setResults({
        success: !error && data,
        data,
        error,
        duration,
        timestamp: new Date().toISOString()
      });

    } catch (err: any) {
      console.error("Edge function test error:", err);
      setResults({
        success: false,
        error: err.message,
        timestamp: new Date().toISOString()
      });
    } finally {
      setTesting(false);
    }
  };

  return (
    <Card className="mb-4">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="text-lg">Edge Function Debug</CardTitle>
        <Button 
          onClick={testEdgeFunction} 
          disabled={testing}
          variant="outline"
          size="sm"
        >
          {testing ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              Testing...
            </>
          ) : (
            'Test Edge Function'
          )}
        </Button>
      </CardHeader>
      <CardContent>
        {results && (
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              {results.success ? (
                <>
                  <CheckCircle className="h-5 w-5 text-green-600" />
                  <Badge variant="default" className="bg-green-100 text-green-800">
                    Success
                  </Badge>
                </>
              ) : (
                <>
                  <XCircle className="h-5 w-5 text-red-600" />
                  <Badge variant="destructive">
                    Failed
                  </Badge>
                </>
              )}
              {results.duration && (
                <Badge variant="outline">
                  {results.duration}ms
                </Badge>
              )}
            </div>

            {results.error && (
              <div className="bg-red-50 border border-red-200 rounded p-3">
                <div className="flex items-start gap-2">
                  <AlertTriangle className="h-4 w-4 text-red-600 mt-0.5" />
                  <div>
                    <div className="font-medium text-red-800">Error:</div>
                    <div className="text-red-700 text-sm">{results.error}</div>
                  </div>
                </div>
              </div>
            )}

            {results.data && (
              <div className="bg-green-50 border border-green-200 rounded p-3">
                <div className="font-medium text-green-800 mb-2">Response:</div>
                <pre className="text-xs text-green-700 overflow-auto">
                  {JSON.stringify(results.data, null, 2)}
                </pre>
              </div>
            )}

            <div className="text-xs text-muted-foreground">
              Tested at: {results.timestamp}
            </div>
          </div>
        )}

        {!results && !testing && (
          <div className="text-sm text-muted-foreground">
            Click "Test Edge Function" to check if the connectivity test function is working properly.
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default EdgeFunctionDebugger;
