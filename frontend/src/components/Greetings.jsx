import welcome_img from '@/assets/imgs/greetings.png';
import useAuthenticationStore from '@/store/useAuthenticationStore';
import { FolderClockIcon, CalendarClock, FolderEditIcon,
    FolderSearch2, ArrowRight
 } from 'lucide-react';
 import { Link } from 'react-router-dom';


export function Greetings() {
  const { userRole, userLinkName, username } = useAuthenticationStore();

  const actions = {
        admin: [
            { name: 'Check new cases', link: '/Admin/Cases?status=new', icon: FolderClockIcon, 
                iconClr: 'text-blue-500', },
            { name: 'Check hearings', link: '/Admin/Hearings', icon: CalendarClock, 
                iconClr: 'text-green-500', },
            { name: 'Update cases', link: '/Admin/Cases', icon: FolderEditIcon, 
                iconClr: 'text-yellow-500', },
        ],
        user: [
            { name: 'Check my calendar', link: `/${userLinkName}/Calendar`, icon: FolderSearch2, iconClr: 'text-red-500', },
            { name: 'View Scheduled Hearings', link: `/${userLinkName}/Hearings`, icon: CalendarClock, iconClr: 'text-pink-500', },
        ],
    }

  return (
    <section className='flex flex-col w-full '>
    <div className='flex items-center bg-redBase px-6 py-6 rounded-lg justify-between relative shadow-sm'>
        <div className="flex flex-col gap-2 text-white">
            <p className="text-3xl font-bold">Hello {username}!</p>
            <p>We're glad to see you again 👋.</p>
        </div>
      <img src={welcome_img} alt="Welcome" className='w-[200px] absolute right-6 bottom-4.5' />
    </div>
    <div className="grid grid-cols-2 gap-3 w-full mt-3 text-black text-sm">
                { userRole !== 'admin' &&  (
                    actions.user.map((action, index) => (
                        <Link to={action.link} key={index} className='flex items-center justify-between bg-white p-4 rounded-md w-full shadow-sm hover:shadow-md hover:scale-[1.02] transition-all '>
                            <div className="flex items-center">
                                <action.icon className={`${action.iconClr} size-4`} />
                                <p className="ml-2">{action.name}</p>
                            </div>
                            <ArrowRight className={`${action.iconClr} `} size={16} />
                        </Link>
                    ))
                )}
            </div>
    </section>
  );
}