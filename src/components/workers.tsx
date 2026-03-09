import { zodResolver } from "@hookform/resolvers/zod";
import {
  IdCardLanyardIcon,
  Loader2Icon,
  PencilIcon,
  RefreshCwIcon,
  Trash2Icon,
} from "lucide-react";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
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
import {
  Field,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { API_BASE_URL } from "@/config/api";
import { fetcher } from "@/lib/fetcher";
import type { GetConnectionsResponse } from "@/types/connection";
import type { GetWorkersResponse, Worker } from "@/types/worker";

const workerEditSchema = z.object({
  name: z.string().min(1, { error: "Ad gereklidir" }).optional(),
  diaKey: z.string().min(1, { error: "DIA anahtarı gereklidir" }).optional(),
  connectionId: z.coerce.number().int().positive().optional(),
});

type WorkerEditValues = z.infer<typeof workerEditSchema>;

function EditWorkerDialog({
  worker,
  connections,
  onSuccess,
}: {
  worker: Worker;
  connections: GetConnectionsResponse["connections"];
  onSuccess: () => void;
}) {
  const [open, setOpen] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<WorkerEditValues>({
    resolver: zodResolver(workerEditSchema),
  });

  useEffect(() => {
    if (open) {
      reset({
        name: worker.name,
        diaKey: worker.diaKey,
        connectionId: worker.connectionId,
      });
    }
  }, [open, worker, reset]);

  const onSubmit = handleSubmit(async (data) => {
    try {
      await fetcher(`${API_BASE_URL}/workers/${worker.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      toast("Personel başarıyla güncellendi");
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
          className="cursor-pointer text-muted-foreground"
        >
          <PencilIcon />
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Personeli Düzenle</DialogTitle>
        </DialogHeader>
        <form noValidate onSubmit={onSubmit}>
          <FieldGroup>
            <Field>
              <FieldLabel htmlFor={`edit-worker-name-${worker.id}`}>
                Ad Soyad
              </FieldLabel>
              <Input
                {...register("name")}
                id={`edit-worker-name-${worker.id}`}
              />
              <FieldError>{errors.name?.message}</FieldError>
            </Field>
            <Field>
              <FieldLabel htmlFor={`edit-worker-diaKey-${worker.id}`}>
                DIA Anahtarı
              </FieldLabel>
              <Input
                {...register("diaKey")}
                id={`edit-worker-diaKey-${worker.id}`}
              />
              <FieldError>{errors.diaKey?.message}</FieldError>
            </Field>
            <Field>
              <FieldLabel>Bağlantı</FieldLabel>
              <Select
                defaultValue={String(worker.connectionId)}
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

function DeleteWorkerButton({
  worker,
  onSuccess,
}: {
  worker: Worker;
  onSuccess: () => void;
}) {
  const [loading, setLoading] = useState(false);

  const handleDelete = async () => {
    setLoading(true);
    try {
      await fetcher(`${API_BASE_URL}/workers/${worker.id}`, {
        method: "DELETE",
      });
      toast("Personel silindi");
      onSuccess();
    } catch (err) {
      toast(err instanceof Error ? err.message : "Bir hata oluştu");
    } finally {
      setLoading(false);
    }
  };

  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <Button
          size="icon-sm"
          variant="ghost"
          className="cursor-pointer text-muted-foreground hover:text-red-400"
        >
          <Trash2Icon />
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Personeli sil</AlertDialogTitle>
          <AlertDialogDescription>
            <span className="font-semibold text-foreground">{worker.name}</span>{" "}
            personelini silmek istediğinizden emin misiniz? Bu işlem geri
            alınamaz.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel className="cursor-pointer">
            İptal
          </AlertDialogCancel>
          <AlertDialogAction
            variant="destructive"
            className="cursor-pointer"
            onClick={handleDelete}
            disabled={loading}
          >
            {loading ? <Loader2Icon className="animate-spin w-4 h-4" /> : "Sil"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}

function SyncWorkersButton({
  connectionId,
  connectionName,
  onSuccess,
}: {
  connectionId: number;
  connectionName: string;
  onSuccess: () => void;
}) {
  const [loading, setLoading] = useState(false);

  const handleSync = async () => {
    setLoading(true);
    try {
      const data = await fetcher(
        `${API_BASE_URL}/workers/sync/${connectionId}`,
        { method: "POST" },
      );
      toast(
        `${connectionName}: ${data.stats.inserted} eklendi, ${data.stats.updated} güncellendi, ${data.stats.deleted} silindi`,
      );
      onSuccess();
    } catch (err) {
      toast(err instanceof Error ? err.message : "Senkronizasyon başarısız");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Button
      size="sm"
      variant="ghost"
      className="cursor-pointer gap-1.5 text-muted-foreground hover:text-foreground"
      onClick={handleSync}
      disabled={loading}
    >
      {loading ? (
        <Loader2Icon className="animate-spin w-3.5 h-3.5" />
      ) : (
        <RefreshCwIcon className="w-3.5 h-3.5" />
      )}
      {connectionName}
    </Button>
  );
}

export default function Workers() {
  const {
    data: workersData,
    isLoading: workersLoading,
    isValidating: workersValidating,
    error: workersError,
    mutate: mutateWorkers,
  } = useSWR<GetWorkersResponse>(`${API_BASE_URL}/workers`, fetcher);

  const { data: connectionsData } = useSWR<GetConnectionsResponse>(
    `${API_BASE_URL}/connections`,
    fetcher,
  );

  useEffect(() => {
    if (workersError) {
      toast(
        workersError instanceof Error
          ? workersError.message
          : "Veriler yüklenemedi",
      );
    }
  }, [workersError]);

  const connections = connectionsData?.connections ?? [];
  const connectionMap = new Map(connections.map((c) => [c.id, c.name]));

  return (
    <div className="min-h-screen p-4 sm:p-8 bg-background font-sans">
      <div
        className="max-w-5xl mx-auto rounded-2xl p-4 sm:p-8"
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
              Personeller
            </h1>
            <p className="text-sm font-mono text-muted-foreground">
              {workersData && (
                <span>{workersData.workers.length} personel</span>
              )}
            </p>
          </div>
          {connections.length > 0 && (
            <div className="flex items-center gap-1">
              {connections.map((conn) => (
                <SyncWorkersButton
                  key={conn.id}
                  connectionId={conn.id}
                  connectionName={conn.name}
                  onSuccess={() => mutateWorkers()}
                />
              ))}
            </div>
          )}
        </div>

        {/* Table */}
        {workersLoading || workersValidating ? (
          <div className="flex items-center justify-center py-16">
            <Loader2Icon className="animate-spin text-muted-foreground" />
          </div>
        ) : workersData && workersData.workers.length > 0 ? (
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
                    Ad Soyad
                  </th>
                  <th className="text-left px-4 py-3 text-xs font-mono text-muted-foreground tracking-wide">
                    DIA Anahtarı
                  </th>
                  <th className="text-left px-4 py-3 text-xs font-mono text-muted-foreground tracking-wide">
                    Bağlantı
                  </th>
                  <th className="px-4 py-3" />
                </tr>
              </thead>
              <tbody>
                {workersData.workers.map((worker, i) => (
                  <tr
                    key={worker.id}
                    style={{
                      background: i % 2 === 0 ? "var(--app-row-even)" : "var(--app-row-odd)",
                      borderBottom:
                        i < workersData.workers.length - 1
                          ? "1px solid var(--app-row-border)"
                          : "none",
                    }}
                    className="transition-colors hover:[background:var(--app-row-hover)]"
                  >
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <IdCardLanyardIcon className="w-3.5 h-3.5 text-muted-foreground flex-shrink-0" />
                        <span className="text-sm text-foreground font-medium">
                          {worker.name}
                        </span>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <span className="text-sm font-mono text-muted-foreground">
                        {worker.diaKey}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <Badge
                        variant="outline"
                        className="text-xs px-2 py-0 h-5 font-mono bg-[rgba(74,222,128,0.06)] border-[rgba(74,222,128,0.2)] text-[#4ade80]"
                      >
                        {connectionMap.get(worker.connectionId) ??
                          `#${worker.connectionId}`}
                      </Badge>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-end gap-1">
                        <EditWorkerDialog
                          worker={worker}
                          connections={connections}
                          onSuccess={() => mutateWorkers()}
                        />
                        <DeleteWorkerButton
                          worker={worker}
                          onSuccess={() => mutateWorkers()}
                        />
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-16 gap-3">
            <IdCardLanyardIcon className="w-8 h-8 text-muted-foreground/40" />
            <p className="text-sm font-mono text-muted-foreground">
              Henüz personel yok
            </p>
            {connections.length > 0 ? (
              <p className="text-xs font-mono text-muted-foreground/40">
                Personelleri çekmek için yukarıdan senkronize edin
              </p>
            ) : (
              <p className="text-xs font-mono text-muted-foreground/40">
                Önce bir bağlantı oluşturun
              </p>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
