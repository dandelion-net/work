import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import UserManagement from "./UserManagement";
import ActivityLogs from "./ActivityLogs";
import ContentModeration from "./ContentModeration";

interface Webhook {
  id: string;
  url: string;
  events: string[];
  active: boolean;
}

export default function AdminDashboard() {
  const [webhooks, setWebhooks] = useState<Webhook[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    fetchWebhooks();
  }, []);

  const fetchWebhooks = async () => {
    try {
      const response = await fetch("/api/webhooks");
      if (!response.ok) throw new Error("Failed to fetch webhooks");
      const data = await response.json();
      setWebhooks(data);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to load webhooks",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleWebhookToggle = async (webhookId: string, active: boolean) => {
    try {
      const response = await fetch(`/api/webhooks/${webhookId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ active }),
      });

      if (!response.ok) throw new Error("Failed to update webhook");
      
      setWebhooks(webhooks.map(webhook => 
        webhook.id === webhookId ? { ...webhook, active } : webhook
      ));

      toast({
        title: "Success",
        description: `Webhook ${active ? "activated" : "deactivated"} successfully`,
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update webhook",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="space-y-6">
      <Card className="p-6">
        <h2 className="text-2xl font-bold mb-4">User Management</h2>
        <UserManagement />
      </Card>

      <Card className="p-6">
        <h2 className="text-2xl font-bold mb-4">Content Moderation</h2>
        <ContentModeration />
      </Card>

      <Card className="p-6">
        <h2 className="text-2xl font-bold mb-4">Activity Logs</h2>
        <ActivityLogs />
      </Card>

      <Card className="p-6">
        <h2 className="text-2xl font-bold mb-4">Webhook Management</h2>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>URL</TableHead>
              <TableHead>Events</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {webhooks.map((webhook) => (
              <TableRow key={webhook.id}>
                <TableCell>{webhook.url}</TableCell>
                <TableCell>{webhook.events.join(", ")}</TableCell>
                <TableCell>
                  {webhook.active ? (
                    <span className="text-green-600">Active</span>
                  ) : (
                    <span className="text-red-600">Inactive</span>
                  )}
                </TableCell>
                <TableCell>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleWebhookToggle(webhook.id, !webhook.active)}
                  >
                    {webhook.active ? "Deactivate" : "Activate"}
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Card>
    </div>
  );
}