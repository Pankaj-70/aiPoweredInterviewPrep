import { SignUp } from "@clerk/nextjs";
import Image from "next/image";

export default function Page() {
  return (
    <div className="h-screen w-full bg-linear-to-r from-indigo-500 via-gray-900 to-gray-900 grid md:grid-cols-2">
      {/* Left Section (Image) */}
      <div className="flex items-center justify-center pr-6">
        <Image
          alt="auth"
          src={'/auth.png'}
          className="w-full h-full drop-shadow-lg animate-fade-in rounded-l-md opacity-70"
        />
      </div>

      {/* Right Section (Sign-in Card) */}
      <div className="flex items-center justify-center p-6 bg-white dark:bg-gray-900 rounded-xl shadow-xl m-2 md:m-12">
        <div className="w-full max-w-sm">
          <SignUp
            appearance={{
              elements: {
                formButtonPrimary:
                  "bg-indigo-600 hover:bg-indigo-700 transition"
              }
            }}
          />
        </div>
      </div>
    </div>
  );
}
