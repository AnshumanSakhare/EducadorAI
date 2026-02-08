'use client';
import Link from "next/link";
import { usePathname } from "next/navigation";
import type { ReactNode } from "react";

type NavLinkProps = {
  href: string;
  children: ReactNode;
  className?: string;
};

export default function NavLink({ href, children, className }: NavLinkProps) {
  const pathname = usePathname();
  const isActive =
    pathname === href || (href !== "/" && pathname.startsWith(href));

  const baseClasses =
    "transition-colors text-sm duration-200 text-gray-600 hover:text-rose-500";
  const activeClasses = isActive ? " text-rose-500" : "";
  const customClasses = className ? ` ${className}` : "";

  return (
    <Link href={href} className={baseClasses + activeClasses + customClasses}>
      {children}
    </Link>
  );
}