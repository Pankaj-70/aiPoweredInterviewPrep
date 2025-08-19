import React from "react";
import { Toaster } from "sonner";

const AuthLayout = ({ children }: { children: React.ReactNode }) => {
  return (
    <div className="auth-layout">
      {children}
      <Toaster />
    </div>
  );
};

export default AuthLayout;
