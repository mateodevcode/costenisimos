import { DM_Sans } from "next/font/google";
import { Toaster } from "sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider } from "@/components/auth/AuthProvider";
import { AuthDialogsProvider } from "@/components/auth/AuthDialogs";
import { variablesFuentesTemas } from "@/themes/fuentes";
import { urlBase } from "@/lib/seo";
import "./globals.css";

const sans = DM_Sans({ variable: "--font-sans-app", subsets: ["latin"], display: "swap" });

export const metadata = {
  // Base para convertir en absolutas las URLs de Open Graph, canonical, etc.
  metadataBase: new URL(urlBase()),
  title: { default: "Costeñisimos", template: "%s" },
  formatDetection: { telephone: false, address: false, email: false },
};

export const viewport = {
  themeColor: "#5c6b45",
};

export default function RootLayout({ children }) {
  return (
    <html lang="es-CO" className={`${sans.variable} ${variablesFuentesTemas} h-full antialiased`}>
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
