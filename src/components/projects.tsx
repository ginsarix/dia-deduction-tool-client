import { zodResolver } from "@hookform/resolvers/zod";
import { format } from "date-fns";
import {
  ArrowRightIcon,
  CalendarIcon,
  IdCardLanyardIcon,
  Loader2Icon,
  PlusIcon,
  Settings2Icon,
} from "lucide-react";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { useNavigate } from "react-router";
import { toast } from "sonner";
import useSWR from "swr";
import { z } from "zod";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Field,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Sheet,
  SheetContent,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { API_BASE_URL } from "@/config/api";
import { fetcher } from "@/lib/fetcher";
import { cn } from "@/lib/utils";
import type { GetConnectionsResponse } from "@/types/connection";
import type { GetHourDefinitionsResponse } from "@/types/hour-definition";
import type { GetProjectsResponse } from "@/types/project";
import type { GetWorkersResponse } from "@/types/worker";

type Project = GetProjectsResponse["projects"][number];

const projectCreateSchema = z.object({
  name: z.string().min(1, { error: "Proje adı gereklidir" }),
  number: z.preprocess(
    (v) => (v === "" || v === null || v === undefined ? null : Number(v)),
    z.number().int().nullable(),
  ),
  startDate: z
    .string({ error: "Başlangıç tarihi gereklidir" })
    .min(1, { error: "Başlangıç tarihi gereklidir" }),
  endDate: z
    .string({ error: "Bitiş tarihi gereklidir" })
    .min(1, { error: "Bitiş tarihi gereklidir" }),
  connectionId: z.coerce.number().int().positive({ error: "Bağlantı seçiniz" }),
});

type ProjectCreateValues = z.infer<typeof projectCreateSchema>;

