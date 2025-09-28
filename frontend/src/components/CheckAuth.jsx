import { useEffect } from "react";
import { useNavigate } from "react-router-dom";

export function CheckAuth({userInfo}){
    const navigate = useNavigate();

    useEffect(() => {
        if(!userInfo){
        navigate("/Login");
        }
    }, [userInfo, navigate]);

    return null;
}