import { getHearingCountdown } from "@/lib/helpers";

export function CountdownSpan({ dateString }) {
    const getCountdownStyles = (status) => {
        switch (status) {
            case "today":
                return "bg-red-100 text-red-700 border-red-200 font-bold animate-pulse";
            case "near":
                return "bg-amber-100 text-amber-700 border-amber-200 font-medium";
            case "past":
                return "bg-zinc-100 text-zinc-500 border-zinc-200 opacity-60";
            case "future":
                return "bg-blue-50 text-blue-600 border-blue-100";
            default:
                return "text-zinc-600";
        }
    };
    
    return (
        <span className={getCountdownStyles(getHearingCountdown(dateString)?.status) + " px-2 py-1 rounded-full text-xs font-medium ml-2"}>
            {getHearingCountdown(dateString)?.label ?? '-'}
        </span>
    );
}