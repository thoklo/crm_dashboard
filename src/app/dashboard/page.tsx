// Dashboard page for CRM
"use client";

import { useState, useEffect } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
} from "recharts";
import { Settings } from "@/components/settings";
import { useDataService } from "@/lib/dataService";
import { LoadingState, ErrorState } from "@/components/ui/loading-state";
import type { Customer, Task, Sale } from "@/lib/fakeData";

interface ChartData {
  month: string;
  sales: number;
  customers: number;
  revenue?: number;
}

interface DashboardStats {
  activeCustomers: number;
  completedTasks: number;
  totalSales: number;
  loading: boolean;
  error?: string;
}

export default function DashboardPage() {
  const dataService = useDataService();
  const [stats, setStats] = useState<DashboardStats>({
    activeCustomers: 0,
    completedTasks: 0,
    totalSales: 0,
    loading: true,
  });
  const [chartData, setChartData] = useState<ChartData[]>([]);
  useEffect(() => {
    const mounted = { current: true };

    const loadDashboardData = async () => {
      if (!mounted.current) return;

      setStats((prev) => ({ ...prev, loading: true, error: undefined }));

      try {
        const [customersResponse, tasksResponse, salesResponse] =
          await Promise.all([
            dataService.getCustomers(),
            dataService.getTasks(),
            dataService.getSales(),
          ]);

        // Check for errors
        const errors = [
          customersResponse.error,
          tasksResponse.error,
          salesResponse.error,
        ].filter(Boolean);

        if (errors.length > 0) {
          throw new Error(errors.join(", "));
        }

        const activeCustomers = customersResponse.data.filter(
          (customer: Customer) => customer.status === "Active"
        ).length;

        const completedTasks = tasksResponse.data.filter(
          (task: Task) => task.status === "Completed"
        ).length;

        const totalSalesAmount = salesResponse.data.reduce(
          (sum: number, sale: Sale) => sum + sale.amount,
          0
        );

        setStats({
          activeCustomers,
          completedTasks,
          totalSales: totalSalesAmount,
          loading: false,
        });

        // Create chart data from sales
        const monthlyData = salesResponse.data.reduce(
          (acc: { [key: string]: ChartData }, sale: Sale) => {
            const month = new Date(sale.date).toLocaleString("default", {
              month: "short",
            });
            if (!acc[month]) {
              acc[month] = { month, sales: 0, customers: 0 };
            }
            acc[month].sales += sale.amount;
            return acc;
          },
          {}
        );

        setChartData(Object.values(monthlyData));
      } catch (error) {
        console.error("Error loading dashboard data:", error);
        setStats((prev) => ({
          ...prev,
          loading: false,
          error:
            error instanceof Error
              ? error.message
              : "An error occurred loading the dashboard",
        }));
        setChartData([]);
      }
    };
    loadDashboardData();

    return () => {
      mounted.current = false;
    };
  }, [dataService]);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  if (stats.loading) {
    return <LoadingState message="Loading dashboard data..." />;
  }

  if (stats.error) {
    return (
      <ErrorState
        message={stats.error}
        onRetry={() => window.location.reload()}
      />
    );
  }

  return (
    <main className="p-6 space-y-6">
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-bold mb-2">CRM Dashboard</h1>
          <p className="text-muted-foreground">
            Welcome back! Here&apos;s what&apos;s happening with your business.
          </p>
        </div>
        <Settings />
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Active Customers
            </CardTitle>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              className="h-4 w-4 text-muted-foreground"
            >
              <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
              <circle cx="9" cy="7" r="4" />
              <path d="M22 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75" />
            </svg>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.activeCustomers}</div>
            <p className="text-xs text-muted-foreground">
              +12% from last month
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Completed Tasks
            </CardTitle>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              className="h-4 w-4 text-muted-foreground"
            >
              <path d="M9 11l3 3l8-8" />
              <path d="M21 12c0 4.97-4.03 9-9 9s-9-4.03-9-9s4.03-9 9-9c1.26 0 2.46.26 3.55.73" />
            </svg>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.completedTasks}</div>
            <p className="text-xs text-muted-foreground">+8% from last week</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              className="h-4 w-4 text-muted-foreground"
            >
              <path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
            </svg>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatCurrency(stats.totalSales)}
            </div>
            <p className="text-xs text-muted-foreground">
              +23% from last month
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Sales Performance</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip
                    formatter={(value: number, name: string) => [
                      name === "sales" ? formatCurrency(value) : value,
                      name === "sales" ? "Sales" : "Customers",
                    ]}
                  />
                  <Line
                    type="monotone"
                    dataKey="sales"
                    stroke="#2563eb"
                    strokeWidth={2}
                    dot={{ fill: "#2563eb" }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Customer Growth</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip />
                  <Bar
                    dataKey="customers"
                    fill="#10b981"
                    radius={[4, 4, 0, 0]}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Activity */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Activity</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center gap-4">
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              <div className="flex-1">
                <p className="text-sm font-medium">New customer registered</p>
                <p className="text-xs text-muted-foreground">
                  John Smith from Tech Solutions Inc
                </p>
              </div>
              <span className="text-xs text-muted-foreground">2 hours ago</span>
            </div>
            <div className="flex items-center gap-4">
              <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
              <div className="flex-1">
                <p className="text-sm font-medium">Sale completed</p>
                <p className="text-xs text-muted-foreground">
                  $2,500 Enterprise License
                </p>
              </div>
              <span className="text-xs text-muted-foreground">4 hours ago</span>
            </div>
            <div className="flex items-center gap-4">
              <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
              <div className="flex-1">
                <p className="text-sm font-medium">Task overdue</p>
                <p className="text-xs text-muted-foreground">
                  Follow up with client meeting
                </p>
              </div>
              <span className="text-xs text-muted-foreground">6 hours ago</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </main>
  );
}
