import { Menu} from "lucide-react"
import React from "react"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuTrigger,

} from "@/components/ui/dropdown-menu"



export function NavDrawer() {


  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild className="flex md:hidden">
        <Button variant="outline" size="icon">
            <Menu/>
          <span className="sr-only">Toggle theme</span>
        </Button>
      </DropdownMenuTrigger>

    </DropdownMenu>

  )
}
