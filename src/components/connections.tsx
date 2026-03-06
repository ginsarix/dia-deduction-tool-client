import { zodResolver } from "@hookform/resolvers/zod";
import {
  Loader2Icon,
  PencilIcon,
  PlugIcon,
  PlusIcon,
  Trash2Icon,
} from "lucide-react";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { useParams } from "react-router";
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
import { API_BASE_URL } from "@/config/api";
import { fetcher } from "@/lib/fetcher";
import type { Connection, GetConnectionsResponse } from "@/types/connection";

const connectionCreateSchema = z.object({
  name: z.string().min(1, { error: "Ad gereklidir" }),
  diaServerCode: z.string().min(1, { error: "Sunucu kodu gereklidir" }),
  diaUsername: z.string().min(1, { error: "Kullanıcı adı gereklidir" }),
  diaPassword: z.string().min(1, { error: "Parola gereklidir" }),
  diaApiKey: z.string().optional(),
  diaFirmCode: z.coerce
    .number()
    .int()
    .positive({ error: "Geçerli firma kodu giriniz" }),
  diaPeriodCode: z.coerce.number().int().default(0),
});

const connectionEditSchema = z.object({
  name: z.string().min(1, { error: "Ad gereklidir" }).optional(),
  diaServerCode: z
    .string()
    .min(1, { error: "Sunucu kodu gereklidir" })
    .optional(),
  diaUsername: z
    .string()
    .min(1, { error: "Kullanıcı adı gereklidir" })
    .optional(),
  diaPassword: z.string().optional(),
  diaApiKey: z.string().optional(),
  diaFirmCode: z.coerce
    .number()
    .int()
    .positive({ error: "Geçerli firma kodu giriniz" })
    .optional(),
  diaPeriodCode: z.coerce.number().int().optional(),
});

type ConnectionCreateValues = z.infer<typeof connectionCreateSchema>;
type ConnectionEditValues = z.infer<typeof connectionEditSchema>;

function CreateConnectionDialog({ onSuccess }: { onSuccess: () => void }) {
  const { create } = useParams();

  const [open, setOpen] = useState(!!create);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<ConnectionCreateValues>({
    resolver: zodResolver(connectionCreateSchema),
    defaultValues: { diaPeriodCode: 0 },
  });

  const onSubmit = handleSubmit(async (data) => {
    try {
      await fetcher(`${API_BASE_URL}/connections`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      toast("DIA bağlantısı başarıyla oluşturuldu");
      reset();
      setOpen(false);
      onSuccess();
    } catch (err) {
      toast(err instanceof Error ? err.message : "Bir hata oluştu");
    }
  });

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm" className="cursor-pointer gap-1.5">
          <PlusIcon className="w-4 h-4" />
          Yeni Bağlantı
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Yeni DIA Bağlantısı</DialogTitle>
        </DialogHeader>
        <form noValidate onSubmit={onSubmit}>
          <FieldGroup>
            <Field>
              <FieldLabel htmlFor="create-name">Bağlantı Adı</FieldLabel>
              <Input
                {...register("name")}
                id="create-name"
                placeholder="Bağlantı adı"
              />
              <FieldError>{errors.name?.message}</FieldError>
            </Field>
            <Field>
              <FieldLabel htmlFor="create-serverCode">Sunucu Kodu</FieldLabel>
              <Input
                {...register("diaServerCode")}
                id="create-serverCode"
                placeholder="Sunucu kodu"
              />
              <FieldError>{errors.diaServerCode?.message}</FieldError>
            </Field>
            <Field>
              <FieldLabel htmlFor="create-username">Kullanıcı Adı</FieldLabel>
              <Input
                {...register("diaUsername")}
                id="create-username"
                placeholder="Kullanıcı adı"
              />
              <FieldError>{errors.diaUsername?.message}</FieldError>
            </Field>
            <Field>
              <FieldLabel htmlFor="create-password">Parola</FieldLabel>
              <Input
                {...register("diaPassword")}
                id="create-password"
                type="password"
                placeholder="••••••••"
              />
              <FieldError>{errors.diaPassword?.message}</FieldError>
            </Field>
            <Field>
              <FieldLabel htmlFor="create-apiKey">API Anahtarı</FieldLabel>
              <Input
                {...register("diaApiKey")}
                id="create-apiKey"
                placeholder="API anahtarı"
              />
              <FieldError>{errors.diaApiKey?.message}</FieldError>
            </Field>
            <Field>
              <FieldLabel htmlFor="create-firmCode">Firma Kodu</FieldLabel>
              <Input
                {...register("diaFirmCode")}
                id="create-firmCode"
                type="number"
                placeholder="1"
              />
              <FieldError>{errors.diaFirmCode?.message}</FieldError>
            </Field>
            <Field>
              <FieldLabel htmlFor="create-periodCode">Dönem Kodu</FieldLabel>
              <Input
                {...register("diaPeriodCode")}
                id="create-periodCode"
                type="number"
                placeholder="0"
              />
              <FieldError>{errors.diaPeriodCode?.message}</FieldError>
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
                  "Oluştur"
                )}
              </Button>
            </Field>
          </FieldGroup>
        </form>
      </DialogContent>
    </Dialog>
  );
}

