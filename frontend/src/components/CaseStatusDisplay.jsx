import {Loader, BadgeCheck, FileX, Gavel, ClockFadingIcon, FileArchive, CheckCircle, CalendarClock, CalendarCheck, CalendarRange, Check, Scale, FileText  } from 'lucide-react'
import { Badge } from '@/components/ui/badge'

export function CaseStatusDisplay({ caseStatus }) {
    const statusStyles = {

        // Case Status
        filed: { text: "Filed/Draft", icon: <FileText className="text-blue-500" /> },
        archived: { text: "Archived", icon: <FileArchive className="text-gray-500" /> },
        pending_approval: { text: "Pending Approval", icon: <ClockFadingIcon className="text-zinc-400" /> },
        approved: { text: "Approved", icon: <CheckCircle className="text-green-500" /> },
        in_progress: { text: "In Progress", icon: <Loader className=" text-yellow-700" />,
            custom: "bg-yellow-50 border border-yellow-200 text-yellow-700"
         },
        resolved: { text: "Resolved", icon: <BadgeCheck className="text-green-600" />,
            custom: "bg-green-50 border border-green-200 text-green-600"
         },
        escalated: { text: "Escalated", icon: <Gavel className="text-red-500" />,
            custom: "bg-red-50 border border-red-200 text-red-600"
         },
        rejected: { text: "Rejected", icon: <FileX className="text-red-700" />,
            custom: "bg-red-50  text-red-700"
         },
        cancelled: { text: "Cancelled", icon: <FileArchive className="text-gray-500" /> },

        // Hearing Status
        pending_schedule: { text: "Pending Schedule", icon: <CalendarClock className="text-yellow-500" /> },
        scheduled: { text: "Scheduled", icon: <CalendarCheck className="text-blue-500" /> },
        rescheduled: { text: "Rescheduled", icon: <CalendarRange className="text-purple-500" /> },
        cancelled_hearing: { text: "Cancelled Hearing", icon: <FileX className="text-red-500" /> },
        completed: { text: "Completed", icon: <Check className="text-green-600" /> },
        pending_decision: { text: "Pending Decision", icon: <Scale className="text-orange-500" /> },
    };

    return (
        <Badge variant="outline" className={`text-muted-foreground px-1.5 h-fit ${statusStyles[caseStatus]?.custom ? statusStyles[caseStatus]?.custom : null}`}>
            {statusStyles[caseStatus]?.icon}
            <span>{statusStyles[caseStatus]?.text}</span>
        </Badge>
    );
}