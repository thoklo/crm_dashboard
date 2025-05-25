"use client";

import { useMemo } from 'react';
import { 
  generateCustomers, 
  generateSales, 
  generateTasks, 
  fallbackCustomers,
  fallbackSales,
  fallbackTasks,
  type Customer,
  type Sale,
  type Task 
} from "./fakeData";
import { useDataSource } from './DataSourceContext';

// Define interfaces for API responses
interface ApiResponse<T> {
  data: T[];
  error?: string;
  isLoading: boolean;
}

// Real data API endpoints
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';

// Helper function for API calls
async function fetchFromApi<T>(endpoint: string): Promise<ApiResponse<T>> {
  try {
    const response = await fetch(`${API_BASE_URL}/${endpoint}`);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const data = await response.json();
    return { data, isLoading: false };
  } catch (error) {
    console.error(`API Error (${endpoint}):`, error);
    return {
      data: [],
      error: error instanceof Error ? error.message : 'Failed to fetch data',
      isLoading: false
    };
  }
}

// Data service hook
export function useDataService() {
  const { dataSource } = useDataSource();

  return useMemo(() => ({
    // Get customers
    async getCustomers(): Promise<ApiResponse<Customer>> {
      try {
        if (dataSource === "fake") {
          return {
            data: generateCustomers(30),
            isLoading: false
          };
        }
        return await fetchFromApi<Customer>("customers");
      } catch (error) {
        console.error('Error in getCustomers:', error);
        return {
          data: dataSource === "fake" ? fallbackCustomers : [],
          error: error instanceof Error ? error.message : 'Failed to load customers',
          isLoading: false
        };
      }
    },

    // Get tasks
    async getTasks(): Promise<ApiResponse<Task>> {
      try {
        if (dataSource === "fake") {
          return {
            data: generateTasks(20),
            isLoading: false
          };
        }
        return await fetchFromApi<Task>("tasks");
      } catch (error) {
        console.error('Error in getTasks:', error);
        return {
          data: dataSource === "fake" ? fallbackTasks : [],
          error: error instanceof Error ? error.message : 'Failed to load tasks',
          isLoading: false
        };
      }
    },

    // Get sales
    async getSales(): Promise<ApiResponse<Sale>> {
      try {
        if (dataSource === "fake") {
          return {
            data: generateSales(30),
            isLoading: false
          };
        }
        return await fetchFromApi<Sale>("sales");
      } catch (error) {
        console.error('Error in getSales:', error);
        return {
          data: dataSource === "fake" ? fallbackSales : [],
          error: error instanceof Error ? error.message : 'Failed to load sales',
          isLoading: false
        };
      }
    },

    // Add task
    async addTask(task: Omit<Task, "id">): Promise<ApiResponse<Task>> {
      try {
        if (dataSource === "fake") {
          const newTask: Task = {
            id: Math.floor(Math.random() * 10000),
            ...task
          };
          return {
            data: [newTask],
            isLoading: false
          };
        }
        
        const response = await fetch(`${API_BASE_URL}/tasks`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(task)
        });
        
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const data = await response.json();
        return { data: [data], isLoading: false };
      } catch (error) {
        console.error('Error in addTask:', error);
        return {
          data: [],
          error: error instanceof Error ? error.message : 'Failed to add task',
          isLoading: false
        };
      }
    }
  }), [dataSource]);
}
