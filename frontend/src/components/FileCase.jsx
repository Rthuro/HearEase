import file_case_img from '@/assets/imgs/appointment_form.png'
import { Input } from './ui/input'
import { Button } from './ui/button'
import { ChevronRight } from 'lucide-react'
import { nanoid } from 'nanoid'
import { dateFormatter } from '@/lib/helpers'
import { useNavigate } from 'react-router-dom'
import useAuthenticationStore from '@/store/useAuthenticationStore'
import { PageSync } from './PageSync'
import { useCaseStore } from '@/store/useCaseStore'

export function FileCase(){
    const { setCaseInfo } = useCaseStore();
    const { userRole, userLinkName } = useAuthenticationStore();

    const today = dateFormatter(new Date());
    const generateCaseNumber = () => {
        return 'CASE-' + nanoid(10);
    }
    const navigate = useNavigate();

    const handleStartCreating = () => {
        
        setCaseInfo({
            case_number: generateCaseNumber(),
            date: today,
            case_status: "pending_approval",
            hearing_status: "pending_schedule",
        });

        navigate(userRole === 'admin' ? '/Admin/File-Case/Case-Form' : '/' + userLinkName + '/File-Case/Case-Form');
    }

    return (
        <main className='flex flex-col w-full items-center justify-center gap-6 mt-14 '>
            <PageSync page="" />
            <img src={file_case_img} alt="File Case" className='w-[150px] object-cover' />
            <h1 className='text-3xl text-redBase text-center'>File New Case</h1>
            <div className="flex items-center gap-6">
                <div className="flex items-center relative">
                    <p className='absolute top-0 left-2 bottom-0 self-center text-zinc-500 '>Case Number:</p>
                    <Input type="text" className='bg-white w-72 text-end pl-4' 
                    value={generateCaseNumber()} readOnly/>
                </div>
                <div className="flex items-center relative">
                    <p className='absolute top-0 left-2 bottom-0 self-center text-zinc-500 '>Date Filling:</p>
                    <Input type="text" className='bg-white w-72 text-end pl-4'
                    value={today}  readOnly
                /> 
                </div>

            </div>
            <Button onClick={ handleStartCreating } 
                className='!bg-redBase hover:bg-red-700 text-white flex items-center justify-between font-normal cursor-pointer '>
                Start creating
                <ChevronRight />
            </Button>
        </main>
    )
}