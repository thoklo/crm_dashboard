import * as z from 'zod';

export const customerFormSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Invalid email address"),
  phone: z.string().min(10, "Phone number must be at least 10 characters"),
  company: z.string().min(2, "Company name must be at least 2 characters"),
  status: z.enum(["Active", "Inactive", "Pending"]),
});

export const taskFormSchema = z.object({
  title: z.string().min(3, "Title must be at least 3 characters"),
  description: z.string().min(10, "Description must be at least 10 characters"),
  assignedTo: z.string().min(2, "Assignee name must be at least 2 characters"),
  status: z.enum(["To Do", "In Progress", "Completed", "Blocked"]),
  priority: z.enum(["Low", "Medium", "High", "Critical"]),
  dueDate: z.string(),
});

export const saleFormSchema = z.object({
  customer: z.string().min(2, "Customer name must be at least 2 characters"),
  product: z.string().min(2, "Product name must be at least 2 characters"),
  amount: z.number().min(0, "Amount must be positive"),
  status: z.enum(["Completed", "Pending", "Cancelled"]),
  category: z.string().min(2, "Category is required"),
  date: z.union([
    z.date(),
    z.string().transform((str) => new Date(str)),
    z.instanceof(Date),
  ]),
});

// Full API schemas including all fields
export const customerSchema = customerFormSchema.extend({
  id: z.number(),
  createdAt: z.string(),
});

export const taskSchema = taskFormSchema.extend({
  id: z.number(),
  createdAt: z.string(),
});

export const saleSchema = saleFormSchema.extend({
  id: z.number(),
  createdAt: z.string(),
});

export type CustomerFormValues = z.infer<typeof customerFormSchema>;
export type TaskFormValues = z.infer<typeof taskFormSchema>;
export type SaleFormValues = z.infer<typeof saleFormSchema>;
