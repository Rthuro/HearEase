import success_img from "@/assets/imgs/filed_successfully.png"
import useAuthenticationStore from "@/store/useAuthenticationStore"
import { Download } from "lucide-react";
import { Link } from "react-router-dom";

export function FiledSuccess(){
    const { userRole, userLinkName } = useAuthenticationStore();

    return (
        <div className={`${userRole != 'admin' ? 'mb-16' : ''}  flex flex-col items-center justify-center  p-6`}>
            <section className="flex flex-col gap-3 items-center">
                <img src={success_img} alt="filed successfully" srcset="" className="h-[120px] object-contain" />
                <p className="text-2xl font-medium">Case Filed Successfully!</p>
                <p className="text-sm text-zinc-500 text-center max-w-[530px]">
                    {userRole === 'admin' ?
                        `The case has been registered and scheduled. You may now download the following documents generated for this case.`
                        :
                        `You have successfully filed a case. Please wait for your case status update. We will keep you informed via email.`
                    }
                </p>
                <Link to={`/${userRole === 'admin' ? 'Admin/' : userLinkName }`} 
                className="mt-4 px-4 py-2 bg-redBase text-white rounded-sm">
                    Go back {userRole === 'admin' ? 'to Dashboard' : 'to Home'}
                </Link>
            </section>
            
            
        </div>
    )
}