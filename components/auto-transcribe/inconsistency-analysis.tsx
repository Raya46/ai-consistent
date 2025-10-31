"use client";

import { Card, CardContent } from "@/components/ui/card";
import { AlertTriangle, HelpCircle, CheckCheck } from "lucide-react";
import { mockInconsistencyData, InconsistencyItem } from "@/data/mockData";

interface InconsistencyAnalysisProps {
  data?: typeof mockInconsistencyData;
}

export default function InconsistencyAnalysis({
  data = mockInconsistencyData,
}: InconsistencyAnalysisProps) {
  const InconsistencyCard = ({
    item,
    type,
  }: {
    item: InconsistencyItem;
    type: "inconsistent" | "needClarification" | "aligned";
  }) => {
    const getCardStyles = () => {
      switch (type) {
        case "inconsistent":
          return "border-red-200 bg-red-50";
        case "needClarification":
          return "border-yellow-200 bg-yellow-50";
        case "aligned":
          return "border-green-200 bg-green-50";
      }
    };

    const getDotColor = () => {
      switch (type) {
        case "inconsistent":
          return "bg-red-500";
        case "needClarification":
          return "bg-yellow-500";
        case "aligned":
          return "bg-green-500";
      }
    };

    return (
      <Card className={getCardStyles()}>
        <CardContent className="p-4">
          <div className="flex items-start gap-3">
            <div
              className={`h-2 w-2 rounded-full ${getDotColor()} mt-2 flex-shrink-0`}
            ></div>
            <div className="flex-1">
              <h4 className="font-medium text-gray-900 mb-2">{item.title}</h4>
              <div className="space-y-1 text-sm">
                <p className="text-gray-600">
                  <span className="font-medium">Document:</span> {item.document}
                </p>
                <p className="text-gray-600">
                  <span className="font-medium">Interview:</span>{" "}
                  {item.interview}
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  };

  return (
    <div className="bg-white rounded-lg shadow-lg p-6">
      <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
        <AlertTriangle className="h-6 w-6 text-red-600" />
        Inconsistency Analysis
      </h2>

      {/* Summary Stats */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        <div className="text-center p-4 bg-red-50 rounded-lg border border-red-200">
          <AlertTriangle className="h-8 w-8 text-red-600 mx-auto mb-2" />
          <div className="text-2xl font-bold text-red-600">
            {data.inconsistent.length}
          </div>
          <div className="text-sm text-gray-600">Inconsistent</div>
        </div>

        <div className="text-center p-4 bg-yellow-50 rounded-lg border border-yellow-200">
          <HelpCircle className="h-8 w-8 text-yellow-600 mx-auto mb-2" />
          <div className="text-2xl font-bold text-yellow-600">
            {data.needClarification.length}
          </div>
          <div className="text-sm text-gray-600">Need Clarification</div>
        </div>

        <div className="text-center p-4 bg-green-50 rounded-lg border border-green-200">
          <CheckCheck className="h-8 w-8 text-green-600 mx-auto mb-2" />
          <div className="text-2xl font-bold text-green-600">
            {data.aligned.length}
          </div>
          <div className="text-sm text-gray-600">Aligned</div>
        </div>
      </div>

      {/* Inconsistent Items */}
      <div className="mb-6">
        <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <AlertTriangle className="h-5 w-5 text-red-500" />
          Inconsistent
        </h3>
        <div className="space-y-3">
          {data.inconsistent.map((item) => (
            <InconsistencyCard key={item.id} item={item} type="inconsistent" />
          ))}
        </div>
      </div>

      {/* Need Clarification Items */}
      <div className="mb-6">
        <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <HelpCircle className="h-5 w-5 text-yellow-500" />
          Need Clarification
        </h3>
        <div className="space-y-3">
          {data.needClarification.map((item) => (
            <InconsistencyCard
              key={item.id}
              item={item}
              type="needClarification"
            />
          ))}
        </div>
      </div>

      {/* Aligned Items */}
      <div>
        <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <CheckCheck className="h-5 w-5 text-green-500" />
          Aligned
        </h3>
        <div className="space-y-3">
          {data.aligned.map((item) => (
            <InconsistencyCard key={item.id} item={item} type="aligned" />
          ))}
        </div>
      </div>
    </div>
  );
}
