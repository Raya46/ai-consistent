"use client";

import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { mockSpeakers, Speaker } from "@/data/mockData";

interface SpeakersListProps {
  speakers?: Speaker[];
}

export default function SpeakersList({
  speakers = mockSpeakers,
}: SpeakersListProps) {
  return (
    <div>
      <h3 className="text-lg font-semibold mb-4">Speakers Detected</h3>
      <div className="space-y-3">
        {speakers.map((speaker) => (
          <div
            key={speaker.id}
            className="flex items-center justify-between p-3 bg-white rounded-lg border border-gray-200"
          >
            <div className="flex items-center gap-3">
              <Avatar className="h-10 w-10">
                <AvatarFallback
                  className={`${speaker.color} text-white font-semibold`}
                >
                  {speaker.name.charAt(0).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <div>
                <p className="font-medium text-gray-900">{speaker.name}</p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
