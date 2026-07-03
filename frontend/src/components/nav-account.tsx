import { User, LogInIcon, LogOutIcon } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { useNavigate } from "react-router"
import { useGetMeQuery, useLogoutMutation } from "@/api/authApi"
import { useGetBookingRequestsQuery } from "@/api/bookingApi"

export function NavAccount() {
  const navigate = useNavigate()
  const { data: user } = useGetMeQuery()
  const [logout] = useLogoutMutation()

  const isSitter = !!user?.petSitterId
  const { data: requests } = useGetBookingRequestsQuery(undefined, { skip: !isSitter })
  const pendingCount = requests?.filter((b) => b.status === "PENDING").length ?? 0

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="icon" className="relative">
          <User />
          {pendingCount > 0 && (
            <span className="absolute -right-1 -top-1 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[10px] font-medium text-white">
              {pendingCount}
            </span>
          )}
          <span className="sr-only">Account</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        {!user ? (
          <DropdownMenuItem onClick={() => navigate('/login')}>
            <LogInIcon className="mr-2 h-4 w-4" />
            Sign In
          </DropdownMenuItem>
        ) : (
          <>
            <DropdownMenuLabel>Hi, {user.name || 'there'}</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => navigate('/profile')}>
              <User className="mr-2 h-4 w-4" />
              Profile
              {pendingCount > 0 && (
                <span className="ml-auto rounded-full bg-red-500 px-1.5 py-0.5 text-[10px] font-medium leading-none text-white">
                  {pendingCount}
                </span>
              )}
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => { logout(); navigate('/'); }}>
              <LogOutIcon className="mr-2 h-4 w-4" />
              Log out
            </DropdownMenuItem>
          </>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
