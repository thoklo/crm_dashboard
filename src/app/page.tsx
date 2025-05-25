"use client";

import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { useDataSource } from "@/lib/DataSourceContext";

export default function Home() {
  const router = useRouter();
  const { setDataSource } = useDataSource();

  const handleModeSelect = (mode: "fake" | "real") => {
    setDataSource(mode);
    router.push("/dashboard");
  };

  return (
    <main className="min-h-screen bg-gradient-to-b from-blue-50 to-white dark:from-gray-900 dark:to-gray-800 p-6">
      <div className="max-w-4xl mx-auto pt-20">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold mb-4 text-gray-900 dark:text-white">
            Welcome to CRM Dashboard
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-300">
            Choose your data source to get started
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-8 mt-12">
          <Card className="p-6 hover:shadow-lg transition-shadow cursor-pointer">
            <div
              className="text-center"
              onClick={() => handleModeSelect("fake")}
            >
              <h2 className="text-2xl font-semibold mb-4">Demo Mode</h2>
              <p className="text-gray-600 dark:text-gray-400 mb-6">
                Try out the CRM with pre-populated fake data. Perfect for
                exploring features and testing.
              </p>
              <Button
                className="w-full bg-blue-600 hover:bg-blue-700"
                onClick={() => handleModeSelect("fake")}
              >
                Use Demo Data
              </Button>
            </div>
          </Card>

          <Card className="p-6 hover:shadow-lg transition-shadow cursor-pointer">
            <div
              className="text-center"
              onClick={() => handleModeSelect("real")}
            >
              <h2 className="text-2xl font-semibold mb-4">Production Mode</h2>
              <p className="text-gray-600 dark:text-gray-400 mb-6">
                Connect to your real data source for actual business operations.
              </p>
              <Button
                className="w-full"
                variant="outline"
                onClick={() => handleModeSelect("real")}
              >
                Use Real Data
              </Button>
            </div>
          </Card>
        </div>

        <div className="mt-12 text-center text-sm text-gray-500 dark:text-gray-400">
          You can change this setting later from the dashboard settings
        </div>
      </div>
    </main>
  );
}
