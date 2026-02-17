import { useEffect, useState } from "react";
import { useTicketStore } from "@/store/useTicketStore";
import { Button } from "./ui/button";
import { Label } from "./ui/label";
import { Textarea } from "./ui/textarea";
import { Card, CardContent } from "./ui/card";
import { Separator } from "./ui/separator";
import {
    Select,
    SelectContent,
    SelectGroup,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "./ui/select";
import {
    Dialog,
    DialogContent,
    DialogTrigger,
} from "./ui/dialog";
import { Loader2, Clock, CheckCircle2, XCircle, AlertTriangle, RotateCcw, Filter, MailOpen } from "lucide-react";

const STATUS_CONFIG = {
    open: { label: "Open", color: "bg-blue-100 text-blue-700", icon: Clock },
    accepted: { label: "Accepted", color: "bg-green-100 text-green-700", icon: CheckCircle2 },
    declined: { label: "Declined", color: "bg-red-100 text-red-700", icon: XCircle },
    in_progress: { label: "In Progress", color: "bg-amber-100 text-amber-700", icon: RotateCcw },
    resolved: { label: "Resolved", color: "bg-emerald-100 text-emerald-700", icon: CheckCircle2 },
    dropped: { label: "Dropped", color: "bg-gray-100 text-gray-600", icon: AlertTriangle },
};

const CATEGORY_LABELS = {
    general: "General",
    bug: "Bug Report",
    account: "Account Issue",
    feature: "Feature Request",
};

export function AdminTickets() {
    const { allTickets, loading, fetchAllTickets, updateTicketStatus } = useTicketStore();
    const [statusFilter, setStatusFilter] = useState("");
    const [selectedTicket, setSelectedTicket] = useState(null);
    const [actionDialogOpen, setActionDialogOpen] = useState(false);
    const [newStatus, setNewStatus] = useState("");
    const [adminReason, setAdminReason] = useState("");
    const [updating, setUpdating] = useState(false);

    useEffect(() => {
        const filter = statusFilter && statusFilter !== "all" ? statusFilter : undefined;
        fetchAllTickets(filter);
    }, [statusFilter]);

    const handleAction = async () => {
        if (!selectedTicket || !newStatus) return;
        setUpdating(true);
        try {
            await updateTicketStatus(selectedTicket.id, newStatus, adminReason);
            setActionDialogOpen(false);
            setSelectedTicket(null);
            setNewStatus("");
            setAdminReason("");
        } catch {
            // Error handled in store
        } finally {
            setUpdating(false);
        }
    };

    const openActionDialog = (ticket) => {
        setSelectedTicket(ticket);
        setNewStatus("");
        setAdminReason("");
        setActionDialogOpen(true);
    };

    const formatDate = (dateStr) => {
        return new Date(dateStr).toLocaleDateString("en-US", {
            year: "numeric",
            month: "short",
            day: "numeric",
            hour: "2-digit",
            minute: "2-digit",
        });
    };

    // Count tickets by status
    const statusCounts = allTickets.reduce((acc, t) => {
        acc[t.status] = (acc[t.status] || 0) + 1;
        return acc;
    }, {});

    return (
        <div className="flex-1 flex flex-col gap-4">
            <div className="flex items-center justify-between">
                <div className="flex flex-col gap-1">
                    <h2 className="text-lg font-medium">Support Tickets</h2>
                    <p className="text-sm text-zinc-500">
                        Manage user support requests
                    </p>
                </div>
            </div>

            {/* Filter bar */}
            <div className="flex items-center gap-2">
                <Filter className="size-4 text-zinc-400" />
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                    <SelectTrigger className="w-[180px]">
                        <SelectValue placeholder="All statuses" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectGroup>
                            <SelectItem value="all">All Statuses</SelectItem>
                            <SelectItem value="open">Open</SelectItem>
                            <SelectItem value="accepted">Accepted</SelectItem>
                            <SelectItem value="in_progress">In Progress</SelectItem>
                            <SelectItem value="declined">Declined</SelectItem>
                            <SelectItem value="resolved">Resolved</SelectItem>
                            <SelectItem value="dropped">Dropped</SelectItem>
                        </SelectGroup>
                    </SelectContent>
                </Select>
                {statusFilter && statusFilter !== "all" && (
                    <Button variant="ghost" size="sm" onClick={() => setStatusFilter("")}>
                        Clear
                    </Button>
                )}
            </div>

            {/* Summary badges */}
            <div className="flex gap-2 flex-wrap">
                {Object.entries(STATUS_CONFIG).map(([key, config]) => {
                    const count = statusCounts[key] || 0;
                    if (count === 0) return null;
                    return (
                        <button
                            key={key}
                            onClick={() => setStatusFilter(key)}
                            className={`inline-flex items-center gap-1 text-xs px-2.5 py-1 rounded-full font-medium cursor-pointer transition-opacity hover:opacity-80 ${config.color}`}
                        >
                            {config.label}: {count}
                        </button>
                    );
                })}
            </div>

            {loading ? (
                <div className="flex-1 flex items-center justify-center py-12">
                    <Loader2 className="size-6 animate-spin text-redBase" />
                </div>
            ) : allTickets.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-16 text-center">
                    <MailOpen className="size-12 text-zinc-300 mb-3" />
                    <p className="text-zinc-500 font-medium">No tickets found</p>
                    <p className="text-zinc-400 text-sm mt-1">
                        {statusFilter ? "Try changing the filter." : "No support tickets have been submitted yet."}
                    </p>
                </div>
            ) : (
                <div className="flex flex-col gap-3">
                    {allTickets.map((ticket) => {
                        const statusInfo = STATUS_CONFIG[ticket.status] || STATUS_CONFIG.open;
                        const StatusIcon = statusInfo.icon;

                        return (
                            <Card key={ticket.id} className="py-3 rounded-sm">
                                <CardContent className="px-4">
                                    <div className="flex items-start justify-between gap-3">
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center gap-2 mb-1 flex-wrap">
                                                <span className="font-medium text-sm text-zinc-400">
                                                    #{ticket.id}
                                                </span>
                                                <span className={`inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-full font-medium ${statusInfo.color}`}>
                                                    <StatusIcon className="size-3" />
                                                    {statusInfo.label}
                                                </span>
                                                <span className="text-xs text-zinc-400 bg-zinc-100 px-2 py-0.5 rounded-full">
                                                    {CATEGORY_LABELS[ticket.category] || ticket.category}
                                                </span>
                                            </div>
                                            <p className="font-medium text-sm">{ticket.subject}</p>
                                            <p className="text-sm text-zinc-500 mt-1">
                                                {ticket.description}
                                            </p>
                                            <div className="flex items-center gap-3 mt-2">
                                                <p className="text-xs text-zinc-400">
                                                    By <span className="font-medium text-zinc-500">{ticket.user_name || ticket.user_email}</span>
                                                </p>
                                                <p className="text-xs text-zinc-400">
                                                    {formatDate(ticket.created_at)}
                                                </p>
                                            </div>
                                        </div>
                                        <Button
                                            size="sm"
                                            variant="outline"
                                            onClick={() => openActionDialog(ticket)}
                                        >
                                            Manage
                                        </Button>
                                    </div>

                                    {ticket.admin_reason && (
                                        <>
                                            <Separator className="my-3" />
                                            <div className="bg-zinc-50 rounded-md p-3">
                                                <p className="text-xs font-medium text-zinc-500 mb-1">
                                                    Admin Response
                                                </p>
                                                <p className="text-sm text-zinc-700">
                                                    {ticket.admin_reason}
                                                </p>
                                                {ticket.resolved_by_email && (
                                                    <p className="text-xs text-zinc-400 mt-1">
                                                        — {ticket.resolved_by_email}
                                                    </p>
                                                )}
                                            </div>
                                        </>
                                    )}
                                </CardContent>
                            </Card>
                        );
                    })}
                </div>
            )}

            {/* Action Dialog */}
            <Dialog open={actionDialogOpen} onOpenChange={setActionDialogOpen}>
                <DialogContent className="sm:max-w-[450px]">
                    {selectedTicket && (
                        <div className="flex flex-col gap-4">
                            <div>
                                <h3 className="text-lg font-medium">
                                    Manage Ticket #{selectedTicket.id}
                                </h3>
                                <p className="text-sm text-zinc-500 mt-1">
                                    {selectedTicket.subject}
                                </p>
                            </div>
                            <Separator />
                            <div className="bg-zinc-50 rounded-md p-3">
                                <p className="text-xs font-medium text-zinc-500 mb-1">Description</p>
                                <p className="text-sm">{selectedTicket.description}</p>
                                <p className="text-xs text-zinc-400 mt-2">
                                    Submitted by {selectedTicket.user_name || selectedTicket.user_email} on {formatDate(selectedTicket.created_at)}
                                </p>
                            </div>
                            <div className="flex flex-col gap-3">
                                <div className="flex flex-col gap-2">
                                    <Label htmlFor="ticket-action-status">Set Status</Label>
                                    <Select value={newStatus} onValueChange={setNewStatus}>
                                        <SelectTrigger id="ticket-action-status">
                                            <SelectValue placeholder="Choose new status" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectGroup>
                                                <SelectItem value="accepted">Accept</SelectItem>
                                                <SelectItem value="declined">Decline</SelectItem>
                                                <SelectItem value="in_progress">In Progress</SelectItem>
                                                <SelectItem value="resolved">Resolved</SelectItem>
                                                <SelectItem value="dropped">Drop</SelectItem>
                                            </SelectGroup>
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className="flex flex-col gap-2">
                                    <Label htmlFor="ticket-admin-reason">
                                        Reason / Explanation <span className="text-zinc-400 font-normal">(optional)</span>
                                    </Label>
                                    <Textarea
                                        id="ticket-admin-reason"
                                        placeholder="Provide a reason or explanation to the user..."
                                        value={adminReason}
                                        onChange={(e) => setAdminReason(e.target.value)}
                                        rows={3}
                                    />
                                </div>
                            </div>
                            <div className="flex justify-end gap-2">
                                <Button
                                    variant="outline"
                                    onClick={() => setActionDialogOpen(false)}
                                >
                                    Cancel
                                </Button>
                                <Button
                                    className="bg-redBase hover:bg-red-700"
                                    onClick={handleAction}
                                    disabled={updating || !newStatus}
                                >
                                    {updating ? (
                                        <>
                                            <Loader2 className="size-4 mr-2 animate-spin" />
                                            Updating...
                                        </>
                                    ) : (
                                        "Update Ticket"
                                    )}
                                </Button>
                            </div>
                        </div>
                    )}
                </DialogContent>
            </Dialog>
        </div>
    );
}
