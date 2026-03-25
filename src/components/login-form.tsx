import { zodResolver } from "@hookform/resolvers/zod";
import { EyeIcon, EyeOffIcon } from "lucide-react";
import { useState } from "react";
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
import {
  InputGroup,
  InputGroupAddon,
  InputGroupButton,
  InputGroupInput,
} from "@/components/ui/input-group";
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
  const [showPassword, setShowPassword] = useState(false);
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
                <InputGroup>
                  <InputGroupInput
                    {...register("password")}
                    id="password"
                    autoComplete="current-password"
                    placeholder="••••••••"
                    type={showPassword ? "text" : "password"}
                    required
                  />
                  <InputGroupAddon align="inline-end">
                    <InputGroupButton
                      className="cursor-pointer"
                      size="icon-xs"
                      onClick={() => setShowPassword((v) => !v)}
                      aria-label={
                        showPassword ? "Parolayı gizle" : "Parolayı göster"
                      }
                    >
                      {showPassword ? (
                        <EyeOffIcon className="pointer-events-none" />
                      ) : (
                        <EyeIcon className="pointer-events-none" />
                      )}
                    </InputGroupButton>
                  </InputGroupAddon>
                </InputGroup>

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
