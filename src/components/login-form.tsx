import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { useNavigate } from "react-router";
import { useEffect } from "react";
import { toast } from "sonner";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Field,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { authClient } from "@/lib/auth-client";
import { cn } from "@/lib/utils";

const loginSchema = z.object({
  email: z.email({ error: "Geçerli bir e-posta giriniz" }),
  password: z.string().min(1, { error: "Lütfen parolanızı giriniz" }),
});

export function LoginForm({
  className,
  ...props
}: React.ComponentProps<"div">) {
  const navigate = useNavigate();
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: "", password: "" },
  });

  const { data: session } = authClient.useSession();

  useEffect(() => {
    if (session) {
      navigate("/projects", { replace: true });
    }
  }, [session, navigate]);

  const onSubmit = handleSubmit(async (data) => {
    await authClient.signIn.email(data, { onError: (ctx) => {toast(ctx.error.message)} });
  });

  return (
    <div className={cn("flex flex-col gap-6", className)} {...props}>
      <Card>
        <CardHeader>
          <CardTitle>Hesabınıza giriş yapın</CardTitle>
          <CardDescription>
            Giriş yapmak için e-postanızı giriniz
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form noValidate onSubmit={onSubmit}>
            <FieldGroup>
              <Field>
                <FieldLabel htmlFor="email">E-posta</FieldLabel>
                <Input
                  {...register("email")}
                  id="email"
                  type="email"
                  placeholder="m@example.com"
                  autoComplete="email"
                  required
                />

                <FieldError>{errors.email?.message}</FieldError>
              </Field>
              <Field>
                <div className="flex items-center">
                  <FieldLabel htmlFor="password">Parola</FieldLabel>
                </div>
                <Input
                  {...register("password")}
                  id="password"
                  autoComplete="current-password"
                  placeholder="••••••••"
                  type="password"
                  required
                />

                <FieldError>{errors.password?.message}</FieldError>
              </Field>
              <Field>
                <Button className="cursor-pointer" type="submit">
                  Giriş Yap
                </Button>
              </Field>
            </FieldGroup>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
