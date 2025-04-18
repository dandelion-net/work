import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

export default function OnboardingWizard() {
  const [isOpen, setIsOpen] = useState(true);
  const [currentStep, setCurrentStep] = useState(0);
  const [webhookUrl, setWebhookUrl] = useState("");
  const [webhookSecret, setWebhookSecret] = useState("");
  const router = useRouter();
  const { toast } = useToast();

  useEffect(() => {
    checkOnboardingStatus();
  }, []);

  const checkOnboardingStatus = async () => {
    try {
      const response = await fetch("/api/admin/onboarding");
      if (!response.ok) throw new Error("Failed to check onboarding status");
      const data = await response.json();
      if (data.onboarded) {
        setIsOpen(false);
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to check onboarding status",
        variant: "destructive",
      });
    }
  };

  const handleWebhookSetup = async () => {
    try {
      const response = await fetch("/api/webhooks", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          url: webhookUrl,
          secret: webhookSecret,
          events: ["problem.created", "solution.created", "vote.created"],
        }),
      });

      if (!response.ok) throw new Error("Failed to set up webhook");

      setCurrentStep(currentStep + 1);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to set up webhook",
        variant: "destructive",
      });
    }
  };

  const completeOnboarding = async () => {
    try {
      const response = await fetch("/api/admin/onboarding", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ completed: true }),
      });

      if (!response.ok) throw new Error("Failed to complete onboarding");

      toast({
        title: "Success",
        description: "Onboarding completed successfully",
      });
      setIsOpen(false);
      router.push("/admin/dashboard");
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to complete onboarding",
        variant: "destructive",
      });
    }
  };

  const steps = [
    {
      title: "Welcome",
      description: "Welcome to the admin onboarding process. Let's get your discussion board set up.",
      content: (
        <Button onClick={() => setCurrentStep(1)}>Get Started</Button>
      ),
    },
    {
      title: "Webhook Configuration",
      description: "Set up a webhook to receive notifications about new problems, solutions, and votes.",
      content: (
        <div className="space-y-4">
          <Input
            placeholder="Webhook URL"
            value={webhookUrl}
            onChange={(e) => setWebhookUrl(e.target.value)}
          />
          <Input
            placeholder="Webhook Secret (min 32 characters)"
            value={webhookSecret}
            onChange={(e) => setWebhookSecret(e.target.value)}
            type="password"
          />
          <Button onClick={handleWebhookSetup}>
            Set up Webhook
          </Button>
        </div>
      ),
    },
    {
      title: "Complete",
      description: "You're all set! Your discussion board is ready to use.",
      content: (
        <Button onClick={completeOnboarding}>
          Complete Onboarding
        </Button>
      ),
    },
  ];

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{steps[currentStep].title}</DialogTitle>
          <DialogDescription>
            {steps[currentStep].description}
          </DialogDescription>
        </DialogHeader>
        <div className="py-4">
          {steps[currentStep].content}
        </div>
      </DialogContent>
    </Dialog>
  );
}