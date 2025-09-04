import usePageStore from "@/store/usePageStore"
import { useEffect } from "react";

export function PageSync({page}){
    const { setCurrentPage } = usePageStore();

    useEffect(() => {
        setCurrentPage(page)
    }, [setCurrentPage , page]) 

    return null
}