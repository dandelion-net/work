import { useState, useEffect } from "react";
import { useInView } from "react-intersection-observer";
import { Card } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";

interface ActivityLog {
  id: string;
  action: string;
  entityType: string;
  entityId: string;
  metadata: any;
  createdAt: string;
  user: {
    name: string | null;
    email: string | null;
  };
}

export default function ActivityLogs() {
  const [logs, setLogs] = useState<ActivityLog[]>([]);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [entityTypeFilter, setEntityTypeFilter] = useState("");
  const [actionFilter, setActionFilter] = useState("");
  const { ref, inView } = useInView();
  const { toast } = useToast();

  const fetchLogs = async (reset = false) => {
    if (isLoading || (!hasMore && !reset)) return;
    setIsLoading(true);

    const currentPage = reset ? 1 : page;
    const queryParams = new URLSearchParams({
      page: currentPage.toString(),
      limit: "20",
      ...(entityTypeFilter && { entityType: entityTypeFilter }),
      ...(actionFilter && { action: actionFilter }),
    });

    try {
      const response = await fetch(`/api/activity?${queryParams.toString()}`);
      const data = await response.json();

      if (!response.ok) throw new Error(data.error);
      
      if (data.logs.length === 0) {
        setHasMore(false);
        return;
      }

      setLogs(prev => reset ? data.logs : [...prev, ...data.logs]);
      setPage(prev => reset ? 2 : prev + 1);
      setHasMore(data.logs.length === 20);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to fetch activity logs",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs(true);
  }, [entityTypeFilter, actionFilter]);

  useEffect(() => {
    if (inView) {
      fetchLogs();
    }
  }, [inView]);

  const formatMetadata = (metadata: any) => {
    if (!metadata) return "";
    return Object.entries(metadata)
      .map(([key, value]) => `${key}: ${value}`)
      .join(", ");
  };

  return (
    <Card className="p-6">
      <div className="space-y-4">
        <div className="flex items-center gap-4">
          <Select
            value={entityTypeFilter}
            onValueChange={setEntityTypeFilter}
          >
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Filter by entity" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">All entities</SelectItem>
              <SelectItem value="problem">Problems</SelectItem>
              <SelectItem value="solution">Solutions</SelectItem>
              <SelectItem value="comment">Comments</SelectItem>
              <SelectItem value="vote">Votes</SelectItem>
              <SelectItem value="user">Users</SelectItem>
            </SelectContent>
          </Select>

          <Select
            value={actionFilter}
            onValueChange={setActionFilter}
          >
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Filter by action" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">All actions</SelectItem>
              <SelectItem value="create">Create</SelectItem>
              <SelectItem value="update">Update</SelectItem>
              <SelectItem value="delete">Delete</SelectItem>
              <SelectItem value="status_change">Status Change</SelectItem>
              <SelectItem value="role_change">Role Change</SelectItem>
              <SelectItem value="vote">Vote</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-4">
          {logs.map((log) => (
            <div
              key={log.id}
              className="p-4 bg-card border rounded-lg"
            >
              <div className="flex items-start justify-between">
                <div>
                  <p className="font-medium">
                    {log.user.name || log.user.email} {log.action} a {log.entityType}
                  </p>
                  {log.metadata && (
                    <p className="text-sm text-muted-foreground mt-1">
                      {formatMetadata(log.metadata)}
                    </p>
                  )}
                </div>
                <time className="text-sm text-muted-foreground">
                  {new Date(log.createdAt).toLocaleString()}
                </time>
              </div>
            </div>
          ))}

          {isLoading && (
            <div className="space-y-2">
              {[...Array(3)].map((_, i) => (
                <div
                  key={i}
                  className="h-16 bg-muted animate-pulse rounded-md"
                />
              ))}
            </div>
          )}
        </div>

        <div ref={ref} className="h-10" />
      </div>
    </Card>
  );
}