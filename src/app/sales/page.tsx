"use client";

import { useState, useEffect, useMemo } from "react";
import { Card } from "@/components/ui/card";
import {
  Table,
  TableHeader,
  TableRow,
  TableHead,
  TableBody,
  TableCell,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { SaleForm } from "@/components/sale-form";
import { generateSales, fallbackSales, type Sale } from "@/lib/fakeData";
import type { SaleFormValues } from "@/lib/schemas";

type SortKey = keyof Sale;

export default function SalesPage() {
  const [sales, setSales] = useState<Sale[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedSale, setSelectedSale] = useState<Sale | null>(null);
  const [dialogMode, setDialogMode] = useState<"add" | "edit" | "view">("add");
  const [sortColumn, setSortColumn] = useState<SortKey>("date"); // Default sort by date
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("desc"); // Default newest first

  useEffect(() => {
    try {
      const fakeSales = generateSales(30);
      setSales(fakeSales);
    } catch (error) {
      console.warn("Using fallback data:", error);
      setSales(fallbackSales);
    } finally {
      setLoading(false);
    }
  }, []);

  const sortedSales = useMemo(() => {
    const sortableRecords = [...sales];
    if (!sortColumn) return sortableRecords;

    return sortableRecords.sort((a, b) => {
      const aValue = a[sortColumn];
      const bValue = b[sortColumn];

      if (aValue === null || aValue === undefined)
        return sortDirection === "asc" ? 1 : -1;
      if (bValue === null || bValue === undefined)
        return sortDirection === "asc" ? -1 : 1;

      // Handle different types appropriately
      if (sortColumn === "amount") {
        // Numeric comparison for amount
        return sortDirection === "asc"
          ? Number(aValue) - Number(bValue)
          : Number(bValue) - Number(aValue);
      } else if (sortColumn === "date") {
        // Date comparison
        const aDate = new Date(aValue as Date);
        const bDate = new Date(bValue as Date);
        return sortDirection === "asc"
          ? aDate.getTime() - bDate.getTime()
          : bDate.getTime() - aDate.getTime();
      } else {
        // String comparison for other fields
        const aStr = String(aValue).toLowerCase();
        const bStr = String(bValue).toLowerCase();
        return sortDirection === "asc"
          ? aStr.localeCompare(bStr)
          : bStr.localeCompare(aStr);
      }
    });
  }, [sales, sortColumn, sortDirection]);

  const handleAddSale = (data: SaleFormValues) => {
    const newSale: Sale = {
      id: sales.length + 1,
      ...data,
      createdAt: new Date().toISOString().split("T")[0],
      date: new Date(),
    };

    setSales([...sales, newSale]);
    setDialogOpen(false);
  };

  const handleSort = (column: SortKey) => {
    setSortDirection((currentDirection) =>
      sortColumn === column && currentDirection === "asc" ? "desc" : "asc"
    );
    setSortColumn(column);
  };

  if (loading) {
    return (
      <main className="p-6">
        <div className="flex justify-center items-center h-64">
          <div className="text-muted-foreground">Loading sales data...</div>
        </div>
      </main>
    );
  }

  return (
    <main className="p-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold">Sales</h1>
          <p className="text-muted-foreground mt-1">
            View and manage your sales records
          </p>
        </div>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button
              onClick={() => {
                setSelectedSale(null);
                setDialogMode("add");
                setDialogOpen(true);
              }}
              className="bg-blue-600 hover:bg-blue-700 text-white font-semibold shadow-lg transition-colors duration-200 px-6 py-2 rounded-md border-none focus-visible:ring-2 focus-visible:ring-blue-400 focus-visible:ring-offset-2"
            >
              Log Sale
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>
                {dialogMode === "add"
                  ? "Log New Sale"
                  : dialogMode === "edit"
                  ? "Edit Sale"
                  : "View Sale"}
              </DialogTitle>
            </DialogHeader>
            <SaleForm
              defaultValues={
                selectedSale
                  ? {
                      customer: selectedSale.customer,
                      product: selectedSale.product,
                      amount: selectedSale.amount,
                      status: selectedSale.status as
                        | "Completed"
                        | "Pending"
                        | "Cancelled",
                      category: selectedSale.category,
                      date: selectedSale.date,
                    }
                  : undefined
              }
              onSubmit={(data) => {
                if (dialogMode === "edit" && selectedSale) {
                  const updatedSales = sales.map((s) =>
                    s.id === selectedSale.id
                      ? { ...s, ...data, status: data.status }
                      : s
                  );
                  setSales(updatedSales);
                } else {
                  handleAddSale(data);
                }
                setDialogOpen(false);
                setSelectedSale(null);
                setDialogMode("add");
              }}
              onCancel={() => {
                setDialogOpen(false);
                setSelectedSale(null);
                setDialogMode("add");
              }}
              readOnly={dialogMode === "view"}
            />
          </DialogContent>
        </Dialog>
      </div>

      <div className="mb-4">
        <p className="text-sm text-muted-foreground">
          Showing {sales.length} sales records
        </p>
      </div>

      <Card className="overflow-hidden">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead
                  sortable
                  columnKey="customer"
                  onSort={handleSort}
                  sortDirection={
                    sortColumn === "customer" ? sortDirection : undefined
                  }
                  isSorted={sortColumn === "customer"}
                >
                  Customer
                </TableHead>
                <TableHead
                  sortable
                  columnKey="product"
                  onSort={handleSort}
                  sortDirection={
                    sortColumn === "product" ? sortDirection : undefined
                  }
                  isSorted={sortColumn === "product"}
                >
                  Product
                </TableHead>
                <TableHead
                  sortable
                  columnKey="category"
                  onSort={handleSort}
                  sortDirection={
                    sortColumn === "category" ? sortDirection : undefined
                  }
                  isSorted={sortColumn === "category"}
                >
                  Category
                </TableHead>
                <TableHead
                  sortable
                  columnKey="amount"
                  onSort={handleSort}
                  sortDirection={
                    sortColumn === "amount" ? sortDirection : undefined
                  }
                  isSorted={sortColumn === "amount"}
                >
                  Amount
                </TableHead>
                <TableHead
                  sortable
                  columnKey="date"
                  onSort={handleSort}
                  sortDirection={
                    sortColumn === "date" ? sortDirection : undefined
                  }
                  isSorted={sortColumn === "date"}
                >
                  Date
                </TableHead>
                <TableHead
                  sortable
                  columnKey="status"
                  onSort={handleSort}
                  sortDirection={
                    sortColumn === "status" ? sortDirection : undefined
                  }
                  isSorted={sortColumn === "status"}
                >
                  Status
                </TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {sortedSales.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={7}
                    className="text-center text-muted-foreground py-8"
                  >
                    No sales records found.
                  </TableCell>
                </TableRow>
              ) : (
                sortedSales.map((sale) => (
                  <TableRow key={sale.id}>
                    <TableCell className="font-medium">
                      {sale.customer}
                    </TableCell>
                    <TableCell>{sale.product}</TableCell>
                    <TableCell>{sale.category}</TableCell>
                    <TableCell>
                      $
                      {sale.amount.toLocaleString("en-US", {
                        minimumFractionDigits: 2,
                      })}
                    </TableCell>
                    <TableCell>{sale.date.toLocaleDateString()}</TableCell>
                    <TableCell>
                      <span
                        className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                          sale.status === "Completed"
                            ? "bg-green-100 text-green-800"
                            : sale.status === "Cancelled"
                            ? "bg-red-100 text-red-800"
                            : "bg-yellow-100 text-yellow-800"
                        }`}
                      >
                        {sale.status}
                      </span>
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            setSelectedSale(sale);
                            setDialogMode("edit");
                            setDialogOpen(true);
                          }}
                        >
                          Edit
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            setSelectedSale(sale);
                            setDialogMode("view");
                            setDialogOpen(true);
                          }}
                        >
                          View
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </Card>
    </main>
  );
}
