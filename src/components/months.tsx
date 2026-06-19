import { zodResolver } from "@hookform/resolvers/zod";
import { format } from "date-fns";
import {
  ArrowRightIcon,
  CalendarIcon,
  IdCardLanyardIcon,
  Loader2Icon,
  PlusIcon,
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
import { Card, CardContent } from "@/components/ui/card";
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
import type { GetMonthsResponse } from "@/types/month";

type MonthEntry = GetMonthsResponse["months"][number];

const monthCreateSchema = z.object({
  name: z.string().min(1, { error: "Ay adı gereklidir" }),
  startDate: z
    .string({ error: "Başlangıç tarihi gereklidir" })
    .min(1, { error: "Başlangıç tarihi gereklidir" }),
  endDate: z
    .string({ error: "Bitiş tarihi gereklidir" })
    .min(1, { error: "Bitiş tarihi gereklidir" }),
});

type MonthCreateValues = z.infer<typeof monthCreateSchema>;

function CreateMonthSheet({ onCreated }: { onCreated: (id: number) => void }) {
  const [open, setOpen] = useState(false);
  const [startDate, setStartDate] = useState<Date | undefined>();
  const [endDate, setEndDate] = useState<Date | undefined>();

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<MonthCreateValues>({
    resolver: zodResolver(monthCreateSchema),
  });

  const onSubmit = handleSubmit(async (monthData) => {
    try {
      const result = await fetcher<{ createdMonth: { id: number } }>(
        `${API_BASE_URL}/months`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(monthData),
        },
      );
      toast("Ay başarıyla oluşturuldu");
      reset();
      setStartDate(undefined);
      setEndDate(undefined);
      setOpen(false);
      onCreated(result.createdMonth.id);
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
          Yeni Ay
        </Button>
      </SheetTrigger>
      <SheetContent className="sm:max-w-md p-0 flex flex-col">
        <SheetHeader
          className="px-6 py-5"
          style={{ borderBottom: "1px solid var(--app-panel-border)" }}
        >
          <SheetTitle>Yeni Ay</SheetTitle>
        </SheetHeader>

        <form
          noValidate
          onSubmit={onSubmit}
          className="flex flex-col flex-1 min-h-0"
        >
          <div className="flex-1 overflow-y-auto px-6 py-5">
            <FieldGroup>
              <Field>
                <FieldLabel htmlFor="create-month-name">Ay Adı</FieldLabel>
                <Input
                  {...register("name")}
                  id="create-month-name"
                  placeholder="Ay adı"
                />
                <FieldError>{errors.name?.message}</FieldError>
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
            </FieldGroup>
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
                "Ay Oluştur"
              )}
            </Button>
          </SheetFooter>
        </form>
      </SheetContent>
    </Sheet>
  );
}

interface MonthCardProps {
  entry: MonthEntry;
}

function MonthCard({ entry }: MonthCardProps) {
  const [hovered, setHovered] = useState(false);
  const navigate = useNavigate();

  return (
    <Card
      onClick={() => navigate(`/months/${entry.month.id}`)}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      className={cn(
        "cursor-pointer relative overflow-hidden transition-all duration-300 flex flex-col",
        hovered ? "-translate-y-0.5" : "",
      )}
      style={{
        background: hovered ? "var(--app-card-bg-hover)" : "var(--app-card-bg)",
        borderColor: hovered
          ? "var(--app-card-border-hover)"
          : "var(--app-card-border)",
        boxShadow: hovered
          ? "var(--app-card-shadow-hover)"
          : "var(--app-card-shadow)",
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

      <CardContent className="px-5 py-5 flex flex-col flex-1 gap-4">
        <h3
          className={cn(
            "text-lg font-semibold leading-tight transition-colors duration-200",
            hovered ? "text-foreground" : "text-foreground/80",
          )}
          style={{ letterSpacing: "-0.02em" }}
        >
          {entry.month.name}
        </h3>

        <div className="flex flex-col gap-2 mt-auto">
          <div className="flex items-center gap-1.5 text-xs font-mono text-muted-foreground">
            <CalendarIcon className="w-3 h-3 flex-shrink-0" />
            <span>
              {format(new Date(entry.month.startDate), "dd.MM.yyyy")}
              {" — "}
              {format(new Date(entry.month.endDate), "dd.MM.yyyy")}
            </span>
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <IdCardLanyardIcon className="w-3.5 h-3.5 text-muted-foreground" />
              <span className="text-xs font-mono text-muted-foreground">
                Personel:
              </span>
              <Badge
                variant="outline"
                className="text-xs px-2 py-0 h-5 font-mono bg-[rgba(74,222,128,0.06)] border-[rgba(74,222,128,0.2)] text-[#4ade80]"
              >
                {entry.workerCount}
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

export default function Months() {
  const navigate = useNavigate();
  const { data, isLoading, isValidating, error, mutate } =
    useSWR<GetMonthsResponse>(`${API_BASE_URL}/months`, fetcher);

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
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1
              className="text-2xl font-semibold tracking-tight mb-1 text-foreground"
              style={{ letterSpacing: "-0.03em" }}
            >
              Aylar
            </h1>
            <p className="text-sm font-mono text-muted-foreground">
              {data && <span>{data.months.length} ay</span>}
            </p>
          </div>
          <CreateMonthSheet
            onCreated={(id) => {
              mutate();
              navigate(`/months/${id}`);
            }}
          />
        </div>

        {data && !(isLoading || isValidating) ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
            {data.months.map((entry) => (
              <MonthCard key={entry.month.id} entry={entry} />
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
