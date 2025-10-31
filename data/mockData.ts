export interface InconsistencyItem {
  id: number;
  title: string;
  document: string;
  interview: string;
  severity: "high" | "medium" | "low" | "none";
}

export interface ScoringData {
  overallScore: number;
  consistencyScore: number;
  clarityScore: number;
  completenessScore: number;
  speakerCount: number;
  duration: string;
  wordCount: number;
  keyTopics: string[];
}

export interface Speaker {
  id: number;
  name: string;
  color: string;
}

export const mockInconsistencyData = {
  inconsistent: [
    {
      id: 1,
      title: "Annual Revenue",
      document: "Reported annual revenue = 100,000,000 IDR",
      interview: "Reported annual revenue = 200,000,000 IDR",
      severity: "high" as const,
    },
    {
      id: 2,
      title: "Work Experience",
      document: "Previous company duration = 2 years",
      interview: "Previous company duration = 3 years",
      severity: "medium" as const,
    },
  ],
  needClarification: [
    {
      id: 3,
      title: "Project Timeline",
      document: "Project completed in Q4 2023",
      interview: "Project finished around end of year",
      severity: "low" as const,
    },
    {
      id: 4,
      title: "Team Size",
      document: "Managed team of 5-7 people",
      interview: "Led a small team",
      severity: "low" as const,
    },
  ],
  aligned: [
    {
      id: 5,
      title: "Education",
      document: "Bachelor's degree in Computer Science",
      interview: "CS graduate from university",
      severity: "none" as const,
    },
    {
      id: 6,
      title: "Technical Skills",
      document: "Proficient in React, Node.js, Python",
      interview: "Experience with React, Node.js, Python",
      severity: "none" as const,
    },
  ],
};

export const mockScoringData: ScoringData = {
  overallScore: 85,
  consistencyScore: 78,
  clarityScore: 92,
  completenessScore: 88,
  speakerCount: 3,
  duration: "45:32",
  wordCount: 5432,
  keyTopics: ["Experience", "Education", "Skills", "Projects"],
};

export const mockSpeakers: Speaker[] = [
  { id: 1, name: "Kenny", color: "bg-blue-500" },
  { id: 2, name: "Interviewer", color: "bg-green-500" },
  { id: 3, name: "Sarah", color: "bg-purple-500" },
];