function CreateProjectSheet({ onSuccess }: { onSuccess: () => void }) {
  const [open, setOpen] = useState(false);
  const [selectedConnectionId, setSelectedConnectionId] = useState<
    number | null
  >(null);
  const [startDate, setStartDate] = useState<Date | undefined>();
  const [endDate, setEndDate] = useState<Date | undefined>();
  const [newMultiplier, setNewMultiplier] = useState("");
  const [addingHourDef, setAddingHourDef] = useState(false);
  // workerId -> hourDefinitionId (undefined = selected but no hour def yet)
  const [workerAssignments, setWorkerAssignments] = useState<
    Record<number, number | undefined>
  >({});

  const navigate = useNavigate();

  const { data: connectionsData, isLoading: connectionsLoading } =
    useSWR<GetConnectionsResponse>(
      open ? `${API_BASE_URL}/connections` : null,
      fetcher,
    );
  const { data: workersData, isLoading: workersLoading } =
    useSWR<GetWorkersResponse>(
      open ? `${API_BASE_URL}/workers` : null,
      fetcher,
    );
  const {
    data: hourDefsData,
    isLoading: hourDefsLoading,
    mutate: mutateHourDefs,
  } = useSWR<GetHourDefinitionsResponse>(
    open ? `${API_BASE_URL}/hour-definitions` : null,
    fetcher,
  );

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<ProjectCreateValues>({
    resolver: zodResolver(projectCreateSchema),
  });

  const connections = connectionsData?.connections ?? [];
  const hourDefinitions = hourDefsData?.hourDefinitions ?? [];
  const filteredWorkers =
    workersData?.workers.filter(
      (w) => w.connectionId === selectedConnectionId,
    ) ?? [];

  const handleConnectionChange = (val: string) => {
    const id = Number(val);
    setValue("connectionId", id, { shouldValidate: true });
    setSelectedConnectionId(id);
    setWorkerAssignments({});
  };

  const toggleWorker = (workerId: number) => {
    setWorkerAssignments((prev) => {
      const next = { ...prev };
      if (workerId in next) {
        delete next[workerId];
      } else {
        next[workerId] = undefined;
      }
      return next;
    });
  };

  const setHourDef = (workerId: number, hourDefinitionId: number) => {
    setWorkerAssignments((prev) => ({ ...prev, [workerId]: hourDefinitionId }));
  };

  const selectedWorkerCount = Object.keys(workerAssignments).length;

  const handleAddHourDef = async () => {
    const multiplier = parseFloat(newMultiplier);
    if (!multiplier || multiplier <= 0) {
      toast("Geçerli bir çarpan giriniz");
      return;
    }
    setAddingHourDef(true);
    try {
      await fetcher(`${API_BASE_URL}/hour-definitions`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ multiplier }),
      });
      setNewMultiplier("");
      await mutateHourDefs();
    } catch (err) {
      toast(err instanceof Error ? err.message : "Bir hata oluştu");
    } finally {
      setAddingHourDef(false);
    }
  };

  const onSubmit = handleSubmit(async (projectData) => {
    if (selectedWorkerCount === 0) {
      toast("En az bir personel seçiniz");
      return;
    }

    const hasUnassigned = Object.values(workerAssignments).some(
      (v) => v === undefined,
    );
    if (hasUnassigned) {
      toast("Seçilen tüm personeller için saat tanımlaması seçiniz");
      return;
    }

    const workers = Object.entries(workerAssignments).map(
      ([workerId, hourDefinitionId]) => ({
        workerId: Number(workerId),
        hourDefinitionId: hourDefinitionId!,
      }),
    );

    try {
      await fetcher(`${API_BASE_URL}/projects`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...projectData, workers }),
      });
      toast("Proje başarıyla oluşturuldu");
      reset();
      setWorkerAssignments({});
      setSelectedConnectionId(null);
      setStartDate(undefined);
      setEndDate(undefined);
      setOpen(false);
      onSuccess();
    } catch (err) {
      toast(err instanceof Error ? err.message : "Bir hata oluştu");
    }
  });

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button size="sm" className="cursor-pointer gap-1.5">
          <PlusIcon className="w-4 h-4" />
          Yeni Proje
        </Button>
      </SheetTrigger>
      <SheetContent className="sm:max-w-xl p-0 flex flex-col">
        <SheetHeader
          className="px-6 py-5"
          style={{ borderBottom: "1px solid var(--app-panel-border)" }}
        >
          <SheetTitle>Yeni Proje</SheetTitle>
        </SheetHeader>

        <form
          noValidate
          onSubmit={onSubmit}
          className="flex flex-col flex-1 min-h-0"
        >
          <div className="flex-1 overflow-y-auto px-6 py-5 space-y-6">
            {/* Project fields */}
            <div>
              <p className="text-xs font-mono text-muted-foreground uppercase tracking-widest mb-4">
                Proje Bilgileri
              </p>
              <FieldGroup>
                <Field>
                  <FieldLabel htmlFor="create-proj-name">Proje Adı</FieldLabel>
                  <Input
                    {...register("name")}
                    id="create-proj-name"
                    placeholder="Proje adı"
                  />
                  <FieldError>{errors.name?.message}</FieldError>
                </Field>
                <Field>
                  <FieldLabel htmlFor="create-proj-number">
                    Proje Numarası{" "}
                    <span className="text-muted-foreground font-normal">
                      (opsiyonel)
                    </span>
                  </FieldLabel>
                  <Input
                    {...register("number")}
                    id="create-proj-number"
                    type="number"
                    placeholder="—"
                  />
                  <FieldError>{errors.number?.message}</FieldError>
                </Field>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <Field>
                    <FieldLabel>Başlangıç Tarihi</FieldLabel>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button
                          type="button"
                          variant="outline"
                          className={cn(
                            "w-full justify-start text-left font-normal",
                            !startDate && "text-muted-foreground",
                          )}
                        >
                          <CalendarIcon className="mr-2 h-4 w-4" />
                          {startDate
                            ? format(startDate, "dd.MM.yyyy")
                            : "Tarih seçiniz"}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                          mode="single"
                          selected={startDate}
                          onSelect={(date) => {
                            setStartDate(date);
                            setValue(
                              "startDate",
                              date ? format(date, "yyyy-MM-dd") : "",
                              { shouldValidate: true },
                            );
                          }}
                        />
                      </PopoverContent>
                    </Popover>
                    <FieldError>{errors.startDate?.message}</FieldError>
                  </Field>
                  <Field>
                    <FieldLabel>Bitiş Tarihi</FieldLabel>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button
                          type="button"
                          variant="outline"
                          className={cn(
                            "w-full justify-start text-left font-normal",
                            !endDate && "text-muted-foreground",
                          )}
                        >
                          <CalendarIcon className="mr-2 h-4 w-4" />
                          {endDate
                            ? format(endDate, "dd.MM.yyyy")
                            : "Tarih seçiniz"}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                          mode="single"
                          selected={endDate}
                          onSelect={(date) => {
                            setEndDate(date);
                            setValue(
                              "endDate",
                              date ? format(date, "yyyy-MM-dd") : "",
                              { shouldValidate: true },
                            );
                          }}
                        />
                      </PopoverContent>
                    </Popover>
                    <FieldError>{errors.endDate?.message}</FieldError>
                  </Field>
                </div>
                <Field>
                  <FieldLabel>Bağlantı</FieldLabel>
                  {connectionsLoading ? (
                    <p className="text-sm font-mono text-muted-foreground">
                      Bağlantı yükleniyor…
                    </p>
                  ) : connections.length > 0 ? (
                    <Select onValueChange={handleConnectionChange}>
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Bağlantı seçiniz" />
                      </SelectTrigger>
                      <SelectContent>
                        {connections.map((c) => (
                          <SelectItem key={c.id} value={String(c.id)}>
                            {c.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  ) : (
                    <>
                      <span className="text-xs font-mono text-muted-foreground">
                        Bağlantı bulunamadı
                      </span>{" "}
                      <Button
                        className="cursor-pointer"
                        onClick={() => navigate("/connections/create")}
                        type="button"
                      >
                        Bağlantı Oluştur?
                      </Button>
                    </>
                  )}
                  <FieldError>{errors.connectionId?.message}</FieldError>
                </Field>
              </FieldGroup>
            </div>

            {/* Worker assignments — shown after connection is selected */}
            {selectedConnectionId !== null && (
              <div>
                <div className="flex items-center justify-between mb-3">
                  <p className="text-xs font-mono text-muted-foreground uppercase tracking-widest">
                    Personel Atamaları
                  </p>
                  {selectedWorkerCount > 0 && (
                    <Badge
                      variant="outline"
                      className="text-xs px-2 py-0 h-5 font-mono bg-[rgba(74,222,128,0.06)] border-[rgba(74,222,128,0.2)] text-[#4ade80]"
                    >
                      {selectedWorkerCount} seçili
                    </Badge>
                  )}
                </div>

                {/* Hour definition creation */}
                <div className="flex items-center gap-2 mb-4">
                  <span className="text-xs font-mono text-muted-foreground flex-shrink-0">
                    Saat tanımlaması ekle
                  </span>
                  {hourDefsLoading ? (
                    <Loader2Icon className="animate-spin w-3.5 h-3.5 text-muted-foreground" />
                  ) : (
                    <div className="flex items-center gap-1">
                      <Input
                        type="number"
                        step="0.01"
                        min="0.01"
                        placeholder="×çarpan"
                        value={newMultiplier}
                        onChange={(e) => setNewMultiplier(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === "Enter") {
                            e.preventDefault();
                            handleAddHourDef();
                          }
                        }}
                        className="h-7 text-xs w-24"
                      />
                      <Button
                        type="button"
                        size="icon-sm"
                        variant="ghost"
                        className="cursor-pointer h-7 w-7 text-muted-foreground hover:text-foreground"
                        onClick={handleAddHourDef}
                        disabled={addingHourDef}
                      >
                        {addingHourDef ? (
                          <Loader2Icon className="animate-spin w-3 h-3" />
                        ) : (
                          <PlusIcon className="w-3 h-3" />
                        )}
                      </Button>
                    </div>
                  )}
                  {hourDefinitions.length > 0 && (
                    <div className="flex items-center gap-1 ml-1">
                      {hourDefinitions.map((hd) => (
                        <Badge
                          key={hd.id}
                          variant="outline"
                          className="text-xs px-2 py-0 h-5 font-mono text-muted-foreground border-[#2a2a2a]"
                        >
                          ×{hd.multiplier}
                        </Badge>
                      ))}
                    </div>
                  )}
                </div>

                {workersLoading ? (
                  <div className="flex items-center justify-center py-6">
                    <Loader2Icon className="animate-spin text-muted-foreground" />
                  </div>
                ) : filteredWorkers.length === 0 ? (
                  <>
                    <p className="text-sm font-mono text-muted-foreground py-4 text-center">
                      Bu bağlantıya ait personel bulunamadı
                    </p>{" "}
                    <Button
                      className="cursor-pointer"
                      onClick={() => navigate("/workers/sync")}
                      type="button"
                    >
                      Personel eşleştir?
                    </Button>
                  </>
                ) : (
                  <div className="space-y-2">
                    {filteredWorkers.map((worker) => {
                      const isSelected = worker.id in workerAssignments;
                      const assignedHourDef = workerAssignments[worker.id];

                      return (
                        <div
                          key={worker.id}
                          className="rounded-lg transition-colors"
                          style={{
                            background: isSelected ? "var(--app-row-odd)" : "var(--app-row-even)",
                            border: isSelected
                              ? "1px solid var(--app-table-header-border)"
                              : "1px solid var(--app-row-border)",
                          }}
                        >
                          <label
                            htmlFor={`worker-${worker.id}`}
                            className="w-full flex items-center gap-3 px-4 py-3 cursor-pointer select-none"
                          >
                            <Checkbox
                              id={`worker-${worker.id}`}
                              checked={isSelected}
                              onCheckedChange={() => toggleWorker(worker.id)}
                            />
                            <span
                              className={cn(
                                "text-sm font-medium transition-colors",
                                isSelected
                                  ? "text-foreground"
                                  : "text-muted-foreground",
                              )}
                            >
                              {worker.name}
                            </span>
                            <span className="text-xs font-mono text-muted-foreground ml-auto">
                              {worker.diaKey}
                            </span>
                          </label>

                          {isSelected && (
                            <div
                              className="px-4 pb-3"
                              style={{ borderTop: "1px solid var(--app-panel-border)" }}
                            >
                              <div className="flex items-center gap-3 pt-3">
                                <span className="text-xs font-mono text-muted-foreground flex-shrink-0">
                                  Saat tanımlaması
                                </span>
                                {hourDefsLoading ? (
                                  <Loader2Icon className="animate-spin w-3.5 h-3.5 text-muted-foreground" />
                                ) : hourDefinitions.length === 0 ? (
                                  <span className="text-xs font-mono text-muted-foreground">
                                    Yukarıdan tanımlama ekleyiniz
                                  </span>
                                ) : (
                                  <Select
                                    value={
                                      assignedHourDef !== undefined
                                        ? String(assignedHourDef)
                                        : undefined
                                    }
                                    onValueChange={(val) =>
                                      setHourDef(worker.id, Number(val))
                                    }
                                  >
                                    <SelectTrigger className="h-7 text-xs">
                                      <SelectValue placeholder="Seçiniz" />
                                    </SelectTrigger>
                                    <SelectContent>
                                      {hourDefinitions.map((hd) => (
                                        <SelectItem
                                          key={hd.id}
                                          value={String(hd.id)}
                                        >
                                          ×{hd.multiplier}
                                        </SelectItem>
                                      ))}
                                    </SelectContent>
                                  </Select>
                                )}
                              </div>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            )}
          </div>

          <SheetFooter
            className="px-6 py-4"
            style={{ borderTop: "1px solid var(--app-panel-border)" }}
          >
            <Button
              type="submit"
              className="w-full cursor-pointer"
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <Loader2Icon className="animate-spin w-4 h-4" />
              ) : (
                "Proje Oluştur"
              )}
            </Button>
          </SheetFooter>
        </form>
      </SheetContent>
    </Sheet>
  );
}

interface ProjectCardProps {
  project: Project;
}

function ProjectCard({ project }: ProjectCardProps) {
  const [hovered, setHovered] = useState(false);
  const navigate = useNavigate();

  return (
    <Card
      onClick={() => navigate(`/projects/${project.project.id}`)}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      className={cn(
        "cursor-pointer relative overflow-hidden transition-all duration-300 flex flex-col",
        hovered ? "-translate-y-0.5" : "",
      )}
      style={{
        background: hovered ? "var(--app-card-bg-hover)" : "var(--app-card-bg)",
        borderColor: hovered ? "var(--app-card-border-hover)" : "var(--app-card-border)",
        boxShadow: hovered ? "var(--app-card-shadow-hover)" : "var(--app-card-shadow)",
      }}
    >
      {/* Top accent line */}
      <div
        className={cn(
          "absolute top-0 left-0 right-0 h-px transition-opacity duration-300",
          "[background:linear-gradient(90deg,transparent,#4ade80,transparent)]",
          hovered ? "opacity-40" : "opacity-0",
        )}
      />

      <CardHeader className="pb-3 pt-5 px-5">
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-1.5 min-w-0">
            <div
              className="w-1.5 h-1.5 rounded-full flex-shrink-0"
              style={{ background: "#4ade80", boxShadow: "0 0 6px #4ade80" }}
            />
            <span className="text-xs font-mono tracking-wide truncate text-muted-foreground">
              {project.connectionName}
            </span>
          </div>
          {project.project.number != null && (
            <span className="text-xs font-mono text-muted-foreground flex-shrink-0">
              #{project.project.number}
            </span>
          )}
        </div>
      </CardHeader>

      <CardContent className="px-5 pb-5 pt-1 flex flex-col flex-1 gap-4">
        <h3
          className={cn(
            "text-lg font-semibold leading-tight transition-colors duration-200",
            hovered ? "text-foreground" : "text-foreground/80",
          )}
          style={{ letterSpacing: "-0.02em" }}
        >
          {project.project.name}
        </h3>

        <div className="flex flex-col gap-2 mt-auto">
          <div className="flex items-center gap-1.5 text-xs font-mono text-muted-foreground">
            <CalendarIcon className="w-3 h-3 flex-shrink-0" />
            <span>
              {format(new Date(project.project.startDate), "dd.MM.yyyy")}
              {" — "}
              {format(new Date(project.project.endDate), "dd.MM.yyyy")}
            </span>
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <IdCardLanyardIcon className="w-3.5 h-3.5 text-muted-foreground" />
              <span className="text-xs font-mono text-muted-foreground">Personel:</span>
              <Badge
                variant="outline"
                className="text-xs px-2 py-0 h-5 font-mono bg-[rgba(74,222,128,0.06)] border-[rgba(74,222,128,0.2)] text-[#4ade80]"
              >
                {project.workerCount}
              </Badge>
            </div>

            <ArrowRightIcon
              className={cn(
                "w-3.5 h-3.5 text-muted-foreground transition-all duration-200",
                hovered
                  ? "opacity-100 translate-x-0"
                  : "opacity-0 -translate-x-1",
              )}
            />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export default function Projects() {
  const { data, isLoading, error, mutate } = useSWR<GetProjectsResponse>(
    `${API_BASE_URL}/projects`,
    fetcher,
  );

  useEffect(() => {
    if (error) {
      toast(error instanceof Error ? error.message : "Veriler yüklenemedi");
    }
  }, [error]);

  return (
    <div className="min-h-screen p-4 sm:p-8 bg-background font-sans">
      <div
        className="max-w-4xl mx-auto rounded-2xl p-4 sm:p-8"
        style={{
          background: "var(--app-panel-bg)",
          border: "1px solid var(--app-panel-border)",
          boxShadow: "var(--app-panel-shadow)",
        }}
      >
        {/* Header */}
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1
              className="text-2xl font-semibold tracking-tight mb-1 text-foreground"
              style={{ letterSpacing: "-0.03em" }}
            >
              Projeler
            </h1>
            <p className="text-sm font-mono text-muted-foreground">
              {data && <span>{data.projects.length} aktif projeler</span>}
            </p>
          </div>
          <CreateProjectSheet onSuccess={() => mutate()} />
        </div>

        {/* Grid */}
        {data && !isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
            {data.projects.map((d) => (
              <ProjectCard key={d.project.id} project={d} />
            ))}
          </div>
        ) : (
          <div className="flex items-center justify-center py-16">
            <Loader2Icon className="animate-spin text-muted-foreground" />
          </div>
        )}
      </div>
    </div>
  );
}
