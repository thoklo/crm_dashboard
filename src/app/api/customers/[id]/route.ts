import { NextResponse } from 'next/server';
import { readJsonFile, writeJsonFile } from '@/lib/jsonUtils';
import { customerSchema, customerFormSchema } from '@/lib/schemas';
import { Customer } from '@/lib/dataService';
import { z } from 'zod';

interface RouteParams {
  params: { id: string };
}

export async function GET(request: Request, { params }: RouteParams) {
  try {
    const id = parseInt(params.id);
    const data = await readJsonFile('customers.json');
    const customer = data.customers.find((t: Customer) => t.id === id);
    
    if (!customer) {
      return NextResponse.json({ error: 'Customer not found' }, { status: 404 });
    }
    
    // Validate the customer data before returning
    const validatedCustomer = customerSchema.parse(customer);
    return NextResponse.json(validatedCustomer);
  } catch (error) {
    console.error('Error fetching customer:', error);
    if (error instanceof z.ZodError) {
      return NextResponse.json({ 
        error: 'Invalid customer data', 
        details: error.errors 
      }, { status: 400 });
    }
    return NextResponse.json({ error: 'Failed to fetch customer' }, { status: 500 });
  }
}

export async function PUT(request: Request, { params }: RouteParams) {
  try {
    const id = parseInt(params.id);
    const updates = await request.json();
    // Use form schema for updates as we don't want to allow changing id or createdAt
    const validatedUpdates = customerFormSchema.parse(updates);
    
    const data = await readJsonFile('customers.json');
    const index = data.customers.findIndex((t: Customer) => t.id === id);
    
    if (index === -1) {
      return NextResponse.json({ error: 'Customer not found' }, { status: 404 });
    }
    
    const existingCustomer = data.customers[index];
    const updatedCustomer = customerSchema.parse({
      ...existingCustomer,
      ...validatedUpdates,
      id, // Ensure ID doesn't change
      createdAt: existingCustomer.createdAt, // Preserve original createdAt
    });
    
    data.customers[index] = updatedCustomer;
    await writeJsonFile('customers.json', data);
    return NextResponse.json(updatedCustomer);
  } catch (error) {
    console.error('Error updating customer:', error);
    if (error instanceof z.ZodError) {
      return NextResponse.json({ 
        error: 'Invalid customer data', 
        details: error.errors 
      }, { status: 400 });
    }
    return NextResponse.json({ error: 'Failed to update customer' }, { status: 500 });
  }
}

export async function DELETE(request: Request, { params }: RouteParams) {
  try {
    const id = parseInt(params.id);
    const data = await readJsonFile('customers.json');
    const index = data.customers.findIndex((t: Customer) => t.id === id);
    
    if (index === -1) {
      return NextResponse.json({ error: 'Customer not found' }, { status: 404 });
    }
    
    data.customers.splice(index, 1);
    await writeJsonFile('customers.json', data);
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to delete customer' }, { status: 500 });
  }
}
