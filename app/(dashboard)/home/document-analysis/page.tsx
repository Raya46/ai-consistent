import DocumentAnalysisContent from "@/components/document-analysis/document-analysis-content";
import { Suspense } from "react";

export default function DocumentAnalysisPage() {
	return (
		<div className="min-h-screen bg-gray-50">
			<Suspense fallback={<div>Loading...</div>}>
				<DocumentAnalysisContent />
			</Suspense>
		</div>
	);
}
