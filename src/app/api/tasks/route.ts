import { NextResponse } from 'next/server';
import { readJsonFile, writeJsonFile } from '@/lib/jsonUtils';
import { taskSchema, taskFormSchema } from '@/lib/schemas';
import type { Task } from '@/lib/fakeData';

export async function GET(){
  try {
    const data = await readJsonFile('tasks.json');
    return NextResponse.json(data.tasks);
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to fetch tasks' },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const taskData = await request.json();
    
    // Validate the incoming data using the form schema
    const validatedTask = taskFormSchema.parse(taskData);
    
    const data = await readJsonFile('tasks.json');
    
    // Generate a new ID
    const newId = data.tasks.length > 0 
      ? Math.max(...data.tasks.map((t: Task) => t.id)) + 1 
      : 1;
      const newTask = taskSchema.parse({
      id: newId,
      ...validatedTask,
      createdAt: new Date().toISOString().split('T')[0]
    });
    
    data.tasks.push(newTask);
    await writeJsonFile('tasks.json', data);
    
    return NextResponse.json(newTask);
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to create task' },
      { status: 500 }
    );
  }
}
