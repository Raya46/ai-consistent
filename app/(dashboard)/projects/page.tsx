"use client";

import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
	FileText,
	Mic,
	BarChart3,
	Calendar,
	Clock,
	MoreHorizontal,
} from "lucide-react";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

// Mock data for project history
const projects = [
	{
		id: 1,
		title: "Document Analysis - CV Review",
		type: "document-analysis",
		description: "Analyzed resume and cover letter for consistency checks",
		date: "2024-01-15",
		time: "14:30",
		status: "completed",
		icon: FileText,
		resultCount: 3,
		issues: "2 inconsistencies found",
	},
	{
		id: 2,
		title: "Interview Transcription - Technical Interview",
		type: "auto-transcribe",
		description: "Transcribed 45-minute technical interview with 2 speakers",
		date: "2024-01-14",
		time: "10:15",
		status: "completed",
		icon: Mic,
		resultCount: 5,
		issues: "5 inconsistencies detected",
	},
	{
		id: 3,
		title: "Document Analysis - Financial Report",
		type: "document-analysis",
		description: "Reviewed quarterly financial statements for verification",
		date: "2024-01-13",
		time: "16:45",
		status: "in-progress",
		icon: FileText,
		resultCount: 0,
		issues: "Processing...",
	},
	{
		id: 4,
		title: "Risk Dashboard - Q1 Assessment",
		type: "risk-dashboard",
		description: "Comprehensive risk assessment for Q1 2024",
		date: "2024-01-12",
		time: "09:00",
		status: "completed",
		icon: BarChart3,
		resultCount: 8,
		issues: "8 risk indicators identified",
	},
	{
		id: 5,
		title: "Interview Transcription - HR Interview",
		type: "auto-transcribe",
		description: "Transcribed HR interview with candidate assessment",
		date: "2024-01-11",
		time: "13:20",
		status: "completed",
		icon: Mic,
		resultCount: 2,
		issues: "2 minor inconsistencies",
	},
	{
		id: 6,
		title: "Document Analysis - Contract Review",
		type: "document-analysis",
		description: "Legal contract analysis for compliance verification",
		date: "2024-01-10",
		time: "11:30",
		status: "completed",
		icon: FileText,
		resultCount: 4,
		issues: "4 compliance issues found",
	},
];

const getTypeColor = (type: string) => {
	switch (type) {
		case "document-analysis":
			return "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300";
		case "auto-transcribe":
			return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300";
		case "risk-dashboard":
			return "bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-300";
		default:
			return "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300";
	}
};

const getStatusColor = (status: string) => {
	switch (status) {
		case "completed":
			return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300";
		case "in-progress":
			return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300";
		case "failed":
			return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300";
		default:
			return "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300";
	}
};

export default function ProjectsPage() {
	return (
		<div className="min-h-screen p-6">
			<div className="mb-8">
				<h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
					Project History
				</h1>
				<p className="text-gray-600 dark:text-gray-300">
					View and manage your analysis and transcription history
				</p>
			</div>

			<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
				{projects.map((project) => (
					<Card key={project.id} className="hover:shadow-lg transition-shadow">
						<CardHeader className="pb-3">
							<div className="flex items-start justify-between">
								<div className="flex items-center space-x-3">
									<div className="p-2 rounded-lg bg-gray-100 dark:bg-gray-800">
										<project.icon className="h-5 w-5 text-gray-600 dark:text-gray-300" />
									</div>
									<div className="flex-1 min-w-0">
										<CardTitle className="text-lg font-semibold truncate">
											{project.title}
										</CardTitle>
										<div className="flex items-center space-x-2 mt-1">
											<Badge className={getTypeColor(project.type)}>
												{project.type.replace("-", " ")}
											</Badge>
											<Badge className={getStatusColor(project.status)}>
												{project.status}
											</Badge>
										</div>
									</div>
								</div>
								<DropdownMenu>
									<DropdownMenuTrigger asChild>
										<Button variant="ghost" size="icon" className="h-8 w-8">
											<MoreHorizontal className="h-4 w-4" />
										</Button>
									</DropdownMenuTrigger>
									<DropdownMenuContent align="end">
										<DropdownMenuItem>View Details</DropdownMenuItem>
										<DropdownMenuItem>Download Report</DropdownMenuItem>
										<DropdownMenuItem>Delete Project</DropdownMenuItem>
									</DropdownMenuContent>
								</DropdownMenu>
							</div>
						</CardHeader>
						<CardContent>
							<CardDescription className="mb-4 line-clamp-2">
								{project.description}
							</CardDescription>

							<div className="space-y-3">
								<div className="flex items-center justify-between text-sm">
									<div className="flex items-center text-gray-500 dark:text-gray-400">
										<Calendar className="h-4 w-4 mr-1" />
										{project.date}
									</div>
									<div className="flex items-center text-gray-500 dark:text-gray-400">
										<Clock className="h-4 w-4 mr-1" />
										{project.time}
									</div>
								</div>

								<div className="flex items-center justify-between text-sm">
									<span className="text-gray-600 dark:text-gray-300">
										{project.resultCount} results
									</span>
									<span
										className={`font-medium ${
											project.issues.includes("inconsistenc") ||
											project.issues.includes("issues")
												? "text-red-600 dark:text-red-400"
												: "text-gray-600 dark:text-gray-300"
										}`}
									>
										{project.issues}
									</span>
								</div>

								<Button className="w-full mt-3" variant="outline">
									View Project
								</Button>
							</div>
						</CardContent>
					</Card>
				))}
			</div>
		</div>
	);
}
