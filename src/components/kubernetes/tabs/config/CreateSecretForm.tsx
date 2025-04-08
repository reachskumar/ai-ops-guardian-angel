
import React from "react";
import { useForm } from "react-hook-form";
import { Lock } from "lucide-react";
import {
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";

const secretSchema = z.object({
  name: z.string().min(1, { message: "Name is required" }),
  namespace: z.string().min(1, { message: "Namespace is required" }),
  type: z.string().min(1, { message: "Type is required" }),
  data: z.string().min(1, { message: "At least one key-value pair is required" }),
});

type SecretFormValues = z.infer<typeof secretSchema>;

interface CreateSecretFormProps {
  onSubmit: (data: SecretFormValues) => void;
  onCancel: () => void;
}

const CreateSecretForm: React.FC<CreateSecretFormProps> = ({
  onSubmit,
  onCancel,
}) => {
  const form = useForm<SecretFormValues>({
    resolver: zodResolver(secretSchema),
    defaultValues: {
      name: "",
      namespace: "default",
      type: "Opaque",
      data: "# Enter key-value pairs, one per line\n# Values will be base64 encoded\n# Example: key=value",
    },
  });

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Name</FormLabel>
              <FormControl>
                <Input placeholder="my-secret" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="namespace"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Namespace</FormLabel>
              <FormControl>
                <Input placeholder="default" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="type"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Type</FormLabel>
              <Select
                onValueChange={field.onChange}
                defaultValue={field.value}
              >
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a type" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="Opaque">Opaque</SelectItem>
                  <SelectItem value="kubernetes.io/tls">TLS</SelectItem>
                  <SelectItem value="kubernetes.io/dockerconfigjson">Docker Registry</SelectItem>
                  <SelectItem value="kubernetes.io/service-account-token">Service Account Token</SelectItem>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="data"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Secret Data</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="key1=value1&#10;key2=value2"
                  className="h-40 font-mono text-sm"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="flex justify-end space-x-2 pt-4">
          <Button variant="outline" onClick={onCancel} type="button">
            Cancel
          </Button>
          <Button type="submit">
            <Lock className="mr-2 h-4 w-4" />
            Create Secret
          </Button>
        </div>
      </form>
    </Form>
  );
};

export default CreateSecretForm;
