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
import { LoadingState, ErrorState } from "@/components/ui/loading-state";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { TaskForm } from "@/components/task-form";
import { useDataService } from "@/lib/dataService";
import { type Task } from "@/lib/fakeData";
import type { TaskFormValues } from "@/lib/schemas";
import { FilterPopover } from "@/components/ui/filter-popover";

type SortKey = keyof Task;
type Filters = {
  [key in SortKey]?: string[];
};

const statusOptions = [
  { label: "Not Started", value: "Not Started" },
  { label: "In Progress", value: "In Progress" },
  { label: "Completed", value: "Completed" },
  { label: "Blocked", value: "Blocked" },
];

const priorityOptions = [
  { label: "Critical", value: "Critical" },
  { label: "High", value: "High" },
  { label: "Medium", value: "Medium" },
  { label: "Low", value: "Low" },
];

const dueDateOptions = [
  { label: "Today", value: "today" },
  { label: "Tomorrow", value: "tomorrow" },
  { label: "This Week", value: "thisWeek" },
  { label: "Next Week", value: "nextWeek" },
  { label: "This Month", value: "thisMonth" },
  { label: "Overdue", value: "overdue" },
];

export default function TasksPage() {
  const dataService = useDataService();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | undefined>();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [dialogMode, setDialogMode] = useState<"add" | "edit" | "view">("add");
  const [sortColumn, setSortColumn] = useState<SortKey>("dueDate");
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("desc");
  const [filters, setFilters] = useState<Filters>({});
  useEffect(() => {
    const mounted = { current: true };
    const loadTasks = async () => {
      try {
        setLoading(true);
        const response = await dataService.getTasks();
        if (!mounted.current) return;

        if (response.error) {
          throw new Error(response.error);
        }
        setTasks(response.data);
        setError(undefined);
      } catch (error) {
        console.error("Error loading tasks:", error);
        if (mounted.current) {
          setError(
            error instanceof Error ? error.message : "Failed to load tasks"
          );
          setTasks([]);
        }
      } finally {
        if (mounted.current) {
          setLoading(false);
        }
      }
    };
    loadTasks();
    return () => {
      mounted.current = false;
    };
  }, [dataService]);
  const handleAddTask = async (data: TaskFormValues) => {
    try {
      const taskData = {
        ...data,
        status: data.status,
        priority: data.priority,
        createdAt: new Date().toISOString().split("T")[0],
      };
      const response = await dataService.addTask(taskData);
      if (response.error) {
        throw new Error(response.error);
      }

      const newTask = Array.isArray(response.data)
        ? response.data[0]
        : response.data;
      if (!newTask) {
        throw new Error("No task data received from server");
      }

      setTasks((prev) => [...prev, newTask]);
      setError(undefined);
    } catch (error) {
      console.error("Error adding task:", error);
      setError(error instanceof Error ? error.message : "Failed to add task");
    } finally {
      setDialogOpen(false);
    }
  };

  const handleSort = (columnKey: SortKey) => {
    if (sortColumn === columnKey) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortColumn(columnKey);
      setSortDirection("asc");
    }
  };

  const handleFilterChange = (column: SortKey, selectedOptions: string[]) => {
    setFilters((prev) => ({
      ...prev,
      [column]: selectedOptions.length > 0 ? selectedOptions : undefined,
    }));
  };

  const filteredAndSortedTasks = useMemo(() => {
    let filteredTasks = [...tasks];

    // Apply filters
    Object.entries(filters).forEach(([column, selectedOptions]) => {
      if (!selectedOptions?.length) return;

      filteredTasks = filteredTasks.filter((task) => {
        const value = task[column as SortKey];

        if (column === "dueDate") {
          const dueDate = new Date(value as string);
          const now = new Date();
          const today = new Date(
            now.getFullYear(),
            now.getMonth(),
            now.getDate()
          );
          const tomorrow = new Date(today);
          tomorrow.setDate(tomorrow.getDate() + 1);
          const nextWeek = new Date(today);
          nextWeek.setDate(nextWeek.getDate() + 7);
          const thisMonth = new Date(today);
          thisMonth.setMonth(thisMonth.getMonth() + 1);

          return selectedOptions.some((option) => {
            switch (option) {
              case "today":
                return dueDate.toDateString() === today.toDateString();
              case "tomorrow":
                return dueDate.toDateString() === tomorrow.toDateString();
              case "thisWeek":
                return dueDate >= today && dueDate < nextWeek;
              case "nextWeek":
                return (
                  dueDate >= nextWeek &&
                  dueDate <
                    new Date(nextWeek.getTime() + 7 * 24 * 60 * 60 * 1000)
                );
              case "thisMonth":
                return dueDate >= today && dueDate < thisMonth;
              case "overdue":
                return dueDate < today;
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
      filteredTasks.sort((a, b) => {
        const aValue = a[sortColumn];
        const bValue = b[sortColumn];

        if (aValue === null || aValue === undefined)
          return sortDirection === "asc" ? 1 : -1;
        if (bValue === null || bValue === undefined)
          return sortDirection === "asc" ? -1 : 1;

        if (typeof aValue === "string" && typeof bValue === "string") {
          return sortDirection === "asc"
            ? aValue.localeCompare(bValue)
            : bValue.localeCompare(aValue);
        }

        const dateA = new Date(aValue);
        const dateB = new Date(bValue);
        if (!isNaN(dateA.getTime()) && !isNaN(dateB.getTime())) {
          return sortDirection === "asc"
            ? dateA.getTime() - dateB.getTime()
            : dateB.getTime() - dateA.getTime();
        }

        return sortDirection === "asc"
          ? aValue < bValue
            ? -1
            : 1
          : bValue < aValue
          ? -1
          : 1;
      });
    }

    return filteredTasks;
  }, [tasks, filters, sortColumn, sortDirection]);
  if (loading) {
    return <LoadingState message="Loading tasks..." />;
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
          <h1 className="text-3xl font-bold">Tasks</h1>
          <p className="text-muted-foreground mt-1">Manage your team tasks</p>
        </div>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button
              onClick={() => {
                setSelectedTask(null);
                setDialogMode("add");
                setDialogOpen(true);
              }}
              className="bg-blue-600 hover:bg-blue-700 text-white font-semibold shadow-lg transition-colors duration-200 px-6 py-2 rounded-md border-none focus-visible:ring-2 focus-visible:ring-blue-400 focus-visible:ring-offset-2"
            >
              Add Task
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>
                {dialogMode === "add"
                  ? "Add New Task"
                  : dialogMode === "edit"
                  ? "Edit Task"
                  : "View Task"}
              </DialogTitle>
            </DialogHeader>
            <TaskForm
              defaultValues={
                selectedTask
                  ? {
                      title: selectedTask.title,
                      description: selectedTask.description,
                      assignedTo: selectedTask.assignedTo,
                      status: selectedTask.status,
                      priority: selectedTask.priority,
                      dueDate: selectedTask.dueDate,
                    }
                  : undefined
              }
              onSubmit={(data) => {
                if (dialogMode === "edit" && selectedTask) {
                  const updatedTasks = tasks.map((t) =>
                    t.id === selectedTask.id
                      ? {
                          ...t,
                          ...data,
                          status: data.status,
                          priority: data.priority,
                        }
                      : t
                  );
                  setTasks(updatedTasks);
                } else {
                  handleAddTask(data);
                }
                setDialogOpen(false);
                setSelectedTask(null);
                setDialogMode("add");
              }}
              onCancel={() => {
                setDialogOpen(false);
                setSelectedTask(null);
                setDialogMode("add");
              }}
              readOnly={dialogMode === "view"}
              footerButtons={
                dialogMode !== "add" && (
                  <div className="flex justify-between w-full">
                    <Button
                      variant="outline"
                      onClick={(e) => {
                        e.preventDefault(); // Prevent form submission
                        const currentIndex = filteredAndSortedTasks.findIndex(
                          (t) => t.id === selectedTask?.id
                        );
                        if (currentIndex > 0) {
                          const prevTask =
                            filteredAndSortedTasks[currentIndex - 1];
                          setSelectedTask(prevTask);
                        }
                      }}
                      disabled={
                        !selectedTask ||
                        filteredAndSortedTasks.findIndex(
                          (t) => t.id === selectedTask.id
                        ) === 0
                      }
                    >
                      ← Previous
                    </Button>
                    <Button
                      variant="outline"
                      onClick={(e) => {
                        e.preventDefault(); // Prevent form submission
                        const currentIndex = filteredAndSortedTasks.findIndex(
                          (t) => t.id === selectedTask?.id
                        );
                        if (currentIndex < filteredAndSortedTasks.length - 1) {
                          const nextTask =
                            filteredAndSortedTasks[currentIndex + 1];
                          setSelectedTask(nextTask);
                        }
                      }}
                      disabled={
                        !selectedTask ||
                        filteredAndSortedTasks.findIndex(
                          (t) => t.id === selectedTask.id
                        ) ===
                          filteredAndSortedTasks.length - 1
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
          Showing {tasks.length} tasks
        </p>
      </div>

      <Card className="overflow-hidden">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead
                  sortable
                  columnKey="title"
                  onSort={handleSort}
                  sortDirection={
                    sortColumn === "title" ? sortDirection : undefined
                  }
                  isSorted={sortColumn === "title"}
                >
                  Title
                </TableHead>
                <TableHead
                  sortable
                  columnKey="description"
                  onSort={handleSort}
                  sortDirection={
                    sortColumn === "description" ? sortDirection : undefined
                  }
                  isSorted={sortColumn === "description"}
                >
                  Description
                </TableHead>
                <TableHead
                  sortable
                  columnKey="assignedTo"
                  onSort={handleSort}
                  sortDirection={
                    sortColumn === "assignedTo" ? sortDirection : undefined
                  }
                  isSorted={sortColumn === "assignedTo"}
                >
                  <div className="flex items-center">
                    Assigned To
                    <FilterPopover
                      options={tasks
                        .map((t) => ({
                          label: t.assignedTo,
                          value: t.assignedTo,
                        }))
                        .filter(
                          (v, i, a) =>
                            a.findIndex((t) => t.value === v.value) === i
                        )}
                      onFilterChange={(options) =>
                        handleFilterChange("assignedTo", options)
                      }
                      title="Filter by Assignee"
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
                  columnKey="priority"
                  onSort={handleSort}
                  sortDirection={
                    sortColumn === "priority" ? sortDirection : undefined
                  }
                  isSorted={sortColumn === "priority"}
                >
                  <div className="flex items-center">
                    Priority
                    <FilterPopover
                      options={priorityOptions}
                      onFilterChange={(options) =>
                        handleFilterChange("priority", options)
                      }
                      title="Filter by Priority"
                    />
                  </div>
                </TableHead>
                <TableHead
                  sortable
                  columnKey="dueDate"
                  onSort={handleSort}
                  sortDirection={
                    sortColumn === "dueDate" ? sortDirection : undefined
                  }
                  isSorted={sortColumn === "dueDate"}
                >
                  <div className="flex items-center">
                    Due Date
                    <FilterPopover
                      options={dueDateOptions}
                      onFilterChange={(options) =>
                        handleFilterChange("dueDate", options)
                      }
                      title="Filter by Due Date"
                    />
                  </div>
                </TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredAndSortedTasks.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={7}
                    className="text-center text-muted-foreground py-8"
                  >
                    No tasks found.
                  </TableCell>
                </TableRow>
              ) : (
                filteredAndSortedTasks.map((task) => (
                  <TableRow key={task.id}>
                    <TableCell className="font-medium">{task.title}</TableCell>
                    <TableCell className="max-w-xs truncate">
                      {task.description}
                    </TableCell>
                    <TableCell>{task.assignedTo}</TableCell>
                    <TableCell>
                      <span
                        className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                          task.status === "Completed"
                            ? "bg-green-100 text-green-800"
                            : task.status === "Blocked"
                            ? "bg-red-100 text-red-800"
                            : task.status === "In Progress"
                            ? "bg-blue-100 text-blue-800"
                            : "bg-yellow-100 text-yellow-800"
                        }`}
                      >
                        {task.status}
                      </span>
                    </TableCell>
                    <TableCell>
                      <span
                        className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                          task.priority === "High" ||
                          task.priority === "Critical"
                            ? "bg-red-100 text-red-800"
                            : task.priority === "Medium"
                            ? "bg-yellow-100 text-yellow-800"
                            : "bg-green-100 text-green-800"
                        }`}
                      >
                        {task.priority}
                      </span>
                    </TableCell>
                    <TableCell>{task.dueDate}</TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            setSelectedTask(task);
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
                            setSelectedTask(task);
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
