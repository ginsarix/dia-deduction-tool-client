import { zodResolver } from "@hookform/resolvers/zod";
import { format, parse } from "date-fns";
import {
  ArrowLeftIcon,
  CalendarIcon,
  ClockIcon,
  Loader2Icon,
  PencilIcon,
  PlayIcon,
  PlusIcon,
  Trash2Icon,
  UsersIcon,
} from "lucide-react";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { useNavigate, useParams } from "react-router";
import { toast } from "sonner";
import useSWR from "swr";
import { z } from "zod";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Calendar } from "@/components/ui/calendar";
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
import { DataTable } from "@/components/calculations/data-table";
import { columns } from "@/components/calculations/columns";
import { API_BASE_URL } from "@/config/api";
import { fetcher } from "@/lib/fetcher";
import { cn } from "@/lib/utils";
import type { GetCalculationsResponse } from "@/types/calculation";
import type { GetConnectionsResponse } from "@/types/connection";
import type { GetHourDefinitionsResponse } from "@/types/hour-definition";
import type { GetProjectsResponse } from "@/types/project";
import type { GetWorkersResponse } from "@/types/worker";

type Project = GetProjectsResponse["projects"][number]["project"];

type GetProjectResponse = {
  message: string;
  project: Project;
};

type ProjectWorker = {
  workerId: number;
  workerName: string;
  diaKey: string;
  hourDefinitionId: number;
  multiplier: number;
};

type GetProjectWorkersResponse = {
  message: string;
  workers: ProjectWorker[];
};

const projectEditSchema = z.object({
  name: z.string().min(1, { error: "Proje adı gereklidir" }).optional(),
  number: z.preprocess(
    (v) => (v === "" || v === null || v === undefined ? null : Number(v)),
    z.number().int().nullable().optional(),
  ),
  startDate: z
    .string()
    .min(1, { error: "Başlangıç tarihi gereklidir" })
    .optional(),
  endDate: z.string().min(1, { error: "Bitiş tarihi gereklidir" }).optional(),
  connectionId: z.coerce.number().int().positive().optional(),
});

type ProjectEditValues = z.infer<typeof projectEditSchema>;

