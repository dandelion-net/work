import { useState, useEffect } from "react";
import { useInView } from "react-intersection-observer";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";

interface ContentItem {
  id: string;
  title?: string;
  content?: string;
  description?: string;
  createdAt: string;
  moderationStatus: string;
  author: {
    name: string | null;
    email: string | null;
  };
  moderationActions: Array<{
    action: string;
    reason: string;
    createdAt: string;
    moderator: {
      name: string | null;
      email: string | null;
    };
  }>;
}

export default function ContentModeration() {
  const [items, setItems] = useState<ContentItem[]>([]);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [statusFilter, setStatusFilter] = useState("");
  const [typeFilter, setTypeFilter] = useState("");
  const [selectedItem, setSelectedItem] = useState<ContentItem | null>(null);
  const [actionReason, setActionReason] = useState("");
  const [isActionDialogOpen, setIsActionDialogOpen] = useState(false);
  const [currentAction, setCurrentAction] = useState<string | null>(null);
  const { ref, inView } = useInView();
  const { toast } = useToast();

  const fetchContent = async (reset = false) => {
    if (isLoading || (!hasMore && !reset)) return;
    setIsLoading(true);

    const currentPage = reset ? 1 : page;
    const queryParams = new URLSearchParams({
      page: currentPage.toString(),
      limit: "20",
      ...(statusFilter && { status: statusFilter }),
      ...(typeFilter && { type: typeFilter }),
    });

    try {
      const response = await fetch(`/api/moderation?${queryParams.toString()}`);
      const data = await response.json();

      if (!response.ok) throw new Error(data.error);
      
      if (data.items.length === 0) {
        setHasMore(false);
        return;
      }

      setItems(prev => reset ? data.items : [...prev, ...data.items]);
      setPage(prev => reset ? 2 : prev + 1);
      setHasMore(data.items.length === 20);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to fetch content for moderation",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchContent(true);
  }, [statusFilter, typeFilter]);

  useEffect(() => {
    if (inView) {
      fetchContent();
    }
  }, [inView]);

  const handleAction = async (item: ContentItem, action: string) => {
    setSelectedItem(item);
    setCurrentAction(action);
    setIsActionDialogOpen(true);
  };

  const submitAction = async () => {
    if (!selectedItem || !currentAction || !actionReason) return;

    try {
      const type = selectedItem.title ? "problem" : selectedItem.content ? "solution" : "comment";
      
      const response = await fetch(`/api/moderation/${selectedItem.id}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          action: currentAction,
          reason: actionReason,
          type,
        }),
      });

      if (!response.ok) throw new Error("Failed to moderate content");

      setItems(items.map(item =>
        item.id === selectedItem.id
          ? {
              ...item,
              moderationStatus:
                currentAction === "APPROVE"
                  ? "APPROVED"
                  : currentAction === "REJECT"
                  ? "REJECTED"
                  : currentAction === "FLAG"
                  ? "FLAGGED"
                  : "PENDING",
            }
          : item
      ));

      toast({
        title: "Success",
        description: "Content moderated successfully",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to moderate content",
        variant: "destructive",
      });
    } finally {
      setIsActionDialogOpen(false);
      setSelectedItem(null);
      setCurrentAction(null);
      setActionReason("");
    }
  };

  return (
    <Card className="p-6">
      <div className="space-y-4">
        <div className="flex items-center gap-4">
          <Select
            value={statusFilter}
            onValueChange={setStatusFilter}
          >
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Filter by status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">All status</SelectItem>
              <SelectItem value="PENDING">Pending</SelectItem>
              <SelectItem value="APPROVED">Approved</SelectItem>
              <SelectItem value="REJECTED">Rejected</SelectItem>
              <SelectItem value="FLAGGED">Flagged</SelectItem>
            </SelectContent>
          </Select>

          <Select
            value={typeFilter}
            onValueChange={setTypeFilter}
          >
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Filter by type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">All types</SelectItem>
              <SelectItem value="problem">Problems</SelectItem>
              <SelectItem value="solution">Solutions</SelectItem>
              <SelectItem value="comment">Comments</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-4">
          {items.map((item) => (
            <div
              key={item.id}
              className="p-4 bg-card border rounded-lg"
            >
              <div className="space-y-2">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="font-medium">
                      {item.title || item.content || item.description}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      By {item.author.name || item.author.email} on{" "}
                      {new Date(item.createdAt).toLocaleString()}
                    </p>
                  </div>
                  <span className={`text-sm font-medium ${
                    item.moderationStatus === "APPROVED"
                      ? "text-green-600"
                      : item.moderationStatus === "REJECTED"
                      ? "text-red-600"
                      : item.moderationStatus === "FLAGGED"
                      ? "text-yellow-600"
                      : "text-blue-600"
                  }`}>
                    {item.moderationStatus}
                  </span>
                </div>

                {item.moderationActions[0] && (
                  <p className="text-sm text-muted-foreground">
                    Last action: {item.moderationActions[0].action} by{" "}
                    {item.moderationActions[0].moderator.name || item.moderationActions[0].moderator.email}{" "}
                    - {item.moderationActions[0].reason}
                  </p>
                )}

                <div className="flex items-center gap-2 mt-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleAction(item, "APPROVE")}
                  >
                    Approve
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleAction(item, "REJECT")}
                  >
                    Reject
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleAction(item, item.moderationStatus === "FLAGGED" ? "UNFLAG" : "FLAG")}
                  >
                    {item.moderationStatus === "FLAGGED" ? "Unflag" : "Flag"}
                  </Button>
                </div>
              </div>
            </div>
          ))}

          {isLoading && (
            <div className="space-y-2">
              {[...Array(3)].map((_, i) => (
                <div
                  key={i}
                  className="h-24 bg-muted animate-pulse rounded-md"
                />
              ))}
            </div>
          )}
        </div>

        <div ref={ref} className="h-10" />
      </div>

      <Dialog open={isActionDialogOpen} onOpenChange={setIsActionDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {currentAction?.charAt(0).toUpperCase() + currentAction?.slice(1).toLowerCase()} Content
            </DialogTitle>
            <DialogDescription>
              Please provide a reason for this action.
            </DialogDescription>
          </DialogHeader>
          <Textarea
            value={actionReason}
            onChange={(e) => setActionReason(e.target.value)}
            placeholder="Enter reason..."
            className="min-h-[100px]"
          />
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsActionDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={submitAction} disabled={!actionReason}>
              Submit
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Card>
  );
}