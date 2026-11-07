import { DM_Sans } from "next/font/google";
import { Toaster } from "sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider } from "@/components/auth/AuthProvider";
import { AuthDialogsProvider } from "@/components/auth/AuthDialogs";
import { variablesFuentesTemas } from "@/themes/fuentes";
import "./globals.css";

const sans = DM_Sans({ variable: "--font-sans-app", subsets: ["latin"], display: "swap" });

export const metadata = {
  title: { default: "Costeñisimos", template: "%s" },
};

export default function RootLayout({ children }) {
  return (
    <html lang="es" className={`${sans.variable} ${variablesFuentesTemas} h-full antialiased`}>
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
