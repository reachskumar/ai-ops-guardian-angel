
import React, { useEffect, useState } from 'react';
import { CloudProvider } from '@/services/cloudProviderService';
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter
} from '@/components/ui/dialog';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage
} from '@/components/ui/form';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Loader2 } from 'lucide-react';

// Define the form schema with Zod
const formSchema = z.object({
  provider: z.enum(['aws', 'azure', 'gcp'] as const),
  name: z.string().min(3, "Name must be at least 3 characters"),
  credentials: z.record(z.string())
});

interface ConnectProviderDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConnectProvider: (data: z.infer<typeof formSchema>) => Promise<void>;
  connecting: boolean;
}

const ConnectProviderDialog: React.FC<ConnectProviderDialogProps> = ({
  open,
  onOpenChange,
  onConnectProvider,
  connecting
}) => {
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      provider: 'aws',
      name: '',
      credentials: {}
    }
  });

  // Reset the form when the provider changes
  const watchProvider = form.watch('provider');
  useEffect(() => {
    form.setValue('credentials', {});
  }, [watchProvider, form]);

  // Get credential fields based on the selected provider
  const getCredentialFields = (provider: CloudProvider) => {
    switch (provider) {
      case 'aws':
        return [
          { name: 'accessKeyId', label: 'Access Key ID', type: 'text' },
          { name: 'secretAccessKey', label: 'Secret Access Key', type: 'password' }
        ];
      case 'azure':
        return [
          { name: 'tenantId', label: 'Tenant ID', type: 'text' },
          { name: 'clientId', label: 'Client ID', type: 'text' },
          { name: 'clientSecret', label: 'Client Secret', type: 'password' }
        ];
      case 'gcp':
        return [
          { name: 'projectId', label: 'GCP Project ID', type: 'text' },
          { name: 'serviceAccountKey', label: 'Service Account Key (JSON)', type: 'textarea' }
        ];
      default:
        return [];
    }
  };

  const handleSubmit = (values: z.infer<typeof formSchema>) => {
    console.log('Form submitted with values:', values);
    onConnectProvider(values);
  };

  const updateCredentialField = (name: string, value: string) => {
    const currentCreds = form.getValues('credentials');
    form.setValue('credentials', {
      ...currentCreds,
      [name]: value
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Connect Cloud Provider</DialogTitle>
          <DialogDescription>
            Enter your cloud provider credentials to connect your account.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Account Name</FormLabel>
                  <FormControl>
                    <Input placeholder="My Production AWS" {...field} />
                  </FormControl>
                  <FormDescription>
                    A friendly name to identify this account
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="provider"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Cloud Provider</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a cloud provider" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="aws">Amazon Web Services (AWS)</SelectItem>
                      <SelectItem value="azure">Microsoft Azure</SelectItem>
                      <SelectItem value="gcp">Google Cloud Platform (GCP)</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormDescription>
                    Select your cloud service provider
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Dynamic credential fields based on the selected provider */}
            {getCredentialFields(form.getValues('provider')).map((field) => (
              <FormItem key={field.name}>
                <FormLabel>{field.label}</FormLabel>
                <FormControl>
                  {field.type === 'textarea' ? (
                    <Textarea 
                      placeholder={field.label}
                      className="min-h-[100px]"
                      value={form.getValues('credentials')[field.name] || ''}
                      onChange={(e) => updateCredentialField(field.name, e.target.value)}
                    />
                  ) : (
                    <Input 
                      type={field.type}
                      placeholder={field.label}
                      value={form.getValues('credentials')[field.name] || ''}
                      onChange={(e) => updateCredentialField(field.name, e.target.value)}
                    />
                  )}
                </FormControl>
                <FormMessage />
              </FormItem>
            ))}

            <DialogFooter>
              <Button 
                type="submit" 
                disabled={connecting}
                className="w-full sm:w-auto"
              >
                {connecting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Connect Provider
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};

export default ConnectProviderDialog;
