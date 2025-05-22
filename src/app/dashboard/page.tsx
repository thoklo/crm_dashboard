// Dashboard page for CRM
import { Card } from "@/components/ui/card";

export default function DashboardPage() {
  return (
    <main className="p-6 space-y-6">
      <h1 className="text-3xl font-bold mb-8">CRM Dashboard</h1>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="p-6 flex flex-col items-center justify-center text-center shadow border border-border">
          <span className="text-sm text-muted-foreground mb-1">Active Customers</span>
          <span className="text-2xl font-bold">--</span>
        </Card>
        <Card className="p-6 flex flex-col items-center justify-center text-center shadow border border-border">
          <span className="text-sm text-muted-foreground mb-1">Tasks Completed This Week</span>
          <span className="text-2xl font-bold">--</span>
        </Card>
        <Card className="p-6 flex flex-col items-center justify-center text-center shadow border border-border">
          <span className="text-sm text-muted-foreground mb-1">Total Sales This Month</span>
          <span className="text-2xl font-bold">--</span>
        </Card>
      </div>
      <div className="mt-10">
        <Card className="p-6 shadow border border-border">
          <div className="text-lg font-semibold mb-2">Sales Performance</div>
          <div className="h-64 flex items-center justify-center text-muted-foreground">Sales Performance Chart (coming soon)</div>
        </Card>
      </div>
    </main>
  );
}
