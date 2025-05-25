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
import { taskFormSchema, type TaskFormValues } from "@/lib/schemas";

interface TaskFormProps {
  defaultValues?: Partial<TaskFormValues>;
  onSubmit: (data: TaskFormValues) => void;
  onCancel: () => void;
  readOnly?: boolean;
  footerButtons?: React.ReactNode;
}

const STATUS_OPTIONS = [
  "To Do",
  "In Progress",
  "Completed",
  "Blocked",
] as const;
const PRIORITY_OPTIONS = ["Low", "Medium", "High", "Critical"] as const;

export function TaskForm({
  defaultValues,
  onSubmit,
  onCancel,
  readOnly = false,
  footerButtons,
}: TaskFormProps) {
  const defaultFormValues = React.useMemo<TaskFormValues>(
    () => ({
      title: "",
      description: "",
      assignedTo: "",
      status: defaultValues?.status || "To Do",
      priority: defaultValues?.priority || "Medium",
      dueDate: new Date().toISOString().split("T")[0],
    }),
    [defaultValues]
  );

  const form = useForm<TaskFormValues>({
    resolver: zodResolver(taskFormSchema),
    defaultValues: defaultValues || defaultFormValues,
  });

  React.useEffect(() => {
    const newValues = defaultValues
      ? { ...defaultFormValues, ...defaultValues }
      : defaultFormValues;
    form.reset(newValues);
  }, [defaultValues, defaultFormValues, form]);

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="title"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Title</FormLabel>
              <FormControl>
                <Input
                  placeholder="Task title"
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
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Description</FormLabel>
              <FormControl>
                <Input
                  placeholder="Task description"
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
          name="assignedTo"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Assigned To</FormLabel>
              <FormControl>
                <Input
                  placeholder="Team member name"
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
              <Select
                onValueChange={field.onChange}
                disabled={readOnly}
                value={field.value}
              >
                <SelectTrigger className="w-48">
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent className="bg-white dark:bg-zinc-900">
                  {STATUS_OPTIONS.map((status) => (
                    <SelectItem key={status} value={status}>
                      {status}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="priority"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Priority</FormLabel>
              <Select
                onValueChange={field.onChange}
                disabled={readOnly}
                value={field.value}
              >
                <SelectTrigger className="w-48">
                  <SelectValue placeholder="Select priority" />
                </SelectTrigger>
                <SelectContent className="bg-white dark:bg-zinc-900">
                  {PRIORITY_OPTIONS.map((priority) => (
                    <SelectItem key={priority} value={priority}>
                      {priority}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="dueDate"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Due Date</FormLabel>
              <FormControl>
                <Input
                  type="date"
                  className="w-48"
                  {...field}
                  disabled={readOnly}
                  value={field.value || ""}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="flex flex-col gap-4 pt-4">
          {footerButtons}
          <div className="flex justify-end gap-4">
            <Button type="button" variant="outline" onClick={onCancel}>
              Cancel
            </Button>
            {!readOnly && (
              <Button type="submit" className="bg-blue-600 hover:bg-blue-700">
                {defaultValues ? "Update" : "Create"}
              </Button>
            )}
          </div>
        </div>
      </form>
    </Form>
  );
}
