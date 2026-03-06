import {
  ArrowRightIcon,
  IdCardLanyardIcon,
  Loader2Icon,
  Settings2Icon,
} from "lucide-react";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router";
import { toast } from "sonner";
import useSWR from "swr";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { API_BASE_URL } from "@/config/api";
import { fetcher } from "@/lib/fetcher";
import { cn } from "@/lib/utils";
import type { GetProjectsResponse } from "@/types/project";
import { Button } from "./ui/button";

type Project = GetProjectsResponse["projects"][number];

interface ProjectCardProps {
  project: Project;
}

function ProjectCard({ project }: ProjectCardProps) {
  const [hovered, setHovered] = useState(false);
  const navigate = useNavigate();

  return (
    <Card
      onClick={() => navigate(`/projects/${project.project.id}/calculations`)}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      className={cn(
        "cursor-pointer relative overflow-hidden transition-all duration-300",
        hovered
          ? "[background:linear-gradient(135deg,#1a1a1a_0%,#242424_100%)] border-[#3d3d3d] shadow-[0_0_0_1px_#3a3a3a,0_8px_32px_rgba(0,0,0,0.6),inset_0_1px_0_rgba(255,255,255,0.04)] -translate-y-0.5"
          : "[background:linear-gradient(135deg,#141414_0%,#1c1c1c_100%)] border-[#2a2a2a] shadow-[0_2px_12px_rgba(0,0,0,0.4),inset_0_1px_0_rgba(255,255,255,0.02)]",
      )}
    >
      {/* Top accent line */}
      <div
        className={cn(
          "absolute top-0 left-0 right-0 h-px transition-opacity duration-300",
          "[background:linear-gradient(90deg,transparent,#525252,transparent)]",
          hovered ? "opacity-100" : "opacity-0",
        )}
      />

      <CardHeader className="pb-2 pt-4 px-4">
        <div className="flex items-center gap-1.5">
          <div
            className="w-1.5 h-1.5 rounded-full flex-shrink-0"
            style={{ background: "#4ade80", boxShadow: "0 0 6px #4ade80" }}
          />
          <span className="text-xs font-mono tracking-wide truncate text-[#525252]">
            {project.connectionName}
          </span>
          <Button
            onClick={(e) => {
              e.stopPropagation();
              navigate(`/projects/${project.project.id}`);
            }}
            size="icon-sm"
            variant="ghost"
            className="cursor-pointer ms-auto text-[#727272]"
          >
            <Settings2Icon />
          </Button>
        </div>
      </CardHeader>

      <CardContent className="px-4 pb-5 pt-1">
        <h3
          className={cn(
            "text-xl font-semibold mb-4 tracking-tight transition-colors duration-200",
            hovered ? "text-[#e8e8e8]" : "text-[#c8c8c8]",
          )}
          style={{ letterSpacing: "-0.02em" }}
        >
          {project.project.name}
        </h3>

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <IdCardLanyardIcon className="w-4 h-4 text-[#404040]" />
            <span className="text-sm font-mono text-[#484848]">Personel:</span>
            <Badge
              variant="outline"
              className="text-xs px-2 py-0 h-5 font-mono bg-[rgba(74,222,128,0.06)] border-[rgba(74,222,128,0.2)] text-[#4ade80]"
            >
              {project.workerCount}
            </Badge>
          </div>

          <ArrowRightIcon
            className={cn(
              "w-4 h-4 text-[#525252] transition-all duration-200",
              hovered
                ? "opacity-100 translate-x-0"
                : "opacity-0 -translate-x-1",
            )}
          />
        </div>
      </CardContent>
    </Card>
  );
}

export default function Projects() {
  const { data, isLoading, error } = useSWR<GetProjectsResponse>(
    `${API_BASE_URL}/projects`,
    fetcher,
  );

  useEffect(() => {
    if (error) {
      toast(error);
    }
  }, [error]);

  return (
    <div className="min-h-screen p-8 bg-[#0a0a0a] font-sans">
      <div
        className="max-w-4xl mx-auto rounded-2xl p-8"
        style={{
          background: "linear-gradient(160deg, #111111 0%, #0e0e0e 100%)",
          border: "1px solid #1f1f1f",
          boxShadow: "0 0 0 1px #161616, 0 24px 80px rgba(0,0,0,0.8)",
        }}
      >
        {/* Header */}
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1
              className="text-2xl font-semibold tracking-tight mb-1 text-[#e0e0e0]"
              style={{ letterSpacing: "-0.03em" }}
            >
              Projeler
            </h1>
            <p className="text-sm font-mono text-[#383838]">
              {data && <span>{data?.projects.length} aktif projeler</span>}
            </p>
          </div>
        </div>

        {/* Grid */}
        {data && !isLoading ? (
          <div className="grid grid-cols-3 gap-4">
            {data?.projects.map((d) => (
              <ProjectCard key={d.project.id} project={d} />
            ))}
          </div>
        ) : (
          <Loader2Icon />
        )}
      </div>
    </div>
  );
}