function EditProjectDialog({
  project,
  connections,
  onSuccess,
}: {
  project: Project;
  connections: GetConnectionsResponse["connections"];
  onSuccess: () => void;
}) {
  const [open, setOpen] = useState(false);
  const [startDate, setStartDate] = useState<Date | undefined>();
  const [endDate, setEndDate] = useState<Date | undefined>();

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<ProjectEditValues>({
    resolver: zodResolver(projectEditSchema),
  });

  useEffect(() => {
    if (open) {
      reset({
        name: project.name,
        number: project.number ?? undefined,
        startDate: project.startDate,
        endDate: project.endDate,
        connectionId: project.connectionId,
      });
      setStartDate(
        project.startDate
          ? parse(project.startDate, "yyyy-MM-dd", new Date())
          : undefined,
      );
      setEndDate(
        project.endDate
          ? parse(project.endDate, "yyyy-MM-dd", new Date())
          : undefined,
      );
    }
  }, [open, project, reset]);

  const onSubmit = handleSubmit(async (data) => {
    try {
      await fetcher(`${API_BASE_URL}/projects/${project.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      toast("Proje başarıyla güncellendi");
      setOpen(false);
      onSuccess();
    } catch (err) {
      toast(err instanceof Error ? err.message : "Bir hata oluştu");
    }
  });

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button
          size="sm"
          variant="ghost"
          className="cursor-pointer gap-1.5 text-[#727272] hover:text-[#c8c8c8]"
        >
          <PencilIcon className="w-3.5 h-3.5" />
          Düzenle
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Projeyi Düzenle</DialogTitle>
        </DialogHeader>
        <form noValidate onSubmit={onSubmit}>
          <FieldGroup>
            <Field>
              <FieldLabel htmlFor="edit-project-name">Proje Adı</FieldLabel>
              <Input
                {...register("name")}
                id="edit-project-name"
                placeholder="Proje adı"
              />
              <FieldError>{errors.name?.message}</FieldError>
            </Field>
            <Field>
              <FieldLabel htmlFor="edit-project-number">
                Proje Numarası{" "}
                <span className="text-[#525252] font-normal">(opsiyonel)</span>
              </FieldLabel>
              <Input
                {...register("number")}
                id="edit-project-number"
                type="number"
                placeholder="—"
              />
              <FieldError>{errors.number?.message}</FieldError>
            </Field>
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
                    {startDate ? format(startDate, "dd.MM.yyyy") : "Tarih seçiniz"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={startDate}
                    onSelect={(date) => {
                      setStartDate(date);
                      setValue("startDate", date ? format(date, "yyyy-MM-dd") : "", {
                        shouldValidate: true,
                      });
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
                    {endDate ? format(endDate, "dd.MM.yyyy") : "Tarih seçiniz"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={endDate}
                    onSelect={(date) => {
                      setEndDate(date);
                      setValue("endDate", date ? format(date, "yyyy-MM-dd") : "", {
                        shouldValidate: true,
                      });
                    }}
                  />
                </PopoverContent>
              </Popover>
              <FieldError>{errors.endDate?.message}</FieldError>
            </Field>
            <Field>
              <FieldLabel>Bağlantı</FieldLabel>
              <Select
                defaultValue={String(project.connectionId)}
                onValueChange={(val) =>
                  setValue("connectionId", Number(val), {
                    shouldValidate: true,
                  })
                }
              >
                <SelectTrigger className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {connections.map((c) => (
                    <SelectItem key={c.id} value={String(c.id)}>
                      {c.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FieldError>{errors.connectionId?.message}</FieldError>
            </Field>
            <Field>
              <Button
                type="submit"
                className="cursor-pointer"
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <Loader2Icon className="animate-spin w-4 h-4" />
                ) : (
                  "Kaydet"
                )}
              </Button>
            </Field>
          </FieldGroup>
        </form>
      </DialogContent>
    </Dialog>
  );
}

type Assignment = { workerId: number; hourDefinitionId: number };

function EditWorkersSheet({
  projectId,
  currentWorkers,
  allWorkers,
  hourDefinitions,
  onSuccess,
}: {
  projectId: number;
  currentWorkers: ProjectWorker[];
  allWorkers: GetWorkersResponse["workers"];
  hourDefinitions: GetHourDefinitionsResponse["hourDefinitions"];
  onSuccess: () => void;
}) {
  const [open, setOpen] = useState(false);
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [addWorkerId, setAddWorkerId] = useState<string>("");
  const [addHourDefId, setAddHourDefId] = useState<string>("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (open) {
      setAssignments(
        currentWorkers.map((w) => ({
          workerId: w.workerId,
          hourDefinitionId: w.hourDefinitionId,
        })),
      );
      setAddWorkerId("");
      setAddHourDefId("");
    }
  }, [open, currentWorkers]);

  const assignedWorkerIds = new Set(assignments.map((a) => a.workerId));
  const availableWorkers = allWorkers.filter(
    (w) => !assignedWorkerIds.has(w.id),
  );

  const handleAdd = () => {
    if (!addWorkerId || !addHourDefId) return;
    setAssignments((prev) => [
      ...prev,
      { workerId: Number(addWorkerId), hourDefinitionId: Number(addHourDefId) },
    ]);
    setAddWorkerId("");
    setAddHourDefId("");
  };

  const handleRemove = (workerId: number) => {
    setAssignments((prev) => prev.filter((a) => a.workerId !== workerId));
  };

  const handleHourDefChange = (workerId: number, hourDefinitionId: number) => {
    setAssignments((prev) =>
      prev.map((a) =>
        a.workerId === workerId ? { ...a, hourDefinitionId } : a,
      ),
    );
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await fetcher(`${API_BASE_URL}/projects/${projectId}/workers`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(assignments),
      });
      toast("Personel atamaları güncellendi");
      setOpen(false);
      onSuccess();
    } catch (err) {
      toast(err instanceof Error ? err.message : "Bir hata oluştu");
    } finally {
      setSaving(false);
    }
  };

  const workerMap = new Map(allWorkers.map((w) => [w.id, w]));

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button
          size="sm"
          variant="ghost"
          className="cursor-pointer gap-1.5 text-[#727272] hover:text-[#c8c8c8]"
        >
          <UsersIcon className="w-3.5 h-3.5" />
          Düzenle
        </Button>
      </SheetTrigger>
      <SheetContent className="sm:max-w-md p-0 flex flex-col">
        <SheetHeader
          className="px-6 py-5"
          style={{ borderBottom: "1px solid #1f1f1f" }}
        >
          <SheetTitle>Personelleri Düzenle</SheetTitle>
        </SheetHeader>

        <div className="flex-1 overflow-y-auto px-6 py-5 space-y-4">
          {/* Current assignments */}
          {assignments.length > 0 ? (
            <div className="space-y-2">
              {assignments.map((a) => {
                const worker = workerMap.get(a.workerId);
                return (
                  <div
                    key={a.workerId}
                    className="flex items-center gap-2 rounded-lg p-2"
                    style={{
                      background: "#111111",
                      border: "1px solid #1f1f1f",
                    }}
                  >
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-[#c8c8c8] truncate">
                        {worker?.name ?? `#${a.workerId}`}
                      </p>
                      <p className="text-xs font-mono text-[#404040] truncate">
                        {worker?.diaKey}
                      </p>
                    </div>
                    <Select
                      value={String(a.hourDefinitionId)}
                      onValueChange={(val) =>
                        handleHourDefChange(a.workerId, Number(val))
                      }
                    >
                      <SelectTrigger className="w-24 h-8 text-xs">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {hourDefinitions.map((hd) => (
                          <SelectItem key={hd.id} value={String(hd.id)}>
                            ×{hd.multiplier}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <Button
                      size="icon-sm"
                      variant="ghost"
                      className="cursor-pointer text-[#525252] hover:text-red-400 flex-shrink-0"
                      onClick={() => handleRemove(a.workerId)}
                    >
                      <Trash2Icon className="w-3.5 h-3.5" />
                    </Button>
                  </div>
                );
              })}
            </div>
          ) : (
            <p className="text-sm font-mono text-[#383838] text-center py-4">
              Henüz personel atanmamış
            </p>
          )}

          {/* Add worker */}
          {availableWorkers.length > 0 && hourDefinitions.length > 0 && (
            <div
              className="rounded-lg p-3 space-y-2"
              style={{ background: "#0e0e0e", border: "1px solid #1a1a1a" }}
            >
              <p className="text-xs font-mono text-[#525252]">Personel Ekle</p>
              <Select value={addWorkerId} onValueChange={setAddWorkerId}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Personel seç" />
                </SelectTrigger>
                <SelectContent>
                  {availableWorkers.map((w) => (
                    <SelectItem key={w.id} value={String(w.id)}>
                      {w.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select value={addHourDefId} onValueChange={setAddHourDefId}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Çarpan seç" />
                </SelectTrigger>
                <SelectContent>
                  {hourDefinitions.map((hd) => (
                    <SelectItem key={hd.id} value={String(hd.id)}>
                      ×{hd.multiplier}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Button
                size="sm"
                variant="outline"
                className="cursor-pointer gap-1.5 w-full"
                onClick={handleAdd}
                disabled={!addWorkerId || !addHourDefId}
              >
                <PlusIcon className="w-3.5 h-3.5" />
                Ekle
              </Button>
            </div>
          )}
        </div>

        <SheetFooter
          className="px-6 py-4"
          style={{ borderTop: "1px solid #1f1f1f" }}
        >
          <Button
            className="cursor-pointer w-full"
            onClick={handleSave}
            disabled={saving}
          >
            {saving ? (
              <Loader2Icon className="animate-spin w-4 h-4" />
            ) : (
              "Kaydet"
            )}
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}

export default function ProjectDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const {
    data: projectData,
    isLoading: projectLoading,
    error: projectError,
    mutate: mutateProject,
  } = useSWR<GetProjectResponse>(
    id ? `${API_BASE_URL}/projects/${id}` : null,
    fetcher,
  );

  const { data: connectionsData } = useSWR<GetConnectionsResponse>(
    `${API_BASE_URL}/connections`,
    fetcher,
  );

  const {
    data: workersData,
    isLoading: workersLoading,
    mutate: mutateWorkers,
  } = useSWR<GetProjectWorkersResponse>(
    id ? `${API_BASE_URL}/projects/${id}/workers` : null,
    fetcher,
  );

  const { data: allWorkersData } = useSWR<GetWorkersResponse>(
    `${API_BASE_URL}/workers`,
    fetcher,
  );

  const { data: hourDefinitionsData } = useSWR<GetHourDefinitionsResponse>(
    `${API_BASE_URL}/hour-definitions`,
    fetcher,
  );

  useEffect(() => {
    if (projectError) {
      toast("Proje yüklenemedi");
    }
  }, [projectError]);

  const connections = connectionsData?.connections ?? [];
  const connectionMap = new Map(connections.map((c) => [c.id, c.name]));

  const [calculations, setCalculations] = useState<
    GetCalculationsResponse["calculations"] | null
  >(null);
  const [calculationsLoading, setCalculationsLoading] = useState(false);

  const handleCalculate = async () => {
    setCalculationsLoading(true);
    try {
      const data = (await fetcher(
        `${API_BASE_URL}/projects/${id}/calculations`,
      )) as GetCalculationsResponse;
      setCalculations(data.calculations);
    } catch (err) {
      toast(err instanceof Error ? err.message : "Hesaplamalar alınamadı");
    } finally {
      setCalculationsLoading(false);
    }
  };

  const [deletingProject, setDeletingProject] = useState(false);

  const handleDeleteProject = async () => {
    setDeletingProject(true);
    try {
      await fetcher(`${API_BASE_URL}/projects/${id}`, {
        method: "DELETE",
      });
      toast("Proje silindi");
      navigate("/projects");
    } catch (err) {
      toast(err instanceof Error ? err.message : "Bir hata oluştu");
      setDeletingProject(false);
    }
  };

  if (projectLoading) {
    return (
      <div className="min-h-screen p-4 sm:p-8 bg-[#0a0a0a] font-sans flex items-center justify-center">
        <Loader2Icon className="animate-spin text-[#383838]" />
      </div>
    );
  }

  if (!projectData?.project) {
    return (
      <div className="min-h-screen p-4 sm:p-8 bg-[#0a0a0a] font-sans flex items-center justify-center">
        <p className="text-sm font-mono text-[#383838]">Proje bulunamadı</p>
      </div>
    );
  }

  const project = projectData.project;

  return (
    <div className="min-w-0 bg-[#0a0a0a] font-sans">
    <div className="p-4 sm:p-8">
      <div className="max-w-3xl mx-auto space-y-6">
        {/* Back */}
        <Button
          variant="ghost"
          size="sm"
          className="cursor-pointer gap-1.5 text-[#525252] hover:text-[#c8c8c8] -ml-2"
          onClick={() => navigate("/projects")}
        >
          <ArrowLeftIcon className="w-3.5 h-3.5" />
          Projelere dön
        </Button>

        {/* Project Info Card */}
        <div
          className="rounded-2xl p-4 sm:p-8"
          style={{
            background: "linear-gradient(160deg, #111111 0%, #0e0e0e 100%)",
            border: "1px solid #1f1f1f",
            boxShadow: "0 0 0 1px #161616, 0 24px 80px rgba(0,0,0,0.8)",
          }}
        >
          <div className="flex items-start justify-between mb-6">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <div
                  className="w-1.5 h-1.5 rounded-full flex-shrink-0"
                  style={{
                    background: "#4ade80",
                    boxShadow: "0 0 6px #4ade80",
                  }}
                />
                <span className="text-xs font-mono tracking-wide text-[#525252]">
                  {connectionMap.get(project.connectionId) ??
                    `Bağlantı #${project.connectionId}`}
                </span>
              </div>
              <h1
                className="text-2xl font-semibold text-[#e0e0e0]"
                style={{ letterSpacing: "-0.03em" }}
              >
                {project.name}
              </h1>
              {project.number !== null && (
                <Badge
                  variant="outline"
                  className="mt-2 text-xs font-mono bg-[rgba(74,222,128,0.06)] border-[rgba(74,222,128,0.2)] text-[#4ade80]"
                >
                  Proje No: #{project.number}
                </Badge>
              )}
            </div>

            <div className="flex items-center gap-1">
              <EditProjectDialog
                project={project}
                connections={connections}
                onSuccess={() => mutateProject()}
              />
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button
                    size="sm"
                    variant="ghost"
                    className="cursor-pointer gap-1.5 text-[#727272] hover:text-red-400"
                  >
                    <Trash2Icon className="w-3.5 h-3.5" />
                    Sil
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Projeyi sil</AlertDialogTitle>
                    <AlertDialogDescription>
                      <span className="font-semibold text-[#e0e0e0]">
                        {project.name}
                      </span>{" "}
                      projesini silmek istediğinizden emin misiniz? Bu işlem
                      geri alınamaz.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel className="cursor-pointer">
                      İptal
                    </AlertDialogCancel>
                    <AlertDialogAction
                      variant="destructive"
                      className="cursor-pointer"
                      onClick={handleDeleteProject}
                      disabled={deletingProject}
                    >
                      {deletingProject ? (
                        <Loader2Icon className="animate-spin w-4 h-4" />
                      ) : (
                        "Sil"
                      )}
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div
              className="rounded-xl p-4"
              style={{
                background: "#0e0e0e",
                border: "1px solid #1a1a1a",
              }}
            >
              <div className="flex items-center gap-2 mb-1">
                <CalendarIcon className="w-3.5 h-3.5 text-[#404040]" />
                <span className="text-xs font-mono text-[#404040]">
                  Başlangıç
                </span>
              </div>
              <p className="text-sm font-mono text-[#c8c8c8]">
                {project.startDate}
              </p>
            </div>
            <div
              className="rounded-xl p-4"
              style={{
                background: "#0e0e0e",
                border: "1px solid #1a1a1a",
              }}
            >
              <div className="flex items-center gap-2 mb-1">
                <CalendarIcon className="w-3.5 h-3.5 text-[#404040]" />
                <span className="text-xs font-mono text-[#404040]">Bitiş</span>
              </div>
              <p className="text-sm font-mono text-[#c8c8c8]">
                {project.endDate}
              </p>
            </div>
          </div>
        </div>

        {/* Workers Section */}
        <div
          className="rounded-2xl p-4 sm:p-8"
          style={{
            background: "linear-gradient(160deg, #111111 0%, #0e0e0e 100%)",
            border: "1px solid #1f1f1f",
            boxShadow: "0 0 0 1px #161616, 0 24px 80px rgba(0,0,0,0.8)",
          }}
        >
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2
                className="text-lg font-semibold text-[#e0e0e0]"
                style={{ letterSpacing: "-0.02em" }}
              >
                Personeller
              </h2>
              <p className="text-sm font-mono text-[#383838]">
                {workersData && (
                  <span>{workersData.workers.length} personel</span>
                )}
              </p>
            </div>
            <EditWorkersSheet
              projectId={project.id}
              currentWorkers={workersData?.workers ?? []}
              allWorkers={allWorkersData?.workers ?? []}
              hourDefinitions={hourDefinitionsData?.hourDefinitions ?? []}
              onSuccess={() => mutateWorkers()}
            />
          </div>

          {workersLoading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2Icon className="animate-spin text-[#383838]" />
            </div>
          ) : workersData && workersData.workers.length > 0 ? (
            <div
              className="rounded-xl overflow-hidden"
              style={{ border: "1px solid #1f1f1f" }}
            >
              <table className="w-full">
                <thead>
                  <tr
                    style={{
                      background:
                        "linear-gradient(135deg,#141414 0%,#1c1c1c 100%)",
                      borderBottom: "1px solid #2a2a2a",
                    }}
                  >
                    <th className="text-left px-4 py-3 text-xs font-mono text-[#525252] tracking-wide">
                      Personel
                    </th>
                    <th className="text-left px-4 py-3 text-xs font-mono text-[#525252] tracking-wide">
                      DIA Anahtarı
                    </th>
                    <th className="text-left px-4 py-3 text-xs font-mono text-[#525252] tracking-wide">
                      Çarpan
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {workersData.workers.map((w, i) => (
                    <tr
                      key={w.workerId}
                      style={{
                        background: i % 2 === 0 ? "#0e0e0e" : "#111111",
                        borderBottom:
                          i < workersData.workers.length - 1
                            ? "1px solid #1a1a1a"
                            : "none",
                      }}
                    >
                      <td className="px-4 py-3">
                        <span className="text-sm text-[#c8c8c8]">
                          {w.workerName}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <span className="text-xs font-mono text-[#404040]">
                          {w.diaKey}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <ClockIcon className="w-3.5 h-3.5 text-[#404040]" />
                          <span className="text-sm font-mono text-[#c8c8c8]">
                            ×{w.multiplier}
                          </span>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-8 gap-3">
              <ClockIcon className="w-8 h-8 text-[#2a2a2a]" />
              <p className="text-sm font-mono text-[#383838]">
                Bu projeye atanmış personel yok
              </p>
            </div>
          )}
        </div>

      </div>
    </div>

    {/* Calculations Section — outside main wrapper */}
    <div className="px-4 pb-4 sm:px-8 sm:pb-8 bg-[#0a0a0a] font-sans">
      <div
        className="rounded-2xl p-4 sm:p-8 overflow-hidden"
        style={{
          background: "linear-gradient(160deg, #111111 0%, #0e0e0e 100%)",
          border: "1px solid #1f1f1f",
          boxShadow: "0 0 0 1px #161616, 0 24px 80px rgba(0,0,0,0.8)",
        }}
      >
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2
              className="text-lg font-semibold text-[#e0e0e0]"
              style={{ letterSpacing: "-0.02em" }}
            >
              Hesaplamalar
            </h2>
            <p className="text-sm font-mono text-[#383838]">
              {calculations
                ? `${calculations.length} personel`
                : "Hesaplamak için butona basın"}
            </p>
          </div>
          <Button
            size="sm"
            className="cursor-pointer gap-1.5"
            onClick={handleCalculate}
            disabled={calculationsLoading}
          >
            {calculationsLoading ? (
              <Loader2Icon className="animate-spin w-4 h-4" />
            ) : (
              <>
                <PlayIcon className="w-3.5 h-3.5" />
                Hesapla
              </>
            )}
          </Button>
        </div>

        {calculations && calculations.length > 0 ? (
          <div className="overflow-x-auto">
            <DataTable columns={columns} data={calculations} />
          </div>
        ) : calculations && calculations.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-8 gap-3">
            <ClockIcon className="w-8 h-8 text-[#2a2a2a]" />
            <p className="text-sm font-mono text-[#383838]">
              Hesaplanacak veri bulunamadı
            </p>
          </div>
        ) : null}
      </div>
    </div>
    </div>
  );
}
