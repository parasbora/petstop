"use client";

import * as React from "react";
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

export default function Navbar() {
  const [isScrolled, setIsScrolled] = React.useState(false);

  React.useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 60);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

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
            </span>
          </NavigationMenuList>
        </NavigationMenu>

        <div className="flex gap-x-1">
          <ModeToggle />
          <NavAccount />
          <MobileNav />
        </div>
      </div>
    </div>
  );
}