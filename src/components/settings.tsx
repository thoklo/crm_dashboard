"use client";

import { useDataSource } from "@/lib/DataSourceContext";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

export function Settings() {
  const { dataSource, setDataSource } = useDataSource();

  return (
    <Card className="p-6">
      <h2 className="text-2xl font-semibold mb-4">Data Source Settings</h2>
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="font-medium">Current Data Source</p>
            <p className="text-sm text-muted-foreground">
              {dataSource === "fake" ? "Using Demo Data" : "Using Real Data"}
            </p>
          </div>
          <Button
            variant="outline"
            onClick={() => setDataSource(dataSource === "fake" ? "real" : "fake")}
          >
            Switch to {dataSource === "fake" ? "Real" : "Demo"} Data
          </Button>
        </div>
        <div className="text-sm text-muted-foreground mt-4">
          <p>Demo Data: Uses generated data for testing and demonstration.</p>
          <p>Real Data: Connects to your actual data source.</p>
        </div>
      </div>
    </Card>
  );
}