function EditConnectionDialog({
  connection,
  onSuccess,
}: {
  connection: Connection;
  onSuccess: () => void;
}) {
  const [open, setOpen] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<ConnectionEditValues>({
    resolver: zodResolver(connectionEditSchema),
  });

  useEffect(() => {
    if (open) {
      reset({
        name: connection.name,
        diaServerCode: connection.diaServerCode,
        diaUsername: connection.diaUsername,
        diaApiKey: connection.diaApiKey,
        diaFirmCode: connection.diaFirmCode,
        diaPeriodCode: connection.diaPeriodCode ?? 0,
        diaPassword: "",
      });
    }
  }, [open, connection, reset]);

  const onSubmit = handleSubmit(async (data) => {
    const payload: Partial<ConnectionEditValues> = { ...data };
    if (!payload.diaPassword) delete payload.diaPassword;

    try {
      await fetcher(
        `${API_BASE_URL}/connections/${connection.id}`,
        {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        },
      );

      toast("DIA bağlantısı başarıyla güncellendi");
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
          className="cursor-pointer text-[#727272]"
        >
          <PencilIcon />
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Bağlantıyı Düzenle</DialogTitle>
        </DialogHeader>
        <form noValidate onSubmit={onSubmit}>
          <FieldGroup>
            <Field>
              <FieldLabel htmlFor={`edit-name-${connection.id}`}>
                Bağlantı Adı
              </FieldLabel>
              <Input {...register("name")} id={`edit-name-${connection.id}`} />
              <FieldError>{errors.name?.message}</FieldError>
            </Field>
            <Field>
              <FieldLabel htmlFor={`edit-serverCode-${connection.id}`}>
                Sunucu Kodu
              </FieldLabel>
              <Input
                {...register("diaServerCode")}
                id={`edit-serverCode-${connection.id}`}
              />
              <FieldError>{errors.diaServerCode?.message}</FieldError>
            </Field>
            <Field>
              <FieldLabel htmlFor={`edit-username-${connection.id}`}>
                Kullanıcı Adı
              </FieldLabel>
              <Input
                {...register("diaUsername")}
                id={`edit-username-${connection.id}`}
              />
              <FieldError>{errors.diaUsername?.message}</FieldError>
            </Field>
            <Field>
              <FieldLabel htmlFor={`edit-password-${connection.id}`}>
                Parola{" "}
              </FieldLabel>
              <Input
                {...register("diaPassword")}
                id={`edit-password-${connection.id}`}
                type="password"
                placeholder="••••••••"
              />
              <FieldError>{errors.diaPassword?.message}</FieldError>
            </Field>
            <Field>
              <FieldLabel htmlFor={`edit-apiKey-${connection.id}`}>
                API Anahtarı
              </FieldLabel>
              <Input
                {...register("diaApiKey")}
                id={`edit-apiKey-${connection.id}`}
              />
              <FieldError>{errors.diaApiKey?.message}</FieldError>
            </Field>
            <Field>
              <FieldLabel htmlFor={`edit-firmCode-${connection.id}`}>
                Firma Kodu
              </FieldLabel>
              <Input
                {...register("diaFirmCode")}
                id={`edit-firmCode-${connection.id}`}
                type="number"
              />
              <FieldError>{errors.diaFirmCode?.message}</FieldError>
            </Field>
            <Field>
              <FieldLabel htmlFor={`edit-periodCode-${connection.id}`}>
                Dönem Kodu
              </FieldLabel>
              <Input
                {...register("diaPeriodCode")}
                id={`edit-periodCode-${connection.id}`}
                type="number"
              />
              <FieldError>{errors.diaPeriodCode?.message}</FieldError>
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

function DeleteConnectionButton({
  connection,
  onSuccess,
}: {
  connection: Connection;
  onSuccess: () => void;
}) {
  const [loading, setLoading] = useState(false);

  const handleDelete = async () => {
    setLoading(true);
    try {
      await fetcher(
        `${API_BASE_URL}/connections/${connection.id}`,
        {
          method: "DELETE",
        },
      );
      toast("DIA bağlantısı silindi");
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
          className="cursor-pointer text-[#727272] hover:text-red-400"
        >
          <Trash2Icon />
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Bağlantıyı sil</AlertDialogTitle>
          <AlertDialogDescription>
            <span className="font-semibold text-[#e0e0e0]">
              {connection.name}
            </span>{" "}
            bağlantısını silmek istediğinizden emin misiniz? Bu işlem geri
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

export default function Connections() {
  const { data, isLoading, error, mutate } = useSWR<GetConnectionsResponse>(
    `${API_BASE_URL}/connections`,
    fetcher,
  );

  useEffect(() => {
    if (error) {
      toast(error instanceof Error ? error.message : "Veriler yüklenemedi");
    }
  }, [error]);

  return (
    <div className="min-h-screen p-4 sm:p-8 bg-[#0a0a0a] font-sans">
      <div
        className="max-w-5xl mx-auto rounded-2xl p-4 sm:p-8"
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
              DIA Bağlantıları
            </h1>
            <p className="text-sm font-mono text-[#383838]">
              {data && <span>{data.connections.length} bağlantı</span>}
            </p>
          </div>
          <CreateConnectionDialog onSuccess={() => mutate()} />
        </div>

        {/* Table */}
        {isLoading ? (
          <div className="flex items-center justify-center py-16">
            <Loader2Icon className="animate-spin text-[#383838]" />
          </div>
        ) : data && data.connections.length > 0 ? (
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
                    Ad
                  </th>
                  <th className="text-left px-4 py-3 text-xs font-mono text-[#525252] tracking-wide">
                    Sunucu Kodu
                  </th>
                  <th className="text-left px-4 py-3 text-xs font-mono text-[#525252] tracking-wide">
                    Kullanıcı
                  </th>
                  <th className="text-left px-4 py-3 text-xs font-mono text-[#525252] tracking-wide">
                    Firma
                  </th>
                  <th className="text-left px-4 py-3 text-xs font-mono text-[#525252] tracking-wide">
                    Dönem
                  </th>
                  <th className="px-4 py-3" />
                </tr>
              </thead>
              <tbody>
                {data.connections.map((connection, i) => (
                  <tr
                    key={connection.id}
                    style={{
                      background: i % 2 === 0 ? "#0e0e0e" : "#111111",
                      borderBottom:
                        i < data.connections.length - 1
                          ? "1px solid #1a1a1a"
                          : "none",
                    }}
                    className="transition-colors hover:bg-[#161616]"
                  >
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <PlugIcon className="w-3.5 h-3.5 text-[#404040] flex-shrink-0" />
                        <span className="text-sm text-[#c8c8c8] font-medium">
                          {connection.name}
                        </span>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <span className="text-sm font-mono text-[#525252]">
                        {connection.diaServerCode}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span className="text-sm font-mono text-[#525252]">
                        {connection.diaUsername}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span className="text-sm font-mono text-[#525252]">
                        {connection.diaFirmCode}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span className="text-sm font-mono text-[#525252]">
                        {connection.diaPeriodCode ?? 0}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-end gap-1">
                        <EditConnectionDialog
                          connection={connection}
                          onSuccess={() => mutate()}
                        />
                        <DeleteConnectionButton
                          connection={connection}
                          onSuccess={() => mutate()}
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
            <PlugIcon className="w-8 h-8 text-[#2a2a2a]" />
            <p className="text-sm font-mono text-[#383838]">
              Henüz bağlantı yok
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
