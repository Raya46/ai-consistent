import AutoTranscribeContent from "@/components/auto-transcribe/auto-transcribe-content";
import { Suspense } from "react";

export default function AutoTranscribePage() {
	return (
		<div className="min-h-screen bg-gray-50">
			<Suspense fallback={<div>Loading...</div>}>
				<AutoTranscribeContent />
			</Suspense>
		</div>
	);
}
