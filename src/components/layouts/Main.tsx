import {
  SignedIn,
  SignedOut,
  SignInButton,
  UserButton,
} from "@clerk/clerk-react";
import { Link } from "react-router";
import { ReactNode } from "react";
import { FaBookmark } from "react-icons/fa";

interface LayoutProps {
  children: ReactNode;
}

export function Layout({ children }: LayoutProps) {
  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white shadow-sm">
        <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">
            <Link
              to="/"
              className="flex items-center gap-3 text-xl font-bold text-gray-900 hover:text-gray-700 transition-colors"
            >
              <img
                src="/favicon.png"
                alt="IOMarkets Logo"
                className="h-8 w-8 rounded-md"
              />
              <span>IoMarkets <span className="font-normal text-sm">&reg;</span></span>
            </Link>
            <div className="flex items-center gap-4">
              <SignedIn>
                <Link
                  to="/bookmarks"
                  className="flex items-center gap-2 text-gray-600 hover:text-red-600 transition-colors cursor-pointer"
                >
                  <FaBookmark className="w-5 h-5" />
                  <span className="hidden sm:inline">Bookmarks</span>
                </Link>
              </SignedIn>
              <SignedOut>
                <SignInButton mode="modal">
                  <button className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 cursor-pointer">
                    Sign In
                  </button>
                </SignInButton>
              </SignedOut>
              <SignedIn>
                <UserButton />
              </SignedIn>
            </div>
          </div>
        </div>
      </nav>

      <main>{children}</main>
    </div>
  );
}
