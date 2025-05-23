import { faker } from '@faker-js/faker';

// Set seed for consistent data during development
faker.seed(123);

export interface Customer {
  id: number;
  name: string;
  email: string;
  phone: string;
  company: string;
  status: "Active" | "Inactive" | "Pending";
  avatar?: string;
  createdAt: string;
}

export interface Task {
  id: number;
  title: string;
  description: string;
  assignedTo: string;
  status: "To Do" | "In Progress" | "Completed" | "Blocked";
  priority: "Low" | "Medium" | "High" | "Critical";
  dueDate: string;
  createdAt: string;
}

export type Sale = {
  id: number;
  customer: string;
  product: string;
  amount: number;
  status: string;
  category: string;
  createdAt: string;
};

const SALE_CATEGORIES = [
  "Software",
  "Hardware",
  "Consulting",
  "Subscription",
  "Support",
  "Training",
];

export function generateCustomers(count: number = 25): Customer[] {
  return Array.from({ length: count }, (_, i) => ({
    id: i + 1,
    name: faker.person.fullName(),
    email: faker.internet.email(),
    phone: faker.phone.number(),
    company: faker.company.name(),
    status: faker.helpers.arrayElement(['Active', 'Inactive', 'Pending']),
    avatar: faker.image.avatar(),
    createdAt: faker.date.recent({ days: 30 }).toISOString().split('T')[0],
  }));
}

export function generateTasks(count: number = 20): Task[] {
  return Array.from({ length: count }, (_, i) => ({
    id: i + 1,
    title: faker.lorem.sentence({ min: 3, max: 8 }),
    description: faker.lorem.paragraph(),
    assignedTo: faker.person.fullName(),
    status: faker.helpers.arrayElement(['To Do', 'In Progress', 'Completed', 'Blocked']),
    priority: faker.helpers.arrayElement(['Low', 'Medium', 'High', 'Critical']),
    dueDate: faker.date.future({ years: 0.5 }).toISOString().split('T')[0],
    createdAt: faker.date.recent({ days: 14 }).toISOString().split('T')[0],
  }));
}

export function generateSales(count: number = 30): Sale[] {
  const customers = generateCustomers(10);
  
  return Array.from({ length: count }, (_, i) => {
    const customer = faker.helpers.arrayElement(customers);
    return {
      id: i + 1,
      customer: customer.name,
      product: faker.commerce.productName(),
      amount: parseFloat(
        faker.commerce.price({ min: 100, max: 10000, dec: 2 })
      ),
      status: faker.helpers.arrayElement(["Completed", "Pending", "Cancelled"]),
      category:
        SALE_CATEGORIES[Math.floor(Math.random() * SALE_CATEGORIES.length)],
      createdAt: new Date(Date.now() - Math.random() * 10000000000)
        .toISOString()
        .split("T")[0],
    };
  });
}

// Analytics data
export function generateSalesAnalytics() {
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const currentMonth = new Date().getMonth();
  
  return months.slice(0, currentMonth + 1).map(month => ({
    month,
    sales: faker.number.int({ min: 5000, max: 25000 }),
    customers: faker.number.int({ min: 20, max: 100 }),
    revenue: faker.number.int({ min: 50000, max: 200000 })
  }));
}

// Fallback data in case faker fails
export const fallbackCustomers: Customer[] = [
  {
    id: 1,
    name: "John Smith",
    email: "john.smith@example.com",
    phone: "+1 (555) 123-4567",
    company: "Tech Solutions Inc",
    status: "Active",
    createdAt: "2024-05-01"
  },
  {
    id: 2,
    name: "Sarah Johnson",
    email: "sarah.j@businesscorp.com",
    phone: "+1 (555) 987-6543",
    company: "Business Corp",
    status: "Active",
    createdAt: "2024-05-02"
  },
  {
    id: 3,
    name: "Mike Davis",
    email: "mike.davis@startup.io",
    phone: "+1 (555) 456-7890",
    company: "Startup IO",
    status: "Inactive",
    createdAt: "2024-04-28"
  }
];

export const fallbackTasks: Task[] = [
  {
    id: 1,
    title: "Follow up with new leads",
    description: "Contact potential customers from the trade show",
    assignedTo: "Alice Cooper",
    status: "In Progress",
    priority: "High",
    dueDate: "2024-05-25",
    createdAt: "2024-05-20"
  },
  {
    id: 2,
    title: "Prepare quarterly report",
    description: "Compile sales data for Q2 presentation",
    assignedTo: "Bob Wilson",
    status: "To Do",
    priority: "Medium",
    dueDate: "2024-05-30",
    createdAt: "2024-05-18"
  }
];

export const fallbackSales: Sale[] = [
  {
    id: 1,
    customer: "John Smith",
    product: "Enterprise Software License",
    amount: 2500.0,
    status: "Completed",
    category: "Software",
    createdAt: "2024-05-20",
  },
  {
    id: 2,
    customer: "Sarah Johnson",
    product: "Consulting Services",
    amount: 1200.0,
    status: "Completed",
    category: "Consulting",
    createdAt: "2024-05-18",
  },
];