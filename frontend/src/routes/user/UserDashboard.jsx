import useAuthenticationStore from "@/store/useAuthenticationStore"

export function UserDashboard() {
  const { userInfo } = useAuthenticationStore();

  return (
    <div>
      <p>Welcome Back, {userInfo?.name}!</p>
    </div>
  )
}