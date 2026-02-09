
"use client";

import { useState } from "react";
import { FileText } from "lucide-react";
import { Button } from "@/components/ui/button";
import NavLink from "@/components/ui/common/nav-link";
import { SignedOut, SignedIn, UserButton, useAuth } from "@clerk/nextjs";
import { usePathname } from "next/navigation";

export default function Header() {
  const { isSignedIn } = useAuth();
  const [showAuthModal, setShowAuthModal] = useState(false);
  const pathname = usePathname();
  const isAuthPage = pathname === "/sign-in" || pathname === "/sign-up";
  const shouldShowAuthModal = showAuthModal && !isAuthPage;

  const handleUploadClick = () => {
    if (!isSignedIn) {
      setShowAuthModal(true);
      return;
    }

    // If logged in, go to upload page
    if (typeof window !== "undefined") {
      window.location.href = "/upload";
    }
  };

  return (
    <>
      <nav className="w-full flex items-center justify-between py-4 lg:px-8 px-2">
        <div className="flex lg:flex-1">
          <NavLink
            href="/"
            className="flex items-center gap-1 lg:gap-2 text-2xl font-bold"
          >
            <FileText className="w-5 h-5 lg:w-8 lg:h-8 text-gray-900 hover:rotate-12" />
            <span className="font-extrabold text-gray-900">EducadorAI</span>
          </NavLink>
        </div>
        <div className="flex lg:justify-center gap-4 lg:gap-12 lg:items-center">
          <SignedIn>
            <NavLink href="/#dashboard">Dashboard</NavLink>
          </SignedIn>
        </div>
        <div className="flex items-center gap-3 lg:justify-end lg:flex-1">
          <Button
            type="button"
            onClick={handleUploadClick}
            className="px-4 py-2 rounded-full bg-rose-600 text-white text-sm font-semibold shadow-sm shadow-rose-500/40 hover:bg-rose-700 hover:shadow-rose-500/70 transition"
          >
            Upload PDF
          </Button>
            <div className="flex gap-2 items-center">
              <div className="px-2 py-1 rounded-full text-xs font-semibold bg-rose-50 text-rose-600 border border-rose-200">
                Pro
              </div>
              <SignedIn>
                <UserButton />
              </SignedIn>
            </div>
           <SignedOut>
            <NavLink href="/sign-in" className="text-sm font-medium">
              Sign in
            </NavLink>
          </SignedOut>
        </div>
      </nav>

      {shouldShowAuthModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
          <div className="w-full max-w-sm rounded-2xl bg-white dark:bg-slate-950 border border-rose-500/70 shadow-xl shadow-rose-500/30 p-6">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-1">
              Please log in to access this page
            </h2>
            <p className="text-sm text-gray-600 dark:text-gray-300 mb-4">
              You must be signed in to upload and process files.
            </p>
            <div className="flex justify-end gap-3">
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="text-gray-700 dark:text-gray-300"
                onClick={() => setShowAuthModal(false)}
              >
                Cancel
              </Button>
              <NavLink href="/sign-in">
                <Button
                  type="button"
                  size="sm"
                  className="bg-rose-600 text-white hover:bg-rose-700 rounded-full px-4"
                >
                  Go to sign in
                </Button>
              </NavLink>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
