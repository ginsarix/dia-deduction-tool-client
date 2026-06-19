import { zodResolver } from "@hookform/resolvers/zod";
import { format } from "date-fns";
import {
  CalendarIcon,
  Loader2Icon,
  PencilIcon,
  PlusIcon,
  Trash2Icon,
} from "lucide-react";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import useSWR from "swr";
import { z } from "zod";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
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
import type { GetProjectsResponse } from "@/types/project";

type Project = GetProjectsResponse["projects"][number];

const projectSchema = z.object({
  title: z.string().min(1, { error: "Proje adı gereklidir" }),
  startDate: z
    .string({ error: "Başlangıç tarihi gereklidir" })
    .min(1, { error: "Başlangıç tarihi gereklidir" }),
  endDate: z
    .string({ error: "Bitiş tarihi gereklidir" })
    .min(1, { error: "Bitiş tarihi gereklidir" }),
  active: z.boolean().default(true),
});

type ProjectFormValues = z.infer<typeof projectSchema>;

function CreateProjectSheet({ onSuccess }: { onSuccess: () => void }) {
  const [open, setOpen] = useState(false);
  const [startDate, setStartDate] = useState<Date | undefined>();
  const [endDate, setEndDate] = useState<Date | undefined>();

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<ProjectFormValues>({
    resolver: zodResolver(projectSchema),
    defaultValues: { active: true },
  });

  const active = watch("active");

  const onSubmit = handleSubmit(async (data) => {
    try {
      await fetcher(`${API_BASE_URL}/projects`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      toast("Proje başarıyla oluşturuldu");
      reset();
      setStartDate(undefined);
      setEndDate(undefined);
      setOpen(false);
      onSuccess();
    } catch (err) {
      toast(err instanceof Error ? err.message : "Bir hata oluştu");
    }
  });

  const handleOpenChange = (val: boolean) => {
    setOpen(val);
    if (!val) {
      reset();
      setStartDate(undefined);
      setEndDate(undefined);
    }
  };

  return (
    <Sheet open={open} onOpenChange={handleOpenChange}>
      <SheetTrigger asChild>
        <Button size="sm" className="cursor-pointer gap-1.5">
          <PlusIcon className="w-4 h-4" />
          Yeni Proje
        </Button>
      </SheetTrigger>
      <SheetContent className="sm:max-w-md p-0 flex flex-col">
        <SheetHeader
          className="px-6 py-5"
          style={{ borderBottom: "1px solid var(--app-panel-border)" }}
        >
          <SheetTitle>Yeni Proje</SheetTitle>
        </SheetHeader>

        <form noValidate onSubmit={onSubmit} className="flex flex-col flex-1 min-h-0">
          <div className="flex-1 overflow-y-auto px-6 py-5">
            <FieldGroup>
              <Field>
                <FieldLabel htmlFor="create-project-title">Proje Adı</FieldLabel>
                <Input
                  {...register("title")}
                  id="create-project-title"
                  placeholder="Proje adı"
                />
                <FieldError>{errors.title?.message}</FieldError>
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
                        {startDate ? format(startDate, "dd.MM.yyyy") : "Tarih seçiniz"}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={startDate}
                        onSelect={(d) => {
                          setStartDate(d);
                          setValue("startDate", d ? format(d, "yyyy-MM-dd") : "", {
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
                        onSelect={(d) => {
                          setEndDate(d);
                          setValue("endDate", d ? format(d, "yyyy-MM-dd") : "", {
                            shouldValidate: true,
                          });
                        }}
                      />
                    </PopoverContent>
                  </Popover>
                  <FieldError>{errors.endDate?.message}</FieldError>
                </Field>
              </div>

              <Field>
                <div className="flex items-center gap-3">
                  <Checkbox
                    id="create-project-active"
                    checked={active}
                    onCheckedChange={(checked) => setValue("active", checked === true)}
                  />
                  <FieldLabel htmlFor="create-project-active">Aktif</FieldLabel>
                </div>
              </Field>
            </FieldGroup>
          </div>

          <SheetFooter
            className="px-6 py-4"
            style={{ borderTop: "1px solid var(--app-panel-border)" }}
          >
            <Button type="submit" className="w-full cursor-pointer" disabled={isSubmitting}>
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

function EditProjectDialog({
  project,
  onSuccess,
}: {
  project: Project;
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
    watch,
    formState: { errors, isSubmitting },
  } = useForm<ProjectFormValues>({
    resolver: zodResolver(projectSchema),
  });

  const active = watch("active");

  useEffect(() => {
    if (open) {
      reset({
        title: project.title,
        startDate: project.startDate,
        endDate: project.endDate,
        active: project.active,
      });
      setStartDate(project.startDate ? new Date(project.startDate) : undefined);
      setEndDate(project.endDate ? new Date(project.endDate) : undefined);
    }
  }, [open, project, reset]);

  const onSubmit = handleSubmit(async (data) => {
    try {
      await fetcher(`${API_BASE_URL}/projects/${project.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      toast("Proje güncellendi");
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
          size="icon-sm"
          variant="ghost"
          className="cursor-pointer text-muted-foreground hover:text-foreground"
        >
          <PencilIcon className="w-3.5 h-3.5" />
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-sm">
        <DialogHeader>
          <DialogTitle>Projeyi Düzenle</DialogTitle>
        </DialogHeader>
        <form noValidate onSubmit={onSubmit}>
          <FieldGroup>
            <Field>
              <FieldLabel htmlFor="edit-project-title">Proje Adı</FieldLabel>
              <Input
                {...register("title")}
                id="edit-project-title"
                placeholder="Proje adı"
              />
              <FieldError>{errors.title?.message}</FieldError>
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
                    onSelect={(d) => {
                      setStartDate(d);
                      setValue("startDate", d ? format(d, "yyyy-MM-dd") : "", {
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
                    onSelect={(d) => {
                      setEndDate(d);
                      setValue("endDate", d ? format(d, "yyyy-MM-dd") : "", {
                        shouldValidate: true,
                      });
                    }}
                  />
                </PopoverContent>
              </Popover>
              <FieldError>{errors.endDate?.message}</FieldError>
            </Field>

            <Field>
              <div className="flex items-center gap-3">
                <Checkbox
                  id="edit-project-active"
                  checked={active}
                  onCheckedChange={(checked) => setValue("active", checked === true)}
                />
                <FieldLabel htmlFor="edit-project-active">Aktif</FieldLabel>
              </div>
            </Field>
            <Field>
              <Button type="submit" className="cursor-pointer" disabled={isSubmitting}>
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

export default function Projects() {
  const { data, isLoading, isValidating, error, mutate } =
    useSWR<GetProjectsResponse>(`${API_BASE_URL}/projects`, fetcher);

  useEffect(() => {
    if (error) {
      toast(error instanceof Error ? error.message : "Veriler yüklenemedi");
    }
  }, [error]);

  const handleDelete = async (id: number) => {
    try {
      await fetcher(`${API_BASE_URL}/projects/${id}`, { method: "DELETE" });
      toast("Proje silindi");
      mutate();
    } catch (err) {
      toast(err instanceof Error ? err.message : "Bir hata oluştu");
    }
  };

  const handleToggleActive = async (project: Project) => {
    try {
      await fetcher(`${API_BASE_URL}/projects/${project.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ active: !project.active }),
      });
      mutate();
    } catch (err) {
      toast(err instanceof Error ? err.message : "Bir hata oluştu");
    }
  };

  const projects = data?.projects ?? [];

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
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1
              className="text-2xl font-semibold tracking-tight mb-1 text-foreground"
              style={{ letterSpacing: "-0.03em" }}
            >
              Projeler
            </h1>
            <p className="text-sm font-mono text-muted-foreground">
              {data && <span>{projects.length} proje</span>}
            </p>
          </div>
          <CreateProjectSheet onSuccess={() => mutate()} />
        </div>

        {isLoading || isValidating ? (
          <div className="flex items-center justify-center py-16">
            <Loader2Icon className="animate-spin text-muted-foreground" />
          </div>
        ) : projects.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 gap-3">
            <p className="text-sm font-mono text-muted-foreground">
              Henüz proje oluşturulmamış
            </p>
          </div>
        ) : (
          <div
            className="rounded-xl overflow-hidden"
            style={{ border: "1px solid var(--app-panel-border)" }}
          >
            <table className="w-full">
              <thead>
                <tr
                  style={{
                    background: "var(--app-table-header-bg)",
                    borderBottom: "1px solid var(--app-table-header-border)",
                  }}
                >
                  <th className="text-left px-4 py-3 text-xs font-mono text-muted-foreground tracking-wide">
                    Proje Adı
                  </th>
                  <th className="text-left px-4 py-3 text-xs font-mono text-muted-foreground tracking-wide">
                    Tarih Aralığı
                  </th>
                  <th className="text-left px-4 py-3 text-xs font-mono text-muted-foreground tracking-wide">
                    Durum
                  </th>
                  <th className="text-right px-4 py-3 text-xs font-mono text-muted-foreground tracking-wide">
                    İşlemler
                  </th>
                </tr>
              </thead>
              <tbody>
                {projects.map((project, i) => (
                  <tr
                    key={project.id}
                    style={{
                      background:
                        i % 2 === 0 ? "var(--app-row-even)" : "var(--app-row-odd)",
                      borderBottom:
                        i < projects.length - 1
                          ? "1px solid var(--app-row-border)"
                          : "none",
                    }}
                  >
                    <td className="px-4 py-3">
                      <span className="text-sm text-foreground">{project.title}</span>
                    </td>
                    <td className="px-4 py-3">
                      <span className="text-xs font-mono text-muted-foreground">
                        {format(new Date(project.startDate), "dd.MM.yyyy")}
                        {" — "}
                        {format(new Date(project.endDate), "dd.MM.yyyy")}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <button
                        onClick={() => handleToggleActive(project)}
                        className="cursor-pointer"
                      >
                        <Badge
                          variant="outline"
                          className={cn(
                            "text-xs px-2 py-0 h-5 font-mono",
                            project.active
                              ? "bg-[rgba(74,222,128,0.06)] border-[rgba(74,222,128,0.2)] text-[#4ade80]"
                              : "text-muted-foreground",
                          )}
                        >
                          {project.active ? "Aktif" : "Pasif"}
                        </Badge>
                      </button>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-end gap-1">
                        <EditProjectDialog
                          project={project}
                          onSuccess={() => mutate()}
                        />
                        <Button
                          size="icon-sm"
                          variant="ghost"
                          className="cursor-pointer text-muted-foreground hover:text-red-400"
                          onClick={() => handleDelete(project.id)}
                        >
                          <Trash2Icon className="w-3.5 h-3.5" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
