"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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
} from "@/components/ui/dialog";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { PlusIcon, TrashIcon, SearchIcon } from "@/components/icons";
import {
  getSubscribers,
  createSubscriber,
  deleteSubscriber,
  type Subscriber,
} from "@/lib/api/subscriber";
import { useT } from "@/hooks/use-translation";
import { useTopbarAction } from "../../../../_components/topbar-action-context";
import { useAtomValue } from "jotai";
import { localeAtom } from "@/stores/locale.store";
import { formatRelativeTime } from "@/lib/utils/date";

type SubscriberStatus = "all" | "active" | "pending" | "unsubscribed";

const STATUS_COLORS: Record<string, string> = {
  active: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400",
  pending: "bg-cyan-100 text-cyan-700 dark:bg-cyan-900/30 dark:text-cyan-400",
  unsubscribed: "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400",
};

export default function SubscribersPageClient() {
  const params = useParams();
  const newsletterId = params.newsletterId as string;
  const t = useT();
  const { setAction } = useTopbarAction();
  
  const [subscribers, setSubscribers] = useState<Subscriber[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<SubscriberStatus>("all");
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [newEmail, setNewEmail] = useState("");
  const [isAdding, setIsAdding] = useState(false);

  const STATUS_LABELS: Record<SubscriberStatus, string> = {
    all: t("subscribers.all"),
    active: t("subscribers.active"),
    pending: t("subscribers.pending"),
    unsubscribed: t("subscribers.unsubscribed"),
  };

  // 구독자 목록 가져오기
  useEffect(() => {
    const fetchSubscribers = async () => {
      try {
        setIsLoading(true);
        const data = await getSubscribers(newsletterId);
        setSubscribers(data);
      } catch (error) {
        console.error("Failed to fetch subscribers:", error);
        toast.error(t("subscribers.failedToLoad"));
      } finally {
        setIsLoading(false);
      }
    };

    if (newsletterId) {
      fetchSubscribers();
    }
  }, [newsletterId]);

  // Topbar에 Add Subscriber 버튼 설정
  useEffect(() => {
    setAction(
      <Button size="sm" onClick={() => setIsAddDialogOpen(true)}>
        <PlusIcon className="mr-2 h-4 w-4" />
        {t("subscribers.addSubscriber")}
      </Button>
    );
    return () => setAction(null);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [setAction]);

  // 필터링된 구독자 목록
  const filteredSubscribers = subscribers.filter((subscriber) => {
    const matchesSearch = subscriber.email
      .toLowerCase()
      .includes(searchQuery.toLowerCase());
    const matchesStatus =
      statusFilter === "all" || 
      (statusFilter === "active" && subscriber.status === "ACTIVE") ||
      (statusFilter === "pending" && subscriber.status === "PENDING") ||
      (statusFilter === "unsubscribed" && subscriber.status === "UNSUBSCRIBED");
    return matchesSearch && matchesStatus;
  });

  // 상태별 카운트
  const statusCounts = {
    all: subscribers.length,
    active: subscribers.filter((s) => s.status === "ACTIVE").length,
    pending: subscribers.filter((s) => s.status === "PENDING").length,
    unsubscribed: subscribers.filter((s) => s.status === "UNSUBSCRIBED").length,
  };

  const handleAddSubscriber = async () => {
    if (!newEmail) {
      toast.error(t("subscribers.pleaseEnterEmail"));
      return;
    }

    setIsAdding(true);
    try {
      const newSubscriber = await createSubscriber(newsletterId, {
        email: newEmail,
      });
      setSubscribers([...subscribers, newSubscriber]);
      toast.success(t("subscribers.addSuccess"));
      setNewEmail("");
      setIsAddDialogOpen(false);
    } catch (error: any) {
      console.error("Add subscriber error:", error);
      toast.error(
        error?.response?.data?.message || t("subscribers.addFailed")
      );
    } finally {
      setIsAdding(false);
    }
  };

  const handleDeleteSubscriber = async (id: string, email: string) => {
    if (!confirm(t("subscribers.deleteConfirm").replace("{email}", email))) return;

    try {
      await deleteSubscriber(newsletterId, id);
      setSubscribers(subscribers.filter((s) => s.id !== id));
      toast.success(t("subscribers.deleteSuccess"));
    } catch (error: any) {
      console.error("Delete subscriber error:", error);
      toast.error(
        error?.response?.data?.message || t("subscribers.deleteFailed")
      );
    }
  };

  const locale = useAtomValue(localeAtom);
  const formatDateLocal = (dateString: string) => {
    return formatRelativeTime(dateString, locale);
  };

  return (
    <div className="mx-auto max-w-4xl">
      {/* Add Subscriber Dialog */}
      <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t("subscribers.addSubscriber")}</DialogTitle>
            <DialogDescription>
              {t("subscribers.addSubscriberDesc")}
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="email">{t("subscribers.email")}</Label>
              <Input
                id="email"
                type="email"
                value={newEmail}
                onChange={(e) => setNewEmail(e.target.value)}
                placeholder={t("subscribers.emailPlaceholder")}
                disabled={isAdding}
              />
            </div>
          </div>
          <div className="flex justify-end gap-2">
            <Button
              variant="outline"
              onClick={() => setIsAddDialogOpen(false)}
              disabled={isAdding}
            >
              {t("common.cancel")}
            </Button>
            <Button onClick={handleAddSubscriber} disabled={isAdding}>
              {isAdding ? t("subscribers.adding") : t("subscribers.add")}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Stats */}
      <div className="mt-6 grid grid-cols-4 gap-4">
        {(["all", "active", "pending", "unsubscribed"] as const).map((status) => (
          <button
            key={status}
            onClick={() => setStatusFilter(status)}
            className={cn(
              "rounded-lg border border-border p-4 text-left transition-colors hover:bg-muted/50",
              statusFilter === status && "border-primary bg-muted"
            )}
          >
            <p className="text-2xl font-semibold">{statusCounts[status]}</p>
            <p className="text-sm text-muted-foreground">{STATUS_LABELS[status]}</p>
          </button>
        ))}
      </div>

      {/* Search & Filter */}
      <div className="mt-6 flex gap-4">
        <div className="relative flex-1">
          <SearchIcon className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={t("subscribers.searchPlaceholder")}
            className="pl-10"
          />
        </div>
        <Select
          value={statusFilter}
          onValueChange={(value) => setStatusFilter(value as SubscriberStatus)}
        >
          <SelectTrigger className="w-36">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {(["all", "active", "pending", "unsubscribed"] as const).map(
              (status) => (
                <SelectItem key={status} value={status}>
                  {STATUS_LABELS[status]}
                </SelectItem>
              )
            )}
          </SelectContent>
        </Select>
      </div>

      {/* Subscriber List */}
      <div className="mt-6 rounded-lg border border-border">
        {/* Table Header */}
        <div className="grid grid-cols-12 gap-4 border-b border-border bg-muted/50 px-4 py-3 text-sm font-medium text-muted-foreground">
          <div className="col-span-5">{t("subscribers.email")}</div>
          <div className="col-span-2">{t("subscribers.status")}</div>
          <div className="col-span-3">{t("subscribers.subscribedAt")}</div>
          <div className="col-span-2 text-right">{t("subscribers.actions")}</div>
        </div>

        {/* Table Body */}
        {isLoading ? (
          <div className="px-4 py-12 text-center text-muted-foreground">
            {t("subscribers.loadingSubscribers")}
          </div>
        ) : filteredSubscribers.length === 0 ? (
          <div className="px-4 py-12 text-center text-muted-foreground">
            {searchQuery || statusFilter !== "all"
              ? t("subscribers.noResults")
              : t("subscribers.noSubscribers")}
          </div>
        ) : (
          <div className="divide-y divide-border">
            {filteredSubscribers.map((subscriber) => (
              <div
                key={subscriber.id}
                className="grid grid-cols-12 items-center gap-4 px-4 py-3 text-sm hover:bg-muted/30"
              >
                <div className="col-span-5 truncate font-medium">
                  {subscriber.email}
                </div>
                <div className="col-span-2">
                  <span
                    className={cn(
                      "inline-flex rounded-full px-2 py-0.5 text-xs font-medium",
                      subscriber.status === "ACTIVE" && STATUS_COLORS.active,
                      subscriber.status === "PENDING" && STATUS_COLORS.pending,
                      subscriber.status === "UNSUBSCRIBED" && STATUS_COLORS.unsubscribed
                    )}
                  >
                    {subscriber.status === "ACTIVE" && STATUS_LABELS.active}
                    {subscriber.status === "PENDING" && STATUS_LABELS.pending}
                    {subscriber.status === "UNSUBSCRIBED" && STATUS_LABELS.unsubscribed}
                  </span>
                </div>
                <div className="col-span-3 text-muted-foreground">
                  {formatDateLocal(subscriber.subscribedAt)}
                </div>
                <div className="col-span-2 flex justify-end">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-8 w-8 p-0 text-muted-foreground hover:text-destructive"
                    onClick={() =>
                      handleDeleteSubscriber(subscriber.id, subscriber.email)
                    }
                  >
                    <TrashIcon className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Footer Info */}
      <div className="mt-4 text-sm text-muted-foreground">
        {t("subscribers.total")} {filteredSubscribers.length}
        {statusFilter !== "all" && ` (${STATUS_LABELS[statusFilter]})`}
      </div>
    </div>
  );
}

