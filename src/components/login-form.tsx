"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { AppleGlyph, EyeOpenIcon, GoogleGlyph } from "@/components/studybites-icons";
import { useAuth, validateLoginForm } from "@/lib/auth";
import type { LoginFormValues } from "@/types/auth";

const initialValues: LoginFormValues = {
  email: "",
  password: "",
};

export function LoginForm() {
  const router = useRouter();
  const { login } = useAuth();
  const [values, setValues] = useState<LoginFormValues>(initialValues);
  const [errors, setErrors] = useState<Partial<Record<keyof LoginFormValues, string>>>({});
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState("");

  const hasErrors = useMemo(() => Object.keys(errors).length > 0, [errors]);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const nextErrors = validateLoginForm(values);
    setErrors(nextErrors);
    setSubmitError("");

    if (Object.keys(nextErrors).length > 0) {
      return;
    }

    setIsSubmitting(true);
    const result = await login(values);
    setIsSubmitting(false);

    if (!result.ok) {
      setSubmitError(result.message);
      return;
    }

    router.push("/library");
  }

  function handleChange(field: keyof LoginFormValues, value: string) {
    setValues((current) => ({ ...current, [field]: value }));
    setErrors((current) => ({ ...current, [field]: undefined }));
    setSubmitError("");
  }

  const disabled = isSubmitting;

  return (
    <div className="mx-auto flex w-full max-w-lg flex-col items-center rounded-2xl bg-bg-default py-4 shadow-[var(--studybites-shadow)] transition duration-1000 ease-in">
      <h2 className="mb-6 px-2 text-lg font-bold text-text-default sm:text-xl">Sign in</h2>

      <div className="my-2 flex w-full items-center justify-center gap-3">
        <button
          type="button"
          className="relative z-4 flex h-10 w-10 items-center justify-center rounded-[4px] bg-white ring-1 ring-black/5"
          aria-label="Continue with Apple"
        >
          <AppleGlyph />
        </button>
        <button
          type="button"
          className="relative z-4 flex h-10 w-10 items-center justify-center rounded-[4px] bg-white ring-1 ring-black/5"
          aria-label="Continue with Google"
        >
          <GoogleGlyph />
        </button>
      </div>

      <div className="my-2 flex items-center gap-3 text-sm font-semibold text-text-secondary">
        <span className="h-px w-16 bg-border sm:w-24" />
        <span>Or</span>
        <span className="h-px w-16 bg-border sm:w-24" />
      </div>

      <form className="w-full" onSubmit={handleSubmit} noValidate>
        <div className="mt-2 flex w-full flex-col items-center justify-center">
          <div className="relative my-1 w-full px-3 sm:px-10">
            <label
              className="mb-2 block text-start text-sm font-semibold text-text-default"
              htmlFor="email"
            >
              Email
            </label>
            <input
              id="email"
              type="email"
              name="email"
              value={values.email}
              onChange={(event) => handleChange("email", event.target.value)}
              className="peer w-full rounded-xl border border-primary/50 bg-bg-default px-2 py-3 font-semibold text-text-default focus:border-primary-400 focus:shadow-sm focus:outline-hidden focus:ring-0"
              aria-invalid={Boolean(errors.email)}
            />
            {errors.email ? (
              <p className="mt-2 text-xs font-semibold text-red-500">{errors.email}</p>
            ) : null}
          </div>

          <div className="relative my-1 w-full px-3 sm:px-10">
            <label
              className="mb-2 block text-start text-sm font-semibold text-text-default"
              htmlFor="password"
            >
              Password
            </label>
            <input
              id="password"
              type={showPassword ? "text" : "password"}
              name="password"
              value={values.password}
              onChange={(event) => handleChange("password", event.target.value)}
              className="w-full rounded-xl border border-primary/50 bg-bg-default px-2 py-3 font-semibold text-text-default focus:border-primary-400 focus:shadow-sm focus:outline-hidden focus:ring-0"
              aria-invalid={Boolean(errors.password)}
            />
            <button
              type="button"
              className="absolute top-10 cursor-pointer ltr:right-5 rtl:left-5 sm:ltr:right-12 sm:rtl:left-12"
              onClick={() => setShowPassword((current) => !current)}
              aria-label={showPassword ? "Hide password" : "Show password"}
            >
              <EyeOpenIcon />
            </button>
            {errors.password ? (
              <p className="mt-2 text-xs font-semibold text-red-500">{errors.password}</p>
            ) : null}
          </div>

          <div className="w-full px-3 sm:px-10">
            <Link href="#" className="text-xs font-semibold text-primary">
              Forgot Password?
            </Link>
          </div>

          <div id="sign-in" className="relative my-2 w-full px-3 pt-4 sm:px-10">
            <button
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-primary px-4 py-3 font-bold text-white transition duration-200 ease-in disabled:bg-primary-300 disabled:text-white/80"
              type="submit"
              disabled={disabled}
            >
              {isSubmitting ? "Signing in..." : "Sign in"}
            </button>
          </div>
        </div>
      </form>

      {submitError ? (
        <p className="px-6 pb-1 text-center text-xs font-semibold text-red-500">{submitError}</p>
      ) : null}

      <div className="flex items-center gap-1 px-6 pt-2 text-sm text-text-secondary">
        <span>Don&apos;t have an account?</span>
        <Link href="#" className="font-bold text-primary">
          Create an account
        </Link>
      </div>

      {hasErrors ? (
        <p className="px-6 pt-3 text-center text-[11px] font-medium text-text-secondary">
          The real page validates email format and requires an 8+ character password before
          submit.
        </p>
      ) : null}
    </div>
  );
}
