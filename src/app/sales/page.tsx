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
import { type Sale } from "@/lib/fakeData";
import { LoadingState, ErrorState } from "@/components/ui/loading-state";
import { useDataService } from "@/lib/dataService";
import type { SaleFormValues } from "@/lib/schemas";
import { FilterPopover } from "@/components/ui/filter-popover";

type SortKey = keyof Sale;
type Filters = {
  [key in SortKey]?: string[];
};

// Define filter options
const amountRanges = [
  { label: "< $1,000", value: "0-1000" },
  { label: "$1,001 - $3,000", value: "1001-3000" },
  { label: "$3,001 - $5,000", value: "3001-5000" },
  { label: "$5,001 - $10,000", value: "5001-10000" },
  { label: "> $10,000", value: "10001+" },
];

const statusOptions = [
  { label: "Completed", value: "Completed" },
  { label: "Pending", value: "Pending" },
  { label: "Cancelled", value: "Cancelled" },
];

const categoryOptions = [
  { label: "Software", value: "Software" },
  { label: "Hardware", value: "Hardware" },
  { label: "Consulting", value: "Consulting" },
  { label: "Support", value: "Support" },
  { label: "Training", value: "Training" },
];

const dateOptions = [
  { label: "Last 7 days", value: "7days" },
  { label: "Last 30 days", value: "30days" },
  { label: "Last 90 days", value: "90days" },
  { label: "This year", value: "thisYear" },
  { label: "Last year", value: "lastYear" },
];

