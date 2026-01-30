import file_case_img from '@/assets/imgs/appointment_form.png'
import { Input } from './ui/input'
import { Button } from './ui/button'
import { ChevronRight, Loader2} from 'lucide-react'
import { nanoid } from 'nanoid'
import { dateFormatter } from '@/lib/helpers'
import { useNavigate } from 'react-router-dom'
import useAuthenticationStore from '@/store/useAuthenticationStore'
import { PageSync } from './PageSync'
import { useCaseStore } from '@/store/useCaseStore'
import { useEffect, useState } from 'react'
import { useRetrieveUsersStore } from '@/store/useRetrieveUsersStore'

export function FileCase(){
    const { userRole, userLinkName } = useAuthenticationStore();
    const { setCaseInfo,fetchCaseTypes, fetchSettlementTypes, complainantList, setComplainantInfo, set_complainants, initialUserComplainantInfo } = useCaseStore();
    const { fetchComplainants, fetchRespondents, fetchOrganizationComplainants, fetchOrganizationRespondents } = useRetrieveUsersStore();
    const [loader, setLoader] =  useState(false);

    const [today] = useState(() => dateFormatter(new Date()));
    const [caseNumber] = useState(() => 'CASE-' + nanoid(10));

    const navigate = useNavigate();

    const handleStartCreating = () => {
        
        setCaseInfo({
            case_number: caseNumber,
            date: today,
            case_status: "pending_approval",
            hearing_status: "pending_schedule",
        });

        navigate(userRole === 'admin' ? '/Admin/File-Case/Case-Form' : '/' + userLinkName + '/File-Case/Case-Form');
    }

    useEffect(() => {
    const loadData = async () => {
        setLoader(true);
            try {
                
                await Promise.all([
                    setComplainantInfo(),
                    fetchComplainants(),
                    fetchOrganizationComplainants(),
                    fetchRespondents(),
                    fetchOrganizationRespondents(),
                    fetchCaseTypes(),
                    fetchSettlementTypes()
                ]);
            } catch (error) {
                console.error("Failed to load data", error);
            } finally {
                setLoader(false);
            }
        };

        loadData();
    }, []);

    const isSelected = (user) => {
        const name = `${user.first_name} ${user.middle_name} ${user.last_name}`;
        return complainantList.some((u) => 
            u.name === name && u.type === user.type
        );
    };

    useEffect(() => {
        if(userRole === 'user' && !isSelected(initialUserComplainantInfo)) {
            set_complainants([initialUserComplainantInfo])
        }
    }, [])

    // console.log("Initial User Complainant Info:", initialUserComplainantInfo);

    return (
        <main className='flex flex-col w-full items-center justify-center gap-6 mt-14 '>
            <PageSync page="" />
           
            <img src={file_case_img} alt="File Case" className='w-[150px] object-cover' />
            <h1 className='text-3xl text-redBase text-center'>File New Case</h1>
            <div className="flex items-center gap-6">
                <div className="flex items-center relative">
                    <p className='absolute top-0 left-2 bottom-0 self-center text-zinc-500 '>Case Number:</p>
                    <Input type="text" className='bg-white w-72 text-end pl-4' 
                    value={caseNumber} readOnly/>
                </div>
                <div className="flex items-center relative">
                    <p className='absolute top-0 left-2 bottom-0 self-center text-zinc-500 '>Date Filling:</p>
                    <Input type="text" className='bg-white w-72 text-end pl-4'
                    value={today}  readOnly
                /> 
                </div>

            </div>
            <Button onClick={ handleStartCreating } 
                className='!bg-redBase hover:bg-red-700 text-white flex items-center justify-between font-normal cursor-pointer '
                disabled={loader}>
                    {loader ? (
                        <>
                        <Loader2 className="animate-spin size-5 " />
                        Processing...
                        </>
                    ) : (' Start creating')}
                <ChevronRight />
            </Button>
        </main>
    )
}