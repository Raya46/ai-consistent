import { Loader2 } from "lucide-react";

interface LoaderProps {
  status: string;
}

export default function Loader({ status }: LoaderProps) {
  return (
    <div className="flex flex-col items-center justify-center gap-4 p-8 bg-background rounded-lg shadow-lg">
      <Loader2 className="h-12 w-12 animate-spin text-blue-600" />
      <p className="text-lg font-medium text-gray-700">{status}</p>
    </div>
  );
}