export default function SalesPage() {
  const dataService = useDataService() as ReturnType<typeof useDataService>;
  const [sales, setSales] = useState<Sale[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedSale, setSelectedSale] = useState<Sale | null>(null);
  const [dialogMode, setDialogMode] = useState<"add" | "edit" | "view">("add");
  const [sortColumn, setSortColumn] = useState<SortKey>("date");
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("desc");
  const [filters, setFilters] = useState<Filters>({});
  const [error, setError] = useState<string | undefined>();

  useEffect(() => {
    const mounted = { current: true };
    const loadSales = async () => {
      try {
        setLoading(true);
        const response = await dataService.getSales();

        if (!mounted.current) return;

        if (response.error) {
          throw new Error(response.error);
        }

        setSales(response.data);
        setError(undefined);
      } catch (error) {
        console.error("Error loading sales:", error);
        if (mounted.current) {
          setError(
            error instanceof Error ? error.message : "Failed to load sales"
          );
          setSales([]);
        }
      } finally {
        if (mounted.current) {
          setLoading(false);
        }
      }
    };

    loadSales();
    return () => {
      mounted.current = false;
    };
  }, [dataService]);

  const handleFilterChange = (column: SortKey, selectedOptions: string[]) => {
    setFilters((prev) => ({
      ...prev,
      [column]: selectedOptions.length > 0 ? selectedOptions : undefined,
    }));
  };

  const filteredAndSortedSales = useMemo(() => {
    let filteredSales = [...sales];

    // Apply filters
    Object.entries(filters).forEach(([column, selectedOptions]) => {
      if (!selectedOptions?.length) return;

      filteredSales = filteredSales.filter((sale) => {
        const value = sale[column as SortKey];

        if (column === "amount") {
          const amount = Number(value);
          return selectedOptions.some((option) => {
            const [min, max] = option.split("-").map(Number);
            if (option === "10001+") return amount > 10000;
            return amount >= min && amount <= max;
          });
        }

        if (column === "date") {
          const date = new Date(value as string | number | Date);
          const now = new Date();
          return selectedOptions.some((option) => {
            switch (option) {
              case "7days":
                return date >= new Date(now.setDate(now.getDate() - 7));
              case "30days":
                return date >= new Date(now.setDate(now.getDate() - 30));
              case "90days":
                return date >= new Date(now.setDate(now.getDate() - 90));
              case "thisYear":
                return date.getFullYear() === now.getFullYear();
              case "lastYear":
                return date.getFullYear() === now.getFullYear() - 1;
              default:
                return true;
            }
          });
        }

        return selectedOptions.includes(String(value));
      });
    });

    // Apply sorting
    if (sortColumn) {
      filteredSales.sort((a, b) => {
        const aValue = a[sortColumn];
        const bValue = b[sortColumn];

        if (aValue === null || aValue === undefined)
          return sortDirection === "asc" ? 1 : -1;
        if (bValue === null || bValue === undefined)
          return sortDirection === "asc" ? -1 : 1;

        if (sortColumn === "amount") {
          return sortDirection === "asc"
            ? Number(aValue) - Number(bValue)
            : Number(bValue) - Number(aValue);
        }
        if (sortColumn === "date") {
          const aDate = new Date(aValue);
          const bDate = new Date(bValue);
          return sortDirection === "asc"
            ? aDate.getTime() - bDate.getTime()
            : bDate.getTime() - aDate.getTime();
        }

        const aStr = String(aValue).toLowerCase();
        const bStr = String(bValue).toLowerCase();
        return sortDirection === "asc"
          ? aStr.localeCompare(bStr)
          : bStr.localeCompare(aStr);
      });
    }

    return filteredSales;
  }, [sales, filters, sortColumn, sortDirection]);

  const handleAddSale = async (data: SaleFormValues) => {
    try {
      const currentDate = new Date().toISOString();
      const saleData = {
        customer: data.customer,
        product: data.product,
        amount: data.amount,
        status: data.status,
        category: data.category,
        date: data.date instanceof Date ? data.date : new Date(data.date),
        createdAt: currentDate,
      };
      const response = await dataService.addSale(saleData);
      if (response.error) {
        throw new Error(response.error);
      }

      const newSale = Array.isArray(response.data)
        ? response.data[0]
        : response.data;
      if (!newSale) {
        throw new Error("No sale data received from server");
      }

      setSales((prev) => [...prev, newSale]);
      setError(undefined);
      setDialogOpen(false);
    } catch (error) {
      console.error("Error adding sale:", error);
      setError(error instanceof Error ? error.message : "Failed to add sale");
    }
  };

  const handleSort = (column: SortKey) => {
    setSortDirection((currentDirection) =>
      sortColumn === column && currentDirection === "asc" ? "desc" : "asc"
    );
    setSortColumn(column);
  };
  if (loading) {
    return <LoadingState message="Loading sales data..." />;
  }

  if (error) {
    return (
      <ErrorState message={error} onRetry={() => window.location.reload()} />
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
                      date: new Date(selectedSale.date),
                    }
                  : undefined
              }
              onSubmit={async (data) => {
                if (dialogMode === "edit" && selectedSale) {
                  try {
                    const response = await dataService.updateSale(
                      selectedSale.id,
                      data
                    );
                    if (response.error) {
                      throw new Error(response.error);
                    }

                    const updatedSale = Array.isArray(response.data)
                      ? response.data[0]
                      : response.data;
                    if (!updatedSale) {
                      throw new Error("No sale data received from server");
                    }

                    setSales((prev) =>
                      prev.map((s) =>
                        s.id === selectedSale.id ? updatedSale : s
                      )
                    );
                    setError(undefined);
                  } catch (error) {
                    console.error("Error updating sale:", error);
                    setError(
                      error instanceof Error
                        ? error.message
                        : "Failed to update sale"
                    );
                  }
                } else {
                  await handleAddSale(data);
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
              footerButtons={
                dialogMode !== "add" && (
                  <div className="flex justify-between w-full">
                    <Button
                      variant="outline"
                      onClick={(e) => {
                        e.preventDefault();
                        const currentIndex = filteredAndSortedSales.findIndex(
                          (s) => s.id === selectedSale?.id
                        );
                        if (currentIndex > 0) {
                          const prevSale =
                            filteredAndSortedSales[currentIndex - 1];
                          setSelectedSale(prevSale);
                        }
                      }}
                      disabled={
                        !selectedSale ||
                        filteredAndSortedSales.findIndex(
                          (s) => s.id === selectedSale.id
                        ) === 0
                      }
                    >
                      ← Previous
                    </Button>
                    <Button
                      variant="outline"
                      onClick={(e) => {
                        e.preventDefault();
                        const currentIndex = filteredAndSortedSales.findIndex(
                          (s) => s.id === selectedSale?.id
                        );
                        if (currentIndex < filteredAndSortedSales.length - 1) {
                          const nextSale =
                            filteredAndSortedSales[currentIndex + 1];
                          setSelectedSale(nextSale);
                        }
                      }}
                      disabled={
                        !selectedSale ||
                        filteredAndSortedSales.findIndex(
                          (s) => s.id === selectedSale.id
                        ) ===
                          filteredAndSortedSales.length - 1
                      }
                    >
                      Next →
                    </Button>
                  </div>
                )
              }
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
                  <div className="flex items-center">Customer</div>
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
                  <div className="flex items-center">Product</div>
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
                  <div className="flex items-center">
                    Category
                    <FilterPopover
                      options={categoryOptions}
                      onFilterChange={(options) =>
                        handleFilterChange("category", options)
                      }
                      title="Filter by Category"
                    />
                  </div>
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
                  <div className="flex items-center">
                    Amount
                    <FilterPopover
                      options={amountRanges}
                      onFilterChange={(options) =>
                        handleFilterChange("amount", options)
                      }
                      title="Filter by Amount"
                    />
                  </div>
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
                  <div className="flex items-center">
                    Date
                    <FilterPopover
                      options={dateOptions}
                      onFilterChange={(options) =>
                        handleFilterChange("date", options)
                      }
                      title="Filter by Date"
                    />
                  </div>
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
                  <div className="flex items-center">
                    Status
                    <FilterPopover
                      options={statusOptions}
                      onFilterChange={(options) =>
                        handleFilterChange("status", options)
                      }
                      title="Filter by Status"
                    />
                  </div>
                </TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredAndSortedSales.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={7}
                    className="text-center text-muted-foreground py-8"
                  >
                    No sales records found.
                  </TableCell>
                </TableRow>
              ) : (
                filteredAndSortedSales.map((sale) => (
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
                    <TableCell>
                      {new Date(sale.date).toLocaleDateString()}
                    </TableCell>
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
