"use client";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Sparkles } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { usePathname, useRouter } from "next/navigation";
import { useAuth } from "@clerk/nextjs";
import NavLink from "@/components/ui/common/nav-link";


export default function Hero() {
    const { isSignedIn } = useAuth();
    const [showAuthModal, setShowAuthModal] = useState(false);
    const router = useRouter();
    const pathname = usePathname();

    useEffect(() => {
        if (pathname === "/sign-in" || pathname === "/sign-up") {
            setShowAuthModal(false);
        }
    }, [pathname]);

    const handleUploadClick = () => {
        if (!isSignedIn) {
            setShowAuthModal(true);
            return;
        }
        router.push('/upload');
    }

    return(
        <section className="relative mx-auto flex flex-col z-0 items-center justify-cneter py-16 sm:py-20 lg:pb-28 transition-all animate-in lg:px-12 max-w-7xl ">
            <div>
            <div className="flex">
            <Badge className="flex items-center gap-2 bg-white text-rose-600 border-rose-600 rounded-full px-6 py-2 text-md">
                <Sparkles className="!w-6 !h-6 animate-pulse" />
                 <p>Powered by AI</p>
            </Badge>

                </div>
                </div>
                <h1 className="text-4xl font-bold py-6 mt-16">
                Your all-in-one AI-powered study assistant. 
                </h1>
                <h2 className="text-2xl text-center px-4 lg:max-w-4xl lg:px-0 py-6 text-gray-600 ">
                Instantly transform your textbooks into interactive concise summaries.
                </h2>
                <div className="flex flex-col sm:flex-row gap-4 sm:gap-5 mt-10 w-full sm:w-auto">
                  <Button onClick={handleUploadClick} className="px-8 py-7 bg-rose-600 text-white rounded-2xl font-semibold text-lg shadow-lg shadow-rose-500/40 hover:bg-rose-700 hover:shadow-rose-500/60 transition w-full sm:w-auto">
                    Upload PDF
                  </Button>
                  <Button
                    variant="outline"
                    className="px-8 py-7 rounded-2xl font-semibold text-lg border-rose-500 text-rose-600 dark:text-rose-300 bg-white/90 dark:bg-white/5 hover:bg-rose-50 dark:hover:bg-rose-500/10 transition w-full sm:w-auto"
                  >
                    Learn More
                  </Button>
                </div>

            {showAuthModal && (
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
        </section>
);
}   
