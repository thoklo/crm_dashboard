import * as React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { customerFormSchema, type CustomerFormValues } from "@/lib/schemas";
import { DialogFooter } from "./ui/dialog";
import { ReactNode } from "react";

interface CustomerFormProps {
  defaultValues?: CustomerFormValues;
  onSubmit: (data: CustomerFormValues) => void;
  onCancel: () => void;
  readOnly?: boolean;
  footerButtons?: ReactNode;
}

export function CustomerForm({
  defaultValues,
  onSubmit,
  onCancel,
  readOnly = false,
  footerButtons,
}: CustomerFormProps) {
  const defaultFormValues = React.useMemo<CustomerFormValues>(
    () => ({
      name: "",
      email: "",
      phone: "",
      company: "",
      status: defaultValues?.status || "Active",
    }),
    [defaultValues]
  );

  const form = useForm<CustomerFormValues>({
    resolver: zodResolver(customerFormSchema),
    defaultValues: defaultValues || defaultFormValues,
  });

  // Reset form when defaultValues change
  React.useEffect(() => {
    if (defaultValues) {
      form.reset({
        ...defaultFormValues,
        ...defaultValues,
      });
    } else {
      form.reset(defaultFormValues);
    }
  }, [defaultValues, form, defaultFormValues]);

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
                <Input
                  placeholder="Customer name"
                  {...field}
                  disabled={readOnly}
                  value={field.value || ""}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Email</FormLabel>{" "}
              <FormControl>
                <Input
                  type="email"
                  placeholder="customer@example.com"
                  {...field}
                  disabled={readOnly}
                  value={field.value || ""}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="phone"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Phone</FormLabel>{" "}
              <FormControl>
                <Input
                  placeholder="+1 (555) 123-4567"
                  {...field}
                  disabled={readOnly}
                  value={field.value || ""}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="company"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Company</FormLabel>{" "}
              <FormControl>
                <Input
                  placeholder="Company name"
                  {...field}
                  disabled={readOnly}
                  value={field.value || ""}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="status"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Status</FormLabel>
              <FormControl>
                <Select
                  onValueChange={field.onChange}
                  disabled={readOnly}
                  value={field.value}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent className="bg-white dark:bg-zinc-900">
                    <SelectItem value="Active">Active</SelectItem>
                    <SelectItem value="Inactive">Inactive</SelectItem>
                    <SelectItem value="Pending">Pending</SelectItem>
                  </SelectContent>
                </Select>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <DialogFooter className="flex-col gap-4">
          {footerButtons}
          <div className="flex justify-end gap-2 w-full">
            <Button type="button" variant="outline" onClick={onCancel}>
              {readOnly ? "Close" : "Cancel"}
            </Button>
            {!readOnly && (
              <Button
                type="submit"
                className="bg-blue-600 hover:bg-blue-700 text-white font-semibold shadow-lg transition-colors duration-200 px-6 py-2 rounded-md border-none focus-visible:ring-2 focus-visible:ring-blue-400 focus-visible:ring-offset-2"
              >
                {defaultValues ? "Update Customer" : "Add Customer"}
              </Button>
            )}
          </div>
        </DialogFooter>
      </form>
    </Form>
  );
}
