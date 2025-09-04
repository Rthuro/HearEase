import Energy from '@/assets/energy.svg'
import Hero_img from '@/assets/HeroImg.svg'
import { Link } from 'react-router-dom'
import { ChevronRight } from 'lucide-react'

export function HomePage() {
  return (
    <section className='flex flex-col items-center w-fit mx-auto relative'>
     <div className="flex flex-col items-center gap-6">
        <div className="flex items-center gap-2">
            <p className='text-4xl font-medium'>Making <span className='text-redBase'>Hearings</span> Easier</p>
            <img src={Energy} alt="Energy" className="h-10" />
          </div>
          <p className='text-zinc-700 max-w-[640px] text-center'>
            With HearEase, booking barangay hearings is simple, and AI helps predict resolution time, giving communities more time for what matters.
          </p>
          <Link to="/Services" className="bg-redBase text-white py-2 pl-6 pr-3 rounded-md flex items-center justify-between gap-3 text-sm">
            <p>View Services</p>
            <ChevronRight />
          </Link>
      </div>
      <img src={Hero_img} alt="Hero Image" className='w-[55%] -ml-5'/>
    </section>
  )
}