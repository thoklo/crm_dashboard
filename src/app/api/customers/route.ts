import { NextResponse } from 'next/server';
import { readJsonFile, writeJsonFile } from '@/lib/jsonUtils';
import { customerSchema, customerFormSchema } from '@/lib/schemas';
import { Customer } from '@/lib/dataService';
import { z } from 'zod';

export async function GET() {
  try {
    const data = await readJsonFile('customers.json');
    // Validate the response data
    const customers = z.array(customerSchema).parse(data.customers);
    return NextResponse.json(customers);
  } catch (error) {
    console.error('Error fetching customers:', error);
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: 'Invalid data format' }, { status: 400 });
    }
    return NextResponse.json({ error: 'Failed to fetch customers' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const customerData = await request.json();
    // Validate the incoming data using the form schema
    const validatedCustomer = customerFormSchema.parse(customerData);
    
    const data = await readJsonFile('customers.json');
    const newId = data.customers.length > 0 
      ? Math.max(...data.customers.map((t: Customer) => t.id)) + 1 
      : 1;
    
    const newCustomer = customerSchema.parse({ 
      id: newId, 
      ...validatedCustomer, 
      createdAt: new Date().toISOString().split('T')[0] 
    });
    
    data.customers.push(newCustomer);
    await writeJsonFile('customers.json', data);
    return NextResponse.json(newCustomer);
  } catch (error) {
    console.error('Error creating customer:', error);
    if (error instanceof z.ZodError) {
      return NextResponse.json({ 
        error: 'Invalid customer data', 
        details: error.errors 
      }, { status: 400 });
    }
    return NextResponse.json({ error: 'Failed to create customer' }, { status: 500 });
  }
}
