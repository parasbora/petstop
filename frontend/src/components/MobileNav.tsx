import { Button } from "@/components/ui/button"
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet"
import { Menu } from "lucide-react"
import { Link } from "react-router"

export function MobileNav() {
  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button variant="outline" size="icon" className="flex md:hidden">
          <Menu />
          <span className="sr-only">Mobile Nav</span>
        </Button>
      </SheetTrigger>
      <SheetContent>
        <SheetHeader>
          <SheetTitle>Menu</SheetTitle>
        </SheetHeader>
        <div className="flex flex-col gap-4 py-4">
          <SheetClose asChild>
            <Link to="/" className="text-lg font-medium hover:underline">
              Home
            </Link>
          </SheetClose>
          <SheetClose asChild>
            <Link to="/browse" className="text-lg font-medium hover:underline">
              Browse
            </Link>
          </SheetClose>
        </div>
      </SheetContent>
    </Sheet>
  )
}
