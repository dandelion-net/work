import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";

export default function WebhookTester() {
  const [isTesting, setIsTesting] = useState(false);
  const { toast } = useToast();

  const testWebhook = async () => {
    setIsTesting(true);
    try {
      const response = await fetch("/api/webhooks/test", {
        method: "POST",
      });

      if (!response.ok) {
        throw new Error("Failed to test webhook");
      }

      toast({
        title: "Success",
        description: "Test webhook dispatched successfully",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to test webhook",
        variant: "destructive",
      });
    } finally {
      setIsTesting(false);
    }
  };

  return (
    <Card className="p-6">
      <h3 className="text-lg font-semibold mb-4">Webhook Tester</h3>
      <p className="text-sm text-muted-foreground mb-4">
        Send a test webhook to verify your webhook endpoints are working correctly.
      </p>
      <Button onClick={testWebhook} disabled={isTesting}>
        {isTesting ? "Sending Test..." : "Send Test Webhook"}
      </Button>
    </Card>
  );
}