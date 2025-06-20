
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Copy, Download } from 'lucide-react';

interface TemplateOutputProps {
  generatedTemplate: string;
  templateName: string;
  onCopy: () => void;
  onDownload: () => void;
}

const TemplateOutput: React.FC<TemplateOutputProps> = ({
  generatedTemplate,
  templateName,
  onCopy,
  onDownload
}) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Generated Template</CardTitle>
        <div className="flex gap-2">
          <Button
            size="sm"
            variant="outline"
            onClick={onCopy}
            disabled={!generatedTemplate}
          >
            <Copy className="mr-2 h-4 w-4" />
            Copy
          </Button>
          <Button
            size="sm"
            variant="outline"
            onClick={onDownload}
            disabled={!generatedTemplate}
          >
            <Download className="mr-2 h-4 w-4" />
            Download
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <Textarea
          placeholder="Generated template will appear here..."
          value={generatedTemplate}
          readOnly
          className="min-h-[400px] font-mono text-sm"
        />
      </CardContent>
    </Card>
  );
};

export default TemplateOutput;
