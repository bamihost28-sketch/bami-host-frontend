import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Issue } from "@/services/estatesApi";
import {
  Droplets, Zap, AirVent, Shield, SprayCan, Wrench, Wifi, Building,
  ChevronDown, ChevronUp, ImageIcon, Video, CheckCircle2, Circle, Clock
} from "lucide-react";

const STAGE_ORDER: Issue["status"][] = ["review", "started", "inprogress", "completed"];

const STAGE_LABELS: Record<Issue["status"], string> = {
  review: "Review",
  started: "Started",
  inprogress: "In Progress",
  completed: "Completed",
};

const getCategoryIcon = (category: string) => {
  switch (category) {
    case "plumbing": return Droplets;
    case "electrical": return Zap;
    case "ac_repair": return AirVent;
    case "security": return Shield;
    case "cleaning": return SprayCan;
    case "internet": return Wifi;
    case "structural": return Building;
    default: return Wrench;
  }
};

const getPriorityClass = (priority: string) => {
  switch (priority) {
    case "urgent": return "bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400";
    case "high": return "bg-orange-100 text-orange-800 dark:bg-orange-900/20 dark:text-orange-400";
    case "medium": return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400";
    default: return "bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300";
  }
};

interface StageTrackerProps {
  currentStatus: Issue["status"];
}

const StageTracker: React.FC<StageTrackerProps> = ({ currentStatus }) => {
  const currentIdx = STAGE_ORDER.indexOf(currentStatus);

  return (
    <div className="flex items-center gap-0 mt-3">
      {STAGE_ORDER.map((stage, i) => {
        const done = i < currentIdx;
        const active = i === currentIdx;
        const upcoming = i > currentIdx;

        return (
          <div key={stage} className="flex items-center flex-1">
            <div className="flex flex-col items-center">
              <div className={`h-6 w-6 rounded-full flex items-center justify-center border-2 transition-colors ${
                done
                  ? "border-green-500 bg-green-500 text-white"
                  : active
                  ? "border-blue-500 bg-blue-500 text-white"
                  : "border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800"
              }`}>
                {done ? (
                  <CheckCircle2 className="h-3.5 w-3.5" />
                ) : active ? (
                  <Clock className="h-3 w-3" />
                ) : (
                  <Circle className="h-3 w-3 text-slate-300 dark:text-slate-600" />
                )}
              </div>
              <span className={`text-[10px] mt-1 font-medium whitespace-nowrap ${
                done ? "text-green-600 dark:text-green-400"
                : active ? "text-blue-600 dark:text-blue-400"
                : "text-slate-400 dark:text-slate-500"
              }`}>
                {STAGE_LABELS[stage]}
              </span>
            </div>
            {i < STAGE_ORDER.length - 1 && (
              <div className={`h-0.5 flex-1 mx-1 mb-3.5 ${
                done ? "bg-green-400" : "bg-slate-200 dark:bg-slate-700"
              }`} />
            )}
          </div>
        );
      })}
    </div>
  );
};

interface TimelineProps {
  timeline: Issue["timeline"];
}

const MediaGallery: React.FC<{ media: Issue["timeline"][0]["media"] }> = ({ media }) => {
  if (!media || media.length === 0) return null;

  return (
    <div className="flex flex-wrap gap-2 mt-2">
      {media.map((m, i) =>
        m.type === "image" ? (
          <a key={i} href={m.url} target="_blank" rel="noopener noreferrer">
            <img
              src={m.url}
              alt=""
              className="h-16 w-16 object-cover rounded-md border hover:opacity-90 transition-opacity"
            />
          </a>
        ) : (
          <div key={i} className="relative h-16 w-16 rounded-md border bg-slate-100 dark:bg-slate-700 flex items-center justify-center">
            <a href={m.url} target="_blank" rel="noopener noreferrer" className="flex flex-col items-center gap-1">
              <Video className="h-5 w-5 text-slate-500" />
              <span className="text-[10px] text-slate-500">Play</span>
            </a>
          </div>
        )
      )}
    </div>
  );
};

