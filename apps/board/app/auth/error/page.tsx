"use client";

import { useSearchParams } from "next/navigation";
import { Card } from "@/components/ui/card";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function AuthErrorPage() {
  const searchParams = useSearchParams();
  const error = searchParams.get("error");

  const errorMessages: { [key: string]: string } = {
    default: "An error occurred during authentication.",
    configuration: "There is a problem with the server configuration.",
    accessdenied: "You do not have permission to sign in.",
    verification: "The verification token has expired or has already been used.",
    signin: "Try signing in with a different account.",
  };

  const message = errorMessages[error?.toLowerCase() ?? ""] || errorMessages.default;

  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <Card className="w-full max-w-md p-8">
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-red-600">Authentication Error</h1>
          <p className="text-muted-foreground mt-2">{message}</p>
        </div>
        <div className="flex justify-center">
          <Link href="/auth/signin">
            <Button>Try Again</Button>
          </Link>
        </div>
      </Card>
    </div>
  );
}