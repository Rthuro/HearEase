import { useEffect, useState } from "react";
import { useTicketStore } from "@/store/useTicketStore";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
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
import { Loader2, Plus, MessageSquare, Clock, CheckCircle2, XCircle, AlertTriangle, RotateCcw } from "lucide-react";

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

export function SupportTickets() {
    const { tickets, loading, fetchMyTickets, createTicket } = useTicketStore();
    const [dialogOpen, setDialogOpen] = useState(false);
    const [subject, setSubject] = useState("");
    const [description, setDescription] = useState("");
    const [category, setCategory] = useState("general");
    const [submitting, setSubmitting] = useState(false);

    useEffect(() => {
        fetchMyTickets();
    }, []);

    const handleSubmit = async () => {
        if (!subject.trim() || !description.trim()) return;
        setSubmitting(true);
        try {
            await createTicket({ subject, description, category });
            setSubject("");
            setDescription("");
            setCategory("general");
            setDialogOpen(false);
        } catch {
            // Error handled in store
        } finally {
            setSubmitting(false);
        }
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

    return (
        <div className="flex-1 flex flex-col gap-4">
            <div className="flex items-center justify-between">
                <div className="flex flex-col gap-1">
                    <h2 className="text-lg font-medium">Customer Support</h2>
                    <p className="text-sm text-zinc-500">
                        Submit and track your support tickets
                    </p>
                </div>
                <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
                    <DialogTrigger asChild>
                        <Button className="bg-redBase hover:bg-red-700">
                            <Plus className="size-4 mr-2" />
                            New Ticket
                        </Button>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-[500px]">
                        <div className="flex flex-col gap-4">
                            <div>
                                <h3 className="text-lg font-medium">Submit a Support Ticket</h3>
                                <p className="text-sm text-zinc-500 mt-1">
                                    Describe your issue and we'll get back to you as soon as possible.
                                </p>
                            </div>
                            <Separator />
                            <div className="flex flex-col gap-3">
                                <div className="flex flex-col gap-2">
                                    <Label htmlFor="ticket-subject">Subject</Label>
                                    <Input
                                        id="ticket-subject"
                                        placeholder="Brief summary of your issue"
                                        value={subject}
                                        onChange={(e) => setSubject(e.target.value)}
                                    />
                                </div>
                                <div className="flex flex-col gap-2">
                                    <Label htmlFor="ticket-category">Category</Label>
                                    <Select
                                        value={category}
                                        onValueChange={setCategory}
                                    >
                                        <SelectTrigger id="ticket-category">
                                            <SelectValue placeholder="Select category" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectGroup>
                                                <SelectItem value="general">General</SelectItem>
                                                <SelectItem value="bug">Bug Report</SelectItem>
                                                <SelectItem value="account">Account Issue</SelectItem>
                                                <SelectItem value="feature">Feature Request</SelectItem>
                                            </SelectGroup>
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className="flex flex-col gap-2">
                                    <Label htmlFor="ticket-description">Description</Label>
                                    <Textarea
                                        id="ticket-description"
                                        placeholder="Describe your issue in detail..."
                                        value={description}
                                        onChange={(e) => setDescription(e.target.value)}
                                        rows={5}
                                    />
                                </div>
                            </div>
                            <div className="flex justify-end gap-2">
                                <Button
                                    variant="outline"
                                    onClick={() => setDialogOpen(false)}
                                >
                                    Cancel
                                </Button>
                                <Button
                                    className="bg-redBase hover:bg-red-700"
                                    onClick={handleSubmit}
                                    disabled={submitting || !subject.trim() || !description.trim()}
                                >
                                    {submitting ? (
                                        <>
                                            <Loader2 className="size-4 mr-2 animate-spin" />
                                            Submitting...
                                        </>
                                    ) : (
                                        "Submit Ticket"
                                    )}
                                </Button>
                            </div>
                        </div>
                    </DialogContent>
                </Dialog>
            </div>

            {loading ? (
                <div className="flex-1 flex items-center justify-center py-12">
                    <Loader2 className="size-6 animate-spin text-redBase" />
                </div>
            ) : tickets.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-16 text-center">
                    <MessageSquare className="size-12 text-zinc-300 mb-3" />
                    <p className="text-zinc-500 font-medium">No tickets yet</p>
                    <p className="text-zinc-400 text-sm mt-1">
                        Submit a ticket if you need help or have feedback.
                    </p>
                </div>
            ) : (
                <div className="flex flex-col gap-3">
                    {tickets.map((ticket) => {
                        const statusInfo = STATUS_CONFIG[ticket.status] || STATUS_CONFIG.open;
                        const StatusIcon = statusInfo.icon;

                        return (
                            <Card key={ticket.id} className="py-3 rounded-sm">
                                <CardContent className="px-4">
                                    <div className="flex items-start justify-between gap-3">
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center gap-2 mb-1">
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
                                            <p className="text-sm text-zinc-500 mt-1 line-clamp-2">
                                                {ticket.description}
                                            </p>
                                            <p className="text-xs text-zinc-400 mt-2">
                                                Submitted {formatDate(ticket.created_at)}
                                            </p>
                                        </div>
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
        </div>
    );
}