const Timeline: React.FC<TimelineProps> = ({ timeline }) => (
  <div className="mt-4 space-y-4 border-t pt-4">
    {timeline.map((entry, i) => (
      <div key={i} className="flex gap-3">
        <div className="flex flex-col items-center">
          <div className={`h-7 w-7 rounded-full flex items-center justify-center border-2 shrink-0 ${
            entry.stage === "completed"
              ? "border-green-500 bg-green-50 dark:bg-green-900/20"
              : "border-blue-400 bg-blue-50 dark:bg-blue-900/20"
          }`}>
            <CheckCircle2 className={`h-3.5 w-3.5 ${
              entry.stage === "completed" ? "text-green-600" : "text-blue-500"
            }`} />
          </div>
          {i < timeline.length - 1 && (
            <div className="w-0.5 flex-1 bg-slate-200 dark:bg-slate-700 mt-1" />
          )}
        </div>
        <div className="flex-1 pb-3">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-xs font-semibold uppercase tracking-wide text-slate-700 dark:text-slate-300">
              {STAGE_LABELS[entry.stage]}
            </span>
            <span className="text-xs text-slate-400">
              {new Date(entry.updatedAt).toLocaleDateString(undefined, { day: "numeric", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" })}
            </span>
            {entry.updatedBy?.name && (
              <span className="text-xs text-slate-400">· {entry.updatedBy.name}</span>
            )}
          </div>
          {entry.note && (
            <p className="text-sm text-slate-600 dark:text-slate-400 mt-0.5">{entry.note}</p>
          )}
          <MediaGallery media={entry.media} />
        </div>
      </div>
    ))}
  </div>
);

interface MaintenanceListProps {
  requests: Issue[];
}

export const MaintenanceList: React.FC<MaintenanceListProps> = ({ requests }) => {
  const [expanded, setExpanded] = useState<string | null>(null);

  if (requests.length === 0) {
    return (
      <p className="text-sm text-slate-500 dark:text-slate-400 text-center py-4">
        No issues reported yet.
      </p>
    );
  }

  return (
    <div className="space-y-4">
      {requests.map((issue) => {
        const Icon = getCategoryIcon(issue.category);
        const isOpen = expanded === issue._id;

        return (
          <div key={issue._id} className="border rounded-lg overflow-hidden">
            <div className="p-4">
              <div className="flex items-start gap-3">
                <div className="bg-orange-100 dark:bg-orange-900/20 p-2 rounded-lg shrink-0">
                  <Icon className="h-5 w-5 text-orange-600 dark:text-orange-400" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2 flex-wrap">
                    <p className="font-medium text-slate-900 dark:text-white">{issue.title}</p>
                    <div className="flex items-center gap-1.5 shrink-0">
                      <Badge className={`text-xs ${getPriorityClass(issue.priority)}`}>
                        {issue.priority}
                      </Badge>
                    </div>
                  </div>
                  <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5 line-clamp-2">
                    {issue.description}
                  </p>
                  <p className="text-xs text-slate-400 mt-1">
                    {issue.category} · {new Date(issue.createdAt).toLocaleDateString()}
                  </p>

                  <StageTracker currentStatus={issue.status} />
                </div>
              </div>
            </div>

            {issue.timeline && issue.timeline.length > 0 && (
              <div className="border-t">
                <Button
                  variant="ghost"
                  size="sm"
                  className="w-full rounded-none h-9 text-xs text-slate-500 hover:text-slate-700 dark:hover:text-slate-300"
                  onClick={() => setExpanded(isOpen ? null : issue._id)}
                >
                  {isOpen ? (
                    <><ChevronUp className="h-3.5 w-3.5 mr-1" />Hide Updates</>
                  ) : (
                    <><ChevronDown className="h-3.5 w-3.5 mr-1" />View Updates ({issue.timeline.length})</>
                  )}
                </Button>

                {isOpen && (
                  <div className="px-4 pb-4">
                    <Timeline timeline={issue.timeline} />
                  </div>
                )}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
};
