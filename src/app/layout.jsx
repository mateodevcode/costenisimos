import { DM_Sans, Fraunces } from "next/font/google";
import { Toaster } from "sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider } from "@/components/auth/AuthProvider";
import { AuthDialogsProvider } from "@/components/auth/AuthDialogs";
import "./globals.css";

const sans = DM_Sans({ variable: "--font-sans-app", subsets: ["latin"], display: "swap" });
const display = Fraunces({ variable: "--font-display-app", subsets: ["latin"], display: "swap" });

export const metadata = {
  title: { default: "Costeñisimos", template: "%s" },
};

export default function RootLayout({ children }) {
  return (
    <html lang="es" className={`${sans.variable} ${display.variable} h-full antialiased`}>
      <body className="min-h-full">
        <AuthProvider>
          <TooltipProvider>
            <AuthDialogsProvider>{children}</AuthDialogsProvider>
          </TooltipProvider>
        </AuthProvider>
        <Toaster richColors position="top-center" closeButton />
      </body>
    </html>
  );
}
