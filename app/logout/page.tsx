"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useToast } from "@/hooks/use-toast";
import { signOut } from "@/lib/auth-client";

export default function LogoutPage() {
  const router = useRouter();
  const { toast } = useToast();

  useEffect(() => {
    // Dummy logout logic
    toast({
      title: "Logged Out",
      description: "You have been successfully logged out.",
    });
    signOut().then(() => {
      router.push("/");
    });
    // Redirect to home page after a short delay
    // const timer = setTimeout(() => {
    //   router.push("/");
    // }, 2000);

    // return () => clearTimeout(timer);
  }, [router, toast]);

  return (
    <div className="container flex h-screen items-center justify-center">
      <p className="text-xl">Logging you out...</p>
    </div>
  );
}
