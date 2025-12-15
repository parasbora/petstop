import { User ,LogOutIcon ,LogInIcon} from "lucide-react"

import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { isAuthenticated, onAuthChange } from "@/lib/auth"
import { useEffect, useState } from "react"
import { useNavigate } from "react-router"
import { useLogoutMutation } from "@/api/authApi"

export function NavAccount() {
  const navigate = useNavigate()
  const [authed, setAuthed] = useState(() => isAuthenticated())
  const  [logout ] = useLogoutMutation()
  useEffect(() => {
    const off = onAuthChange(() => setAuthed(isAuthenticated()))
    return off
  }, [])

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="icon">
            <User/>
          <span className="sr-only">Account</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        {!authed ? (
          <>
            <DropdownMenuItem onClick={() => navigate('/login')}>
              <LogInIcon />
              login    
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => navigate('/signup')}>
              <LogInIcon />
              sign up
            </DropdownMenuItem>
          </>
        ) : (
          <>
            <DropdownMenuItem onClick={() => navigate('/profile')}>
              <User />
              profile
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => { logout(); navigate('/'); }}>
              <LogOutIcon/>logout
            </DropdownMenuItem>
          </>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
