"use client";

import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";

export default function HomePage() {
  const router = useRouter();

  return (
    <div className="min-h-screen bg-linear-to-b from-gray-50 to-blue-600 flex flex-col items-center justify-center p-4">
      <div className="text-center max-w-3xl">
        <h1 className="text-5xl md:text-6xl font-bold mb-6 bg-linear-to-r from-gray-900 to-gray-600 dark:from-gray-100 dark:to-gray-400 bg-clip-text text-transparent">
          AI-Powered Consistency Check
        </h1>
        <p className="text-xl mb-8 text-gray-600 dark:text-gray-300">
          Detect inconsistencies between interview responses and documents
          automatically using advanced AI analysis
        </p>
        <Button onClick={() => router.push("/home")}>Get Started</Button>
      </div>
    </div>
  );
}
