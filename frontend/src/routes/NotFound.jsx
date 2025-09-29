import { Link, useNavigate } from "react-router-dom";
import useAuthenticationStore from "@/store/useAuthenticationStore";

export function NotFound() {
    const { userInfo, userLinkName } = useAuthenticationStore();
    const user = userInfo?.role === 'user' ? userLinkName : 'Admin';
    const navigate = useNavigate();

    const goBack = () => {
        navigate(`/${user}`);
    };

    return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100">
            <h1 className="text-6xl font-bold text-red-600">404</h1>
            <p className="text-2xl mt-4">Page Not Found</p>
            <p className="text-gray-600 mt-2">The page you are looking for does not exist.</p>
            <Link to={goBack()} className="text-red-600 hover:underline mt-2">
                Go back
            </Link>
        </div>
    );
}