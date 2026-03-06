import { zodResolver } from "@hookform/resolvers/zod";
import { ClockIcon, Loader2Icon, PlusIcon, Trash2Icon } from "lucide-react";
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
import type {
  GetHourDefinitionsResponse,
  HourDefinition,
} from "@/types/hour-definition";

const hourDefinitionSchema = z.object({
  multiplier: z.coerce
    .number()
    .min(0.01, { error: "Çarpan 0'dan büyük olmalıdır" })
    .max(9.99, { error: "Çarpan 9.99'dan küçük olmalıdır" }),
});

type HourDefinitionFormValues = z.infer<typeof hourDefinitionSchema>;

function CreateHourDefinitionDialog({ onSuccess }: { onSuccess: () => void }) {
  const [open, setOpen] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<HourDefinitionFormValues>({
    resolver: zodResolver(hourDefinitionSchema),
  });

  const onSubmit = handleSubmit(async (data) => {
    try {
      await fetcher(`${API_BASE_URL}/hour-definitions`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      toast("Saat tanımlaması başarıyla oluşturuldu");
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
          Yeni Tanımlama
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-xs">
        <DialogHeader>
          <DialogTitle>Saat Tanımlaması</DialogTitle>
        </DialogHeader>
        <form noValidate onSubmit={onSubmit}>
          <FieldGroup>
            <Field>
              <FieldLabel htmlFor="create-multiplier">Çarpan</FieldLabel>
              <Input
                {...register("multiplier")}
                id="create-multiplier"
                type="number"
                step="0.01"
                placeholder="0.3"
              />
              <FieldError>{errors.multiplier?.message}</FieldError>
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

function DeleteHourDefinitionButton({
  hourDefinition,
  onSuccess,
}: {
  hourDefinition: HourDefinition;
  onSuccess: () => void;
}) {
  const [loading, setLoading] = useState(false);

  const handleDelete = async () => {
    setLoading(true);
    try {
      await fetcher(`${API_BASE_URL}/hour-definitions/${hourDefinition.id}`, {
        method: "DELETE",
      });
      toast("Saat tanımlaması silindi");
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
          <AlertDialogTitle>Saat tanımlamasını sil</AlertDialogTitle>
          <AlertDialogDescription>
            <span className="font-semibold text-[#e0e0e0]">
              ×{hourDefinition.multiplier}
            </span>{" "}
            çarpanlı saat tanımlamasını silmek istediğinizden emin misiniz?
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

export default function HourDefinitions() {
  const { data, isLoading, error, mutate } = useSWR<GetHourDefinitionsResponse>(
    `${API_BASE_URL}/hour-definitions`,
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
        className="max-w-3xl mx-auto rounded-2xl p-4 sm:p-8"
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
              Saat Tanımlamaları
            </h1>
            <p className="text-sm font-mono text-[#383838]">
              {data && <span>{data.hourDefinitions.length} tanımlama</span>}
            </p>
          </div>
          <CreateHourDefinitionDialog onSuccess={() => mutate()} />
        </div>

        {/* Table */}
        {isLoading ? (
          <div className="flex items-center justify-center py-16">
            <Loader2Icon className="animate-spin text-[#383838]" />
          </div>
        ) : data && data.hourDefinitions.length > 0 ? (
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
                    ID
                  </th>
                  <th className="text-left px-4 py-3 text-xs font-mono text-[#525252] tracking-wide">
                    Çarpan
                  </th>
                  <th className="text-left px-4 py-3 text-xs font-mono text-[#525252] tracking-wide">
                    Oluşturulma
                  </th>
                  <th className="px-4 py-3" />
                </tr>
              </thead>
              <tbody>
                {data.hourDefinitions.map((hd, i) => (
                  <tr
                    key={hd.id}
                    style={{
                      background: i % 2 === 0 ? "#0e0e0e" : "#111111",
                      borderBottom:
                        i < data.hourDefinitions.length - 1
                          ? "1px solid #1a1a1a"
                          : "none",
                    }}
                    className="transition-colors hover:bg-[#161616]"
                  >
                    <td className="px-4 py-3">
                      <span className="text-xs font-mono text-[#404040]">
                        #{hd.id}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <ClockIcon className="w-3.5 h-3.5 text-[#404040]" />
                        <span className="text-sm font-mono text-[#c8c8c8]">
                          ×{hd.multiplier}
                        </span>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <span className="text-xs font-mono text-[#404040]">
                        {new Date(hd.createdAt).toLocaleDateString("tr-TR")}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-end">
                        <DeleteHourDefinitionButton
                          hourDefinition={hd}
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
            <ClockIcon className="w-8 h-8 text-[#2a2a2a]" />
            <p className="text-sm font-mono text-[#383838]">
              Henüz saat tanımlaması yok
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
