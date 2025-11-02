"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { TrendingUp, Users, Clock, CheckCircle } from "lucide-react";

// Define a more flexible props interface
interface AssessmentSummaryProps {
  data: {
    overallScore: number;
    consistencyScore: number;
    clarityScore: number;
    completenessScore: number;
    // Make secondary metrics optional
    speakerCount?: number;
    duration?: string;
    wordCount?: number;
    keyTopics?: string[];
  };
}

export default function AssessmentSummary({ data }: AssessmentSummaryProps) {
  return (
    <div className="bg-white rounded-lg shadow-lg p-6">
      <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
				<TrendingUp className="h-6 w-6 text-blue-600" />
				Assessment Summary
			</h2>

			{/* Overall Score */}
			<Card className="mb-6">
				<CardHeader>
					<CardTitle className="flex items-center justify-between">
						Overall Score
						<Badge variant="secondary" className="text-2xl px-4 py-2">
							{data.overallScore}%
						</Badge>
					</CardTitle>
				</CardHeader>
				<CardContent>
					<Progress value={data.overallScore} className="h-3" />
					<p className="text-sm text-gray-600 mt-2">
						Based on consistency, clarity, and completeness metrics
					</p>
				</CardContent>
			</Card>

			{/* Detailed Scores */}
			<div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
				<Card>
					<CardHeader className="pb-3">
						<CardTitle className="text-sm">Consistency</CardTitle>
					</CardHeader>
					<CardContent>
						<div className="text-2xl font-bold text-blue-600">
							{data.consistencyScore}%
						</div>
						<Progress value={data.consistencyScore} className="h-2 mt-2" />
						<p className="text-xs text-gray-500 mt-1">
							Alignment between document and interview.
						</p>
					</CardContent>
				</Card>

				<Card>
					<CardHeader className="pb-3">
						<CardTitle className="text-sm">Clarity</CardTitle>
					</CardHeader>
					<CardContent>
						<div className="text-2xl font-bold text-green-600">
							{data.clarityScore}%
						</div>
						<Progress value={data.clarityScore} className="h-2 mt-2" />
						<p className="text-xs text-gray-500 mt-1">
							Clear and unambiguous statements.
						</p>
					</CardContent>
				</Card>

				<Card>
					<CardHeader className="pb-3">
						<CardTitle className="text-sm">Completeness</CardTitle>
					</CardHeader>
					<CardContent>
						<div className="text-2xl font-bold text-purple-600">
							{data.completenessScore}%
						</div>
						<Progress value={data.completenessScore} className="h-2 mt-2" />
						<p className="text-xs text-gray-500 mt-1">
							All questions addressed thoroughly.
						</p>
					</CardContent>
				</Card>
			</div>

			   {/* Key Metrics - Render only if data is available */}
			   {(data.speakerCount ||
			     data.duration ||
			     data.wordCount ||
			     data.keyTopics) && (
			     <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
			       {data.speakerCount && (
			         <div className="text-center p-4 bg-white rounded-lg border">
			           <Users className="h-8 w-8 text-blue-600 mx-auto mb-2" />
			           <div className="text-lg font-semibold">{data.speakerCount}</div>
			           <div className="text-sm text-gray-600">Speakers</div>
			         </div>
			       )}
			       {data.duration && (
			         <div className="text-center p-4 bg-white rounded-lg border">
			           <Clock className="h-8 w-8 text-green-600 mx-auto mb-2" />
			           <div className="text-lg font-semibold">{data.duration}</div>
			           <div className="text-sm text-gray-600">Duration</div>
			         </div>
			       )}
			       {data.wordCount && (
			         <div className="text-center p-4 bg-white rounded-lg border">
			           <TrendingUp className="h-8 w-8 text-purple-600 mx-auto mb-2" />
			           <div className="text-lg font-semibold">
			             {data.wordCount.toLocaleString()}
			           </div>
			           <div className="text-sm text-gray-600">Words</div>
			         </div>
			       )}
			       {data.keyTopics && (
			         <div className="text-center p-4 bg-white rounded-lg border">
			           <CheckCircle className="h-8 w-8 text-orange-600 mx-auto mb-2" />
			           <div className="text-lg font-semibold">
			             {data.keyTopics.length}
			           </div>
			           <div className="text-sm text-gray-600">Topics</div>
			         </div>
			       )}
			     </div>
			   )}
			 </div>
		);
}
