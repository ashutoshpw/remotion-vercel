"use client";

import { FormEvent, useMemo, useState } from "react";
import { authClient } from "../lib/auth-client";
import { Button } from "./Button";
import { InputContainer } from "./Container";

type Mode = "sign-in" | "sign-up";

const inputClassName =
  "leading-[1.7] block w-full rounded-geist bg-background p-geist-half text-foreground text-sm border border-unfocused-border-color transition-colors duration-150 ease-in-out focus:border-focused-border-color outline-none";

export const AuthCard: React.FC = () => {
  const [mode, setMode] = useState<Mode>("sign-up");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  const title = useMemo(() => {
    return mode === "sign-up" ? "Create your account" : "Welcome back";
  }, [mode]);

  const onSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsSubmitting(true);
    setMessage(null);

    try {
      if (mode === "sign-up") {
        const { error } = await authClient.signUp.email({
          name,
          email,
          password,
        });

        if (error) {
          throw new Error(error.message ?? "Unable to create account.");
        }
      } else {
        const { error } = await authClient.signIn.email({
          email,
          password,
        });

        if (error) {
          throw new Error(error.message ?? "Unable to sign in.");
        }
      }

      setMessage(mode === "sign-up" ? "Account created." : "Signed in.");
      setPassword("");
    } catch (error) {
      setMessage((error as Error).message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-md mx-auto mt-20 px-4">
      <InputContainer>
        <div className="flex flex-col gap-2">
          <span className="text-xs font-semibold uppercase tracking-[0.24em] text-subtitle">
            better-auth
          </span>
          <h1 className="text-2xl font-semibold text-foreground">{title}</h1>
          <p className="text-sm text-subtitle">
            Sign in to create Vercel-style teams, group projects, and save reusable assets.
          </p>
        </div>
        <form className="mt-6 flex flex-col gap-3" onSubmit={onSubmit}>
          {mode === "sign-up" ? (
            <div className="flex flex-col gap-1">
              <label className="text-sm font-medium text-foreground" htmlFor="auth-name">
                Name
              </label>
              <input
                id="auth-name"
                className={inputClassName}
                value={name}
                onChange={(event) => setName(event.currentTarget.value)}
                placeholder="Ada Lovelace"
                autoComplete="name"
                required
              />
            </div>
          ) : null}
          <div className="flex flex-col gap-1">
            <label className="text-sm font-medium text-foreground" htmlFor="auth-email">
              Email
            </label>
            <input
              id="auth-email"
              className={inputClassName}
              type="email"
              value={email}
              onChange={(event) => setEmail(event.currentTarget.value)}
              placeholder="you@example.com"
              autoComplete="email"
              required
            />
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-sm font-medium text-foreground" htmlFor="auth-password">
              Password
            </label>
            <input
              id="auth-password"
              className={inputClassName}
              type="password"
              value={password}
              onChange={(event) => setPassword(event.currentTarget.value)}
              placeholder="At least 8 characters"
              autoComplete={mode === "sign-up" ? "new-password" : "current-password"}
              minLength={8}
              required
            />
          </div>
          {message ? <p className="text-sm text-subtitle">{message}</p> : null}
          <div className="flex justify-end">
            <Button disabled={isSubmitting} loading={isSubmitting}>
              {mode === "sign-up" ? "Create account" : "Sign in"}
            </Button>
          </div>
        </form>
        <div className="mt-4 text-sm text-subtitle">
          {mode === "sign-up" ? "Already have an account?" : "Need an account?"}{" "}
          <button
            className="text-foreground underline underline-offset-4"
            onClick={() => {
              setMode(mode === "sign-up" ? "sign-in" : "sign-up");
              setMessage(null);
            }}
            type="button"
          >
            {mode === "sign-up" ? "Sign in" : "Create one"}
          </button>
        </div>
      </InputContainer>
    </div>
  );
};
