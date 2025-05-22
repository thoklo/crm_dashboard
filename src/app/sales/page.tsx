// Sales page for CRM
import { Card } from "@/components/ui/card";
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";

interface Sale {
  id: number;
  customer: string;
  amount: number;
  date: string;
}
const sales: Sale[] = [];

export default function SalesPage() {
  return (
    <main className="p-6">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-bold">Sales</h1>
        <Dialog>
          <DialogTrigger asChild>
            <Button>Log Sale</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Log Sale</DialogTitle>
            </DialogHeader>
            <div className="text-muted-foreground text-sm">Form coming soon...</div>
          </DialogContent>
        </Dialog>
      </div>
      <Card className="p-4 overflow-x-auto shadow">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Customer</TableHead>
              <TableHead>Amount</TableHead>
              <TableHead>Date</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {sales.length === 0 ? (
              <TableRow>
                <TableCell colSpan={3} className="text-center text-muted-foreground">No sales yet.</TableCell>
              </TableRow>
            ) : (
              sales.map((s) => (
                <TableRow key={s.id}>
                  <TableCell>{s.customer}</TableCell>
                  <TableCell>${s.amount.toFixed(2)}</TableCell>
                  <TableCell>{s.date}</TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </Card>
    </main>
  );
}
