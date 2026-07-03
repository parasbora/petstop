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
import { useGetMeQuery } from "@/api/authApi"
import { useGetBookingRequestsQuery } from "@/api/bookingApi"

export function MobileNav() {
  const { data: user } = useGetMeQuery()
  const isSitter = !!user?.petSitterId
  const { data: requests } = useGetBookingRequestsQuery(undefined, { skip: !isSitter })
  const pendingCount = requests?.filter((b) => b.status === "PENDING").length ?? 0

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
          {isSitter && (
            <SheetClose asChild>
              <Link to="/sitter-hub" className="flex items-center gap-2 text-lg font-medium hover:underline">
                Sitter Hub
                {pendingCount > 0 && (
                  <span className="flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-xs font-medium text-white">
                    {pendingCount}
                  </span>
                )}
              </Link>
            </SheetClose>
          )}
        </div>
      </SheetContent>
    </Sheet>
  )
}
