// Customers page for CRM
"use client";

import { useState, useEffect } from "react";
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
import {
  generateCustomers,
  fallbackCustomers,
  type Customer,
} from "@/lib/fakeData";
import type { CustomerFormValues } from "@/lib/schemas";

export default function CustomersPage() {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(
    null
  );
  const [dialogMode, setDialogMode] = useState<"add" | "edit" | "view">("add");

  useEffect(() => {
    try {
      const fakeCustomers = generateCustomers(25);
      setCustomers(fakeCustomers);
    } catch (error) {
      console.warn("Using fallback data:", error);
      setCustomers(fallbackCustomers);
    } finally {
      setLoading(false);
    }
  }, []);

  const handleAddCustomer = (data: CustomerFormValues) => {
    const newCustomer: Customer = {
      id: customers.length + 1,
      ...data,
      createdAt: new Date().toISOString().split("T")[0],
    };

    setCustomers([...customers, newCustomer]);
    setDialogOpen(false);
  };

  if (loading) {
    return (
      <main className="p-6">
        <div className="flex justify-center items-center h-64">
          <div className="text-muted-foreground">Loading customers...</div>
        </div>
      </main>
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
            <Button>Add Customer</Button>
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
                <TableHead>Name</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Phone</TableHead>
                <TableHead>Company</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Created</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {customers.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={7}
                    className="text-center text-muted-foreground py-8"
                  >
                    No customers yet.
                  </TableCell>
                </TableRow>
              ) : (
                customers.map((customer) => (
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
