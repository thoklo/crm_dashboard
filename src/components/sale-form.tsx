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

interface SaleFormProps {
  defaultValues?: Partial<SaleFormValues>;
  onSubmit: (data: SaleFormValues) => void;
  onCancel: () => void;
  readOnly?: boolean;
}

export function SaleForm({
  defaultValues,
  onSubmit,
  onCancel,
  readOnly,
}: SaleFormProps) {
  const defaultFormValues = React.useMemo<SaleFormValues>(
    () => ({
      customer: "",
      product: "",
      amount: 0,
      status: defaultValues?.status || "Pending",
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
                  <SelectContent>
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
        <DialogFooter className="gap-2 sm:gap-0">
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
        </DialogFooter>
      </form>
    </Form>
  );
}
