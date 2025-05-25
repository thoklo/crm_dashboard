// Customers page for CRM
"use client";

import { useState, useEffect, useMemo } from "react";
import { Card } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { CustomerForm } from "@/components/customer-form";
import { type Customer } from "@/lib/fakeData";
import { LoadingState, ErrorState } from "@/components/ui/loading-state";
import { useDataService } from "@/lib/dataService";
import type { CustomerFormValues } from "@/lib/schemas";
import { FilterPopover } from "@/components/ui/filter-popover";

type SortKey = keyof Customer;
type Filters = {
  [key in SortKey]?: string[];
};

const statusOptions = [
  { label: "Active", value: "Active" },
  { label: "Inactive", value: "Inactive" },
  { label: "Pending", value: "Pending" },
];

const createdAtRanges = [
  { label: "Last 7 days", value: "7days" },
  { label: "Last 30 days", value: "30days" },
  { label: "Last 90 days", value: "90days" },
  { label: "This year", value: "thisYear" },
  { label: "Last year", value: "lastYear" },
];

export default function CustomersPage() {
  const dataService = useDataService();
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | undefined>();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(
    null
  );
  const [dialogMode, setDialogMode] = useState<"add" | "edit" | "view">("add");
  const [sortColumn, setSortColumn] = useState<SortKey>("company"); // Default sort by Company
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc");
  const [filters, setFilters] = useState<Filters>({});

  useEffect(() => {
    const mounted = { current: true };
    const loadCustomers = async () => {
      try {
        setLoading(true);
        const response = await dataService.getCustomers();

        if (!mounted.current) return;

        if (response.error) {
          throw new Error(response.error);
        }

        setCustomers(response.data);
        setError(undefined);
      } catch (error) {
        console.error("Error loading customers:", error);
        if (mounted.current) {
          setError(
            error instanceof Error ? error.message : "Failed to load customers"
          );
          setCustomers([]);
        }
      } finally {
        if (mounted.current) {
          setLoading(false);
        }
      }
    };

    loadCustomers();
    return () => {
      mounted.current = false;
    };
  }, [dataService]);

  const handleAddCustomer = (data: CustomerFormValues) => {
    const newCustomer: Customer = {
      id: customers.length + 1,
      ...data,
      createdAt: new Date().toISOString().split("T")[0],
    };

    setCustomers([...customers, newCustomer]);
    setDialogOpen(false);
  };

  const handleSort = (columnKey: SortKey) => {
    if (sortColumn === columnKey) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortColumn(columnKey);
      setSortDirection("asc"); // Default to ascending when changing column
    }
  };

  const handleFilterChange = (column: SortKey, selectedOptions: string[]) => {
    setFilters((prev) => ({
      ...prev,
      [column]: selectedOptions.length > 0 ? selectedOptions : undefined,
    }));
  };

  const filteredAndSortedCustomers = useMemo(() => {
    let filteredCustomers = [...customers];

    // Apply filters
    Object.entries(filters).forEach(([column, selectedOptions]) => {
      if (!selectedOptions?.length) return;

      filteredCustomers = filteredCustomers.filter((customer) => {
        const value = customer[column as SortKey];

        if (column === "createdAt") {
          const createdDate = new Date(value as string);
          const now = new Date();
          return selectedOptions.some((option) => {
            switch (option) {
              case "7days":
                return createdDate >= new Date(now.setDate(now.getDate() - 7));
              case "30days":
                return createdDate >= new Date(now.setDate(now.getDate() - 30));
              case "90days":
                return createdDate >= new Date(now.setDate(now.getDate() - 90));
              case "thisYear":
                return createdDate.getFullYear() === now.getFullYear();
              case "lastYear":
                return createdDate.getFullYear() === now.getFullYear() - 1;
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
      filteredCustomers.sort((a, b) => {
        const aValue = a[sortColumn];
        const bValue = b[sortColumn];

        if (aValue === null || aValue === undefined)
          return sortDirection === "asc" ? 1 : -1;
        if (bValue === null || bValue === undefined)
          return sortDirection === "asc" ? -1 : 1;

        const aStr = String(aValue).toLowerCase();
        const bStr = String(bValue).toLowerCase();
        return sortDirection === "asc"
          ? aStr.localeCompare(bStr)
          : bStr.localeCompare(aStr);
      });
    }

    return filteredCustomers;
  }, [customers, filters, sortColumn, sortDirection]);

  if (loading) {
    return <LoadingState message="Loading customers data..." />;
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
          <h1 className="text-3xl font-bold">Customers</h1>
          <p className="text-muted-foreground mt-1">
            Manage your customer relationships
          </p>
        </div>{" "}
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button
              onClick={() => {
                setSelectedCustomer(null);
                setDialogMode("add");
                setDialogOpen(true);
              }}
              className="bg-blue-600 hover:bg-blue-700 text-white font-semibold shadow-lg transition-colors duration-200 px-6 py-2 rounded-md border-none focus-visible:ring-2 focus-visible:ring-blue-400 focus-visible:ring-offset-2"
            >
              Add Customer
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>
                {dialogMode === "add"
                  ? "Add New Customer"
                  : dialogMode === "edit"
                  ? "Edit Customer"
                  : "View Customer"}
              </DialogTitle>
            </DialogHeader>
            <CustomerForm
              defaultValues={
                selectedCustomer
                  ? {
                      name: selectedCustomer.name,
                      email: selectedCustomer.email,
                      phone: selectedCustomer.phone,
                      company: selectedCustomer.company,
                      status: selectedCustomer.status,
                    }
                  : undefined
              }
              onSubmit={(data) => {
                if (dialogMode === "edit" && selectedCustomer) {
                  const updatedCustomers = customers.map((c) =>
                    c.id === selectedCustomer.id ? { ...c, ...data } : c
                  );
                  setCustomers(updatedCustomers);
                } else {
                  handleAddCustomer(data);
                }
                setDialogOpen(false);
              }}
              onCancel={() => {
                setDialogOpen(false);
                setSelectedCustomer(null);
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
                        const currentIndex =
                          filteredAndSortedCustomers.findIndex(
                            (c) => c.id === selectedCustomer?.id
                          );
                        if (currentIndex > 0) {
                          const prevCustomer =
                            filteredAndSortedCustomers[currentIndex - 1];
                          setSelectedCustomer(prevCustomer);
                        }
                      }}
                      disabled={
                        !selectedCustomer ||
                        filteredAndSortedCustomers.findIndex(
                          (c) => c.id === selectedCustomer.id
                        ) === 0
                      }
                    >
                      ← Previous
                    </Button>
                    <Button
                      variant="outline"
                      onClick={(e) => {
                        e.preventDefault();
                        const currentIndex =
                          filteredAndSortedCustomers.findIndex(
                            (c) => c.id === selectedCustomer?.id
                          );
                        if (
                          currentIndex <
                          filteredAndSortedCustomers.length - 1
                        ) {
                          const nextCustomer =
                            filteredAndSortedCustomers[currentIndex + 1];
                          setSelectedCustomer(nextCustomer);
                        }
                      }}
                      disabled={
                        !selectedCustomer ||
                        filteredAndSortedCustomers.findIndex(
                          (c) => c.id === selectedCustomer.id
                        ) ===
                          filteredAndSortedCustomers.length - 1
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
          Showing {customers.length} customers
        </p>
      </div>

      <Card className="overflow-hidden">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead
                  sortable
                  columnKey="name"
                  onSort={handleSort}
                  sortDirection={
                    sortColumn === "name" ? sortDirection : undefined
                  }
                  isSorted={sortColumn === "name"}
                >
                  Name
                </TableHead>
                <TableHead
                  sortable
                  columnKey="email"
                  onSort={handleSort}
                  sortDirection={
                    sortColumn === "email" ? sortDirection : undefined
                  }
                  isSorted={sortColumn === "email"}
                >
                  Email
                </TableHead>
                <TableHead
                  sortable
                  columnKey="phone"
                  onSort={handleSort}
                  sortDirection={
                    sortColumn === "phone" ? sortDirection : undefined
                  }
                  isSorted={sortColumn === "phone"}
                >
                  Phone
                </TableHead>
                <TableHead
                  sortable
                  columnKey="company"
                  onSort={handleSort}
                  sortDirection={
                    sortColumn === "company" ? sortDirection : undefined
                  }
                  isSorted={sortColumn === "company"}
                >
                  <div className="flex items-center">
                    Company
                    <FilterPopover
                      options={customers
                        .map((c) => ({ label: c.company, value: c.company }))
                        .filter(
                          (v, i, a) =>
                            a.findIndex((t) => t.value === v.value) === i
                        )
                        .sort((a, b) => a.label.localeCompare(b.label))}
                      onFilterChange={(options) =>
                        handleFilterChange("company", options)
                      }
                      title="Filter by Company"
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
                <TableHead
                  sortable
                  columnKey="createdAt"
                  onSort={handleSort}
                  sortDirection={
                    sortColumn === "createdAt" ? sortDirection : undefined
                  }
                  isSorted={sortColumn === "createdAt"}
                >
                  <div className="flex items-center">
                    Created
                    <FilterPopover
                      options={createdAtRanges}
                      onFilterChange={(options) =>
                        handleFilterChange("createdAt", options)
                      }
                      title="Filter by Creation Date"
                    />
                  </div>
                </TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredAndSortedCustomers.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={7}
                    className="text-center text-muted-foreground py-8"
                  >
                    No customers yet.
                  </TableCell>
                </TableRow>
              ) : (
                filteredAndSortedCustomers.map((customer) => (
                  <TableRow key={customer.id}>
                    <TableCell className="font-medium">
                      {customer.name}
                    </TableCell>
                    <TableCell>{customer.email}</TableCell>
                    <TableCell>{customer.phone}</TableCell>
                    <TableCell>{customer.company}</TableCell>
                    <TableCell>
                      <span
                        className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                          customer.status === "Active"
                            ? "bg-green-100 text-green-800"
                            : customer.status === "Inactive"
                            ? "bg-red-100 text-red-800"
                            : "bg-yellow-100 text-yellow-800"
                        }`}
                      >
                        {customer.status}
                      </span>{" "}
                    </TableCell>
                    <TableCell>{customer.createdAt}</TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            setSelectedCustomer(customer);
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
                            setSelectedCustomer(customer);
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
