import { Bell } from 'lucide-react';
import { Link } from 'react-router-dom';
import empty_img from '@/assets/imgs/empty.png';
import useAuthenticationStore from '@/store/useAuthenticationStore';

export function DashboardNotification({notifications}) {
    const { userRole, userInfo } = useAuthenticationStore();

    const getUserNotifLink = () => {
        if (userRole === 'admin') {
            return '/admin/notifications';
        }

        return '@' + userInfo.name.replace(" ", "_") + '/notifications';
    }

    const previewNotifications = notifications ? notifications.slice(0, 3) : [];

    return (
        <div className="flex flex-col gap-4 w-[calc(100%-66.666%)] bg-white py-3 px-4 rounded-lg shadow-sm">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <Bell size={16} />
                    Notifications
                </div>
                <Link to={getUserNotifLink()} className="text-sm text-blue-500 hover:underline">
                    See All
                </Link>
            </div>
            <div className="flex flex-col gap-3 my-auto">
                {  previewNotifications.length > 0 ? (
                    previewNotifications.map((notif, index) => (
                        <div key={index} className="flex items-center justify-between p-2 border-b border-zinc-200">
                            <p className="text-sm">{notif.message}</p>
                            <p className="text-xs text-zinc-400">{notif.date}</p>
                        </div>
                    ))
                ) : (
                    <div className="flex flex-col items-center gap-3">
                        <img src={empty_img} alt="No Notifications" className='w-28 opacity-60' />
                        <p className="text-center text-sm text-zinc-400">No Notifications</p>
                    </div>
                )}
            </div>
        </div>
    );
}