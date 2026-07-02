import { User, LogInIcon, LogOutIcon } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { useNavigate } from "react-router"
import { useGetMeQuery, useLogoutMutation } from "@/api/authApi"

export function NavAccount() {
  const navigate = useNavigate()
  const { data: user } = useGetMeQuery()
  const [logout] = useLogoutMutation()

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="icon">
          <User />
          <span className="sr-only">Account</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        {!user ? (
          <>
            <DropdownMenuItem onClick={() => navigate('/login')}>
              <LogInIcon className="mr-2 h-4 w-4" />
              Sign In
            </DropdownMenuItem>

          </>
        ) : (
          <>
            <DropdownMenuItem onClick={() => navigate('/profile')}>
              <User className="mr-2 h-4 w-4" />
              profile
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => { logout(); navigate('/'); }}>
              <LogOutIcon className="mr-2 h-4 w-4" />
              logout
            </DropdownMenuItem>
          </>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
