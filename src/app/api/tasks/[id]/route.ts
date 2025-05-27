import { NextResponse } from 'next/server';
import { readJsonFile, writeJsonFile } from '@/lib/jsonUtils';
import { taskSchema, taskFormSchema } from '@/lib/schemas';
import type { Task } from '@/lib/fakeData';

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {    
    const data = await readJsonFile('tasks.json');
    const task = data.tasks.find((t: Task) => t.id === parseInt(params.id));
    
    if (!task) {
      return NextResponse.json(
        { error: 'Task not found' },
        { status: 404 }
      );
    }
    
    // Validate the task before returning
    const validatedTask = taskSchema.parse(task);
    return NextResponse.json(validatedTask);
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to fetch task' },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const updates = await request.json();
    // Validate the update data
    const validatedUpdates = taskFormSchema.parse(updates);
    
    const data = await readJsonFile('tasks.json');
    
    const index = data.tasks.findIndex((t: Task) => t.id === parseInt(params.id));
    if (index === -1) {
      return NextResponse.json({ error: "Task not found" }, { status: 404 });
    }
    // Create and validate the updated task
    const existingTask = data.tasks[index];
    const updatedTask = taskSchema.parse({
      ...existingTask,
      ...validatedUpdates,
      id: parseInt(params.id), // Ensure ID doesn't change
      createdAt: existingTask.createdAt, // Preserve original createdAt
    });
    
    data.tasks[index] = updatedTask;
    await writeJsonFile('tasks.json', data);
    
    return NextResponse.json(updatedTask);
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to update task' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const data = await readJsonFile('tasks.json');
    
    const index = data.tasks.findIndex((t: Task) => t.id === parseInt(params.id));
    if (index === -1) {
      return NextResponse.json(
        { error: 'Task not found' },
        { status: 404 }
      );
    }
    
    data.tasks.splice(index, 1);
    await writeJsonFile('tasks.json', data);
    
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to delete task' },
      { status: 500 }
    );
  }
}
