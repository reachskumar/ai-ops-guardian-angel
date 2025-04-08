
import React from "react";
import { Button } from "@/components/ui/button";
import { RefreshCw } from "lucide-react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Form, FormControl, FormField, FormItem } from "@/components/ui/form";
import { useForm } from "react-hook-form";

interface ComplianceSelectorProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onScanStart: (standards: string[]) => void;
  isScanning: boolean;
}

const ComplianceSelector: React.FC<ComplianceSelectorProps> = ({
  open,
  onOpenChange,
  onScanStart,
  isScanning
}) => {
  const form = useForm({
    defaultValues: {
      complianceStandards: ["PCI DSS"]
    }
  });

  const handleScanStart = (data: { complianceStandards: string[] }) => {
    onScanStart(data.complianceStandards);
  };

  return (
    <Popover open={open} onOpenChange={onOpenChange}>
      <PopoverTrigger asChild>
        <Button size="sm" variant="outline" className="h-8 gap-1">
          <RefreshCw className={`h-4 w-4 ${isScanning ? "animate-spin" : ""}`} />
          Scan Now
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleScanStart)} className="space-y-4">
            <div className="space-y-2">
              <h4 className="font-medium">Select Compliance Standards</h4>
              <p className="text-sm text-muted-foreground">Choose which standards to include in the scan</p>
            </div>
            <FormField
              control={form.control}
              name="complianceStandards"
              render={({ field }) => (
                <FormItem>
                  <FormControl>
                    <RadioGroup 
                      onValueChange={(value) => field.onChange([value])}
                      value={field.value[0]}
                      className="flex flex-col space-y-1"
                    >
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="PCI DSS" id="pci" />
                        <Label htmlFor="pci">PCI DSS</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="HIPAA" id="hipaa" />
                        <Label htmlFor="hipaa">HIPAA</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="NIST" id="nist" />
                        <Label htmlFor="nist">NIST</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="SOC 2" id="soc2" />
                        <Label htmlFor="soc2">SOC 2</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="All" id="all" />
                        <Label htmlFor="all">All Standards</Label>
                      </div>
                    </RadioGroup>
                  </FormControl>
                </FormItem>
              )}
            />
            <div className="flex justify-end">
              <Button type="submit" size="sm">
                Start Scan
              </Button>
            </div>
          </form>
        </Form>
      </PopoverContent>
    </Popover>
  );
};

export default ComplianceSelector;
