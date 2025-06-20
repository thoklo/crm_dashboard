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
import { saleFormSchema, type SaleFormValues } from "@/lib/schemas";
import { DialogFooter } from "./ui/dialog";
import { ReactNode } from "react";

interface SaleFormProps {
  defaultValues?: Partial<SaleFormValues>;
  onSubmit: (data: SaleFormValues) => void;
  onCancel: () => void;
  readOnly?: boolean;
  footerButtons?: ReactNode;
}

export function SaleForm({
  defaultValues,
  onSubmit,
  onCancel,
  readOnly = false,
  footerButtons,
}: SaleFormProps) {
  const defaultFormValues = React.useMemo<SaleFormValues>(
    () => ({
      customer: "",
      product: "",
      amount: 0,
      status: defaultValues?.status || "Pending",
      category: defaultValues?.category || "",
      date: defaultValues?.date || new Date(),
    }),
    [defaultValues]
  );

  const form = useForm<SaleFormValues>({
    resolver: zodResolver(saleFormSchema),
    defaultValues: defaultValues || defaultFormValues,
  });

  React.useEffect(() => {
    if (defaultValues) {
      form.reset({
        ...defaultValues,
      });
    } else {
      form.reset({
        ...defaultFormValues,
      });
    }
  }, [defaultValues, form, defaultFormValues]);

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="customer"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Customer</FormLabel>
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
          name="product"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Product</FormLabel>
              <FormControl>
                <Input
                  placeholder="Product name"
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
          name="amount"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Amount</FormLabel>
              <FormControl>
                <Input
                  type="text"
                  placeholder="$0.00"
                  {...field}
                  onChange={(e) => {
                    // Remove any non-digit characters except decimal point
                    const value = e.target.value.replace(/[^\d.]/g, "");
                    field.onChange(Number(value));
                  }}
                  disabled={readOnly}
                  value={
                    field.value
                      ? field.value.toLocaleString("en-US", {
                          style: "currency",
                          currency: "USD",
                          minimumFractionDigits: 2,
                        })
                      : ""
                  }
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
                    <SelectItem value="Completed">Completed</SelectItem>
                    <SelectItem value="Pending">Pending</SelectItem>
                    <SelectItem value="Cancelled">Cancelled</SelectItem>
                  </SelectContent>
                </Select>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="category"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Category</FormLabel>
              <FormControl>
                <Select
                  onValueChange={field.onChange}
                  disabled={readOnly}
                  value={field.value}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent className="bg-white dark:bg-zinc-900">
                    <SelectItem value="Software">Software</SelectItem>
                    <SelectItem value="Hardware">Hardware</SelectItem>
                    <SelectItem value="Consulting">Consulting</SelectItem>
                    <SelectItem value="Subscription">Subscription</SelectItem>
                    <SelectItem value="Support">Support</SelectItem>
                    <SelectItem value="Training">Training</SelectItem>
                  </SelectContent>
                </Select>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="date"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Date</FormLabel>
              <FormControl>
                <Input
                  type="date"
                  className="w-48"
                  {...field}
                  disabled={readOnly}
                  value={
                    field.value ? field.value.toISOString().split("T")[0] : ""
                  }
                  onChange={(e) => {
                    field.onChange(new Date(e.target.value));
                  }}
                />
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
                {defaultValues ? "Update Sale" : "Log Sale"}
              </Button>
            )}
          </div>
        </DialogFooter>
      </form>
    </Form>
  );
}
