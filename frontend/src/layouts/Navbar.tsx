"use client";

import * as React from "react";
import { useLocation } from "react-router-dom";
import { cn } from "@/lib/utils";
import { Icons } from "@/components/icons";
import {
  NavigationMenu,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  navigationMenuTriggerStyle,
} from "@/components/ui/navigation-menu";

import { ModeToggle } from "@/components/mode-toggle";
import { NavAccount } from "@/components/nav-account";
import { MobileNav } from "@/components/MobileNav";
import { useGetMeQuery } from "@/api/authApi";
import { useGetBookingRequestsQuery } from "@/api/bookingApi";

export default function Navbar() {
  const [isScrolled, setIsScrolled] = React.useState(false);
  const { pathname } = useLocation();
  // On browse we keep a full-width bar so the filter bar can attach beneath it
  // as one continuous glass header (Airbnb-style).
  const isBrowse = pathname.startsWith("/browse");

  const { data: user } = useGetMeQuery();
  const isSitter = !!user?.petSitterId;
  const { data: requests } = useGetBookingRequestsQuery(undefined, { skip: !isSitter });
  const pendingCount = requests?.filter((b) => b.status === "PENDING").length ?? 0;

  React.useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 60);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const navContent = (
    <>
      <NavigationMenu>
        <NavigationMenuList>
          <NavigationMenuItem>
            <div>
              <NavigationMenuLink className={navigationMenuTriggerStyle()} href="/">
                <Icons.logo className="h-6 w-6" />
              </NavigationMenuLink>
            </div>
          </NavigationMenuItem>

          <span className="hidden md:flex gap-x-1">
            <NavigationMenuItem>
              <NavigationMenuLink className={navigationMenuTriggerStyle()} href="/browse">
                Browse
              </NavigationMenuLink>
            </NavigationMenuItem>

            {isSitter && (
              <NavigationMenuItem>
                <NavigationMenuLink
                  className={cn(navigationMenuTriggerStyle(), "relative")}
                  href="/sitter-hub"
                >
                  Sitter Hub
                  {pendingCount > 0 && (
                    <span className="absolute -right-1 -top-1 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[10px] font-medium text-white">
                      {pendingCount}
                    </span>
                  )}
                </NavigationMenuLink>
              </NavigationMenuItem>
            )}
          </span>
        </NavigationMenuList>
      </NavigationMenu>

      <div className="flex gap-x-1">
        <ModeToggle />
        <NavAccount />
        <MobileNav />
      </div>
    </>
  );

  if (isBrowse) {
    // No border-b here: the sticky filter strip below owns the single bottom
    // border, so navbar + strip read as one continuous glass pane.
    return (
      <div className="fixed inset-x-0 top-0 z-50 h-16">
        <div className="flex h-full w-full items-center justify-between bg-background/85 px-4 backdrop-blur-xl md:px-10">
          {navContent}
        </div>
      </div>
    );
  }

  return (
    <div className={cn(
      "group   mx-2 w-full  fixed z-50  transition-all duration-300 ",
      isScrolled ? "top-4 max-w-sm mx-4" : "top-0 max-w-full "
    )}>
      <div className={cn(
        "flex justify-between w-full p-1 rounded-lg ring-1 ring-border backdrop-blur-xl transition-all duration-300 ease-in ",
        isScrolled
          ? "bg-card/20"
          : "bg-card/20 shadow-sm rounded-none  p-5"
      )}>
        {navContent}
      </div>
    </div>
  );
}