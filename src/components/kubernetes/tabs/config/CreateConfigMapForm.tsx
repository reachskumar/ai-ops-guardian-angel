
import React from "react";
import { useForm } from "react-hook-form";
import { FileText } from "lucide-react";
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
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";

const configMapSchema = z.object({
  name: z.string().min(1, { message: "Name is required" }),
  namespace: z.string().min(1, { message: "Namespace is required" }),
  data: z.string().min(1, { message: "At least one key-value pair is required" }),
});

type ConfigMapFormValues = z.infer<typeof configMapSchema>;

interface CreateConfigMapFormProps {
  onSubmit: (data: ConfigMapFormValues) => void;
  onCancel: () => void;
}

const CreateConfigMapForm: React.FC<CreateConfigMapFormProps> = ({
  onSubmit,
  onCancel,
}) => {
  const form = useForm<ConfigMapFormValues>({
    resolver: zodResolver(configMapSchema),
    defaultValues: {
      name: "",
      namespace: "default",
      data: "# Enter key-value pairs, one per line\n# Example: key=value",
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
                <Input placeholder="my-config-map" {...field} />
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
          name="data"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Config Map Data</FormLabel>
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
            <FileText className="mr-2 h-4 w-4" />
            Create Config Map
          </Button>
        </div>
      </form>
    </Form>
  );
};

export default CreateConfigMapForm;
