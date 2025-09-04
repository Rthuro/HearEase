import file_case_img from "@/assets/imgs/appointment_form.png"
import trace_case from "@/assets/imgs/trace_case.png"
import { Link } from "react-router-dom";
import { ArrowRight, Check } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";


export function Services() {
    const selection = [
        {
            link:"/Login",
            img: file_case_img,
            title: "File a New Complaint",
            descrip: "Submit a new complaint for Barangay Tetuan",
            btn: "File Now",
            clr: "bg-redBase",
            gradient: "linear-gradient(134deg, #CA5252 50.41%, #FFDEDE 128.6%)"
        },
        {
            link:"/Case",
            img: trace_case,
            title: "Check Case Status",
            descrip: "Track the progress of your barangay case in real time",
            btn: "Check Status",
            clr: "bg-green-800",
            gradient: "linear-gradient(114deg, #00970A 51.28%, #DDFADF 139.87%)"
        }
    ]
    const features = [
        "Submit and manage multiple complaints in one place",
        "Track the status of your cases anytime",
        "Receive email notifications and updates on hearings",
        "Access a secure and digital record of your barangay hearings"
    ]

    const [ showModal, changeShowModal] = useState(false);

  return (
    <main className="grid grid-cols-1 gap-9 mx-auto">
        <div className="absolute flex flex-col items-center justify-center ">
            {showModal && (
                <div className="fixed inset-0 bg-black/60 flex items-center justify-center">
                    <div className="bg-white p-6 rounded-lg shadow-lg w-[45%]">
                        <h2 className="text-2xl font-medium text-center text-redBase">Create an Account to File a New Case</h2>    
                        <p className=" mt-3 mb-3">To file a complaint, please log in or create your HearEase account. Having an account allows you to:</p>
                        <div className="flex flex-col gap-2">
                            {features.map((feature, index) => (
                                <div className="flex items-center gap-2 ml-2" key={index}>
                                    <Check className="text-redBase" size={16} strokeWidth={3} />
                                    <p className=" text-zinc-700 ">{feature}</p>
                                </div>
                            ))}
                        </div>
                        <div className="flex items-center gap-3 mt-6">
                            <Button variant="outline" onClick={() => changeShowModal(false)} className="w-1/2 cursor-pointer">
                                Cancel
                            </Button>
                            <Link to="/Login" className="bg-redBase text-white py-2 px-4 rounded-md w-1/2 text-sm text-center">
                                Proceed
                            </Link>
                        </div>
                    </div>
                </div>
            )}
        </div>
        {
            selection.map((item, index) => (
                <div to={item.link} className=" flex items-center justify-between p-6 rounded-2xl w-[550px] shadow-md text-white" style={{background: item.gradient}} key={index}>
                    <div className="flex flex-col gap-9 w-[260px]">
                        <div className="flex flex-col gap-2">
                            <p className="font-medium text-2xl">{item.title}</p>
                            <p className="font-normal text-sm">{item.descrip}</p>
                        </div>
                        {item.title === "File a New Complaint" ? (
                            <button onClick={() => changeShowModal(true)} className={`${item.clr} cursor-pointer text-white py-3 px-4 rounded-lg flex items-center justify-between w-[250px] shadow-md`}>
                                {item.btn}
                                <ArrowRight />
                            </button>
                        ) : (
                            <Link to={item.link} className={`${item.clr} text-white py-3 px-4 rounded-lg flex items-center justify-between w-[250px] shadow-md`}>
                                {item.btn}
                                <ArrowRight />
                            </Link>
                        )}
                        
                    </div>
                    <img src={item.img} alt={item.title} className=" h-[140px]" />
                </div>
            ))
        }
    </main>
  );
}