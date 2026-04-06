import { zodResolver } from "@hookform/resolvers/zod";
import { format, parse } from "date-fns";
import { CalendarIcon, Loader2Icon, PencilIcon } from "lucide-react";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { API_BASE_URL } from "@/config/api";
import { fetcher } from "@/lib/fetcher";
import { cn } from "@/lib/utils";
import type { GetConnectionsResponse } from "@/types/connection";
import type { Project } from "./types";

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

export function EditProjectDialog({
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
          className="cursor-pointer gap-1.5 text-muted-foreground hover:text-foreground"
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
                <span className="text-muted-foreground font-normal">
                  (opsiyonel)
                </span>
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
                    {endDate ? format(endDate, "dd.MM.yyyy") : "Tarih seçiniz"}
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
