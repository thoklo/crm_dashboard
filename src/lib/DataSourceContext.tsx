"use client";

import React, { createContext, useContext, useState, useEffect } from "react";

type DataSourceType = "fake" | "real";

interface DataSourceContextType {
  dataSource: DataSourceType;
  setDataSource: (source: DataSourceType) => void;
  clearError: () => void;
  error?: string;
}

const DataSourceContext = createContext<DataSourceContextType | undefined>(undefined);

export function DataSourceProvider({ children }: { children: React.ReactNode }) {
  const [dataSource, setDataSource] = useState<DataSourceType>(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("crmDataSource");
      return (saved as DataSourceType) || "fake";
    }
    return "fake";
  });
  const [error, setError] = useState<string | undefined>(undefined);

  const handleSetDataSource = (source: DataSourceType) => {
    try {
      setDataSource(source);
      setError(undefined);
    } catch (err: unknown) {
      console.error("Error switching data source:", err);
      setError("Failed to switch data source. Please try again.");
      // Keep the current data source if there's an error
    }
  };

  const clearError = () => setError(undefined);

  useEffect(() => {
    localStorage.setItem("crmDataSource", dataSource);
  }, [dataSource]);

  return (
    <DataSourceContext.Provider
      value={{
        dataSource,
        setDataSource: handleSetDataSource,
        error,
        clearError,
      }}
    >
      {children}
    </DataSourceContext.Provider>
  );
}

export function useDataSource() {
  const context = useContext(DataSourceContext);
  if (context === undefined) {
    throw new Error("useDataSource must be used within a DataSourceProvider");
  }
  return context;
}
