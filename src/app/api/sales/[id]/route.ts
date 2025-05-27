import { NextResponse } from 'next/server';
import { readJsonFile, writeJsonFile } from '@/lib/jsonUtils';
import { saleSchema, saleFormSchema } from '@/lib/schemas';
import { Sale } from "@/lib/fakeData";
import { z } from "zod";

interface RouteParams {
  params: { id: string };
}

export async function GET(request: Request, { params }: RouteParams) {
  try {
    const id = parseInt(params.id);
    const data = await readJsonFile("sales.json");
    const sale = data.sales.find((t: Sale) => t.id === id);

    if (!sale) {
      return NextResponse.json({ error: "Sale not found" }, { status: 404 });
    }

    // Validate the sale data before returning
    const validatedSale = saleSchema.parse(sale);
    return NextResponse.json(validatedSale);
  } catch (error) {
    console.error("Error fetching sale:", error);
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
      { error: "Failed to fetch sale" },
      { status: 500 }
    );
  }
}

export async function PUT(request: Request, { params }: RouteParams) {
  try {
    const id = parseInt(params.id);
    const updates = await request.json();
    // Use form schema for updates as we don't want to allow changing id or createdAt
    const validatedUpdates = saleFormSchema.parse(updates);

    const data = await readJsonFile("sales.json");
    const index = data.sales.findIndex((t: Sale) => t.id === id);

    if (index === -1) {
      return NextResponse.json({ error: "Sale not found" }, { status: 404 });
    }
    const existingSale = data.sales[index];
    const updatedSale = saleSchema.parse({
      ...existingSale,
      ...validatedUpdates,
      id, // Ensure ID doesn't change
      createdAt: existingSale.createdAt, // Preserve original createdAt
      date: validatedUpdates.date
        ? validatedUpdates.date instanceof Date
          ? validatedUpdates.date
          : new Date(validatedUpdates.date)
        : existingSale.date,
    });

    data.sales[index] = updatedSale;
    await writeJsonFile("sales.json", data);
    return NextResponse.json(updatedSale);
  } catch (error) {
    console.error("Error updating sale:", error);
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
      { error: "Failed to update sale" },
      { status: 500 }
    );
  }
}

export async function DELETE(request: Request, { params }: RouteParams) {
  try {
    const id = parseInt(params.id);
    const data = await readJsonFile("sales.json");
    const index = data.sales.findIndex((t: Sale) => t.id === id);

    if (index === -1) {
      return NextResponse.json({ error: "Sale not found" }, { status: 404 });
    }

    data.sales.splice(index, 1);
    await writeJsonFile("sales.json", data);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting sale:", error);
    return NextResponse.json(
      { error: "Failed to delete sale" },
      { status: 500 }
    );
  }
}
