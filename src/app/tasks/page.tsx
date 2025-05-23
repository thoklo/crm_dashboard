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
import { TaskForm } from "@/components/task-form";
import { generateTasks, fallbackTasks, type Task } from "@/lib/fakeData";
import type { TaskFormValues } from "@/lib/schemas";

type SortKey = keyof Task;

export default function TasksPage() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [dialogMode, setDialogMode] = useState<"add" | "edit" | "view">("add");
  const [sortColumn, setSortColumn] = useState<SortKey>("dueDate"); // Default sort by Due Date
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("desc"); // Newest First

  useEffect(() => {
    try {
      const fakeTasks = generateTasks(20);
      setTasks(fakeTasks);
    } catch (error) {
      console.warn("Using fallback data:", error);
      setTasks(fallbackTasks);
    } finally {
      setLoading(false);
    }
  }, []);
  const handleAddTask = (data: TaskFormValues) => {
    const newTask: Task = {
      id: tasks.length + 1,
      ...data,
      status: data.status,
      priority: data.priority,
      createdAt: new Date().toISOString().split("T")[0],
    };

    setTasks([...tasks, newTask]);
    setDialogOpen(false);
  };

  const handleSort = (columnKey: SortKey) => {
    if (sortColumn === columnKey) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortColumn(columnKey);
      setSortDirection("asc");
    }
  };

  const sortedTasks = useMemo(() => {
    const sortableTasks = [...tasks];
    if (!sortColumn) return sortableTasks;

    sortableTasks.sort((a, b) => {
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
      // Handle date comparisons for string/number values that can be parsed as dates
      const dateA = new Date(aValue);
      const dateB = new Date(bValue);
      if (!isNaN(dateA.getTime()) && !isNaN(dateB.getTime())) {
        return sortDirection === "asc"
          ? dateA.getTime() - dateB.getTime()
          : dateB.getTime() - dateA.getTime();
      }

      if (aValue < bValue) {
        return sortDirection === "asc" ? -1 : 1;
      }
      if (aValue > bValue) {
        return sortDirection === "asc" ? 1 : -1;
      }
      return 0;
    });
    return sortableTasks;
  }, [tasks, sortColumn, sortDirection]);

  if (loading) {
    return (
      <main className="p-6">
        <div className="flex justify-center items-center h-64">
          <div className="text-muted-foreground">Loading tasks...</div>
        </div>
      </main>
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
                  Assigned To
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
                <TableHead
                  sortable
                  columnKey="priority"
                  onSort={handleSort}
                  sortDirection={
                    sortColumn === "priority" ? sortDirection : undefined
                  }
                  isSorted={sortColumn === "priority"}
                >
                  Priority
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
                  Due Date
                </TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {sortedTasks.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={7}
                    className="text-center text-muted-foreground py-8"
                  >
                    No tasks found.
                  </TableCell>
                </TableRow>
              ) : (
                sortedTasks.map((task) => (
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
