import { Link } from "react-router-dom"
import summon_letter from "@/assets/imgs/summon_letter.png"
import case_monitoring from "@/assets/imgs/case_monitoring.png"
import appointment_form from "@/assets/imgs/appointment_form.png"
import file_court from "@/assets/imgs/case_monitoring.png"
import no_show_notice from "@/assets/imgs/no_show_notice.png"
import cancellation_notice from "@/assets/imgs/cancellation_notice.png"
import { PageSync } from "@/components/PageSync"

export function GenerateDocument() {
    const generate = [
        {
            title: "Summon Letter",
            img: summon_letter,
        },{
            title: "Case Monitoring Sheet",
            img: case_monitoring,
        },{
            title: "Appointment Form",
            img: appointment_form,
        },{
            title: "Cancellation Notice",
            img: cancellation_notice,
        },{
            title: "File Court Certification",
            img: file_court,
        },{
            title: "No Show Notice",
            img: no_show_notice,
        }
    ]
    return(
        <div className="flex flex-col gap-2 p-4">
            <PageSync page="Generate Documents" />
           <h1 className="text-2xl font-medium">Generate Documents</h1>
           <p className="text-zinc-700">Quickly produce official documents for any case.</p>
            <div className="flex flex-wrap gap-4 mt-2 ">
                {generate.map( (doc) =>
                    <Link key={doc.title} className="shadow-sm bg-white rounded-xl flex flex-col gap-6 items-center justify-center p-6 w-[250px] ">
                        <img src={doc.img} className="h-[150px]" />
                        <p className="text-redBase">{doc.title}</p>
                    </Link>
                )}
            </div> 
        </div>
        
    )
}