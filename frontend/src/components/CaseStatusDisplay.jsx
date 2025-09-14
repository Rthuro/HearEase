import {Loader, BadgeCheck, FileX, Gavel, ClockFadingIcon, FileArchive } from 'lucide-react'
import { Badge } from '@/components/ui/badge'

export function CaseStatusDisplay({ caseStatus }) {
    const statusStyles = {
        pending: { text: "Pending", icon: <ClockFadingIcon className='text-yellow-500 ' /> },
        in_progress: { text: "In Progress", icon: <Loader className='text-zinc-400 ' /> },
        resolved: { text: "Resolved", icon: <BadgeCheck className='text-green-500 ' /> },
        escalated: { text: "Escalated", icon: <Gavel className='text-red-500 ' /> },
        rejected: { text: "Rejected", icon: <FileX className='text-red-500 ' /> },
        cancelled: { text: "Cancelled", icon: <FileArchive className='text-gray-500 ' /> },
    };

    return (
        <Badge variant="outline" className="text-muted-foreground px-1.5">
            {statusStyles[caseStatus]?.icon}
            <span>{statusStyles[caseStatus]?.text}</span>
        </Badge>
    );
}