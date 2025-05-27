import { NextResponse } from 'next/server';
import { readJsonFile, writeJsonFile } from '@/lib/jsonUtils';
import { saleSchema, saleFormSchema } from '@/lib/schemas';
import { Sale } from "@/lib/fakeData";
import { z } from "zod";

export async function GET() {
  try {
    const data = await readJsonFile("sales.json");
    // Validate all sales data before returning
    const validatedSales = z.array(saleSchema).parse(data.sales);
    return NextResponse.json(validatedSales);
  } catch (error) {
    console.error("Error fetching sales:", error);
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        {
          error: "Invalid sales data format",
          details: error.errors,
        },
        { status: 400 }
      );
    }
    return NextResponse.json(
      { error: "Failed to fetch sales" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const saleData = await request.json();
    // Validate the incoming data using the form schema
    const validatedSale = saleFormSchema.parse(saleData);

    const data = await readJsonFile("sales.json");
    const newId =
      data.sales.length > 0
        ? Math.max(...data.sales.map((t: Sale) => t.id)) + 1
        : 1;

    const newSale = saleSchema.parse({
      id: newId,
      ...validatedSale,
      createdAt: new Date().toISOString(),
      date:
        validatedSale.date instanceof Date
          ? validatedSale.date
          : new Date(validatedSale.date),
    });

    data.sales.push(newSale);
    await writeJsonFile("sales.json", data);
    return NextResponse.json(newSale);
  } catch (error) {
    console.error("Error creating sale:", error);
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        {
          error: "Invalid sale data",
          details: error.errors,
        },
        { status: 400 }
      );
    }
    return NextResponse.json(
      { error: "Failed to create sale" },
      { status: 500 }
    );
  }
}
