import type { Metadata } from "next";
import { Geist, Geist_Mono, DM_Sans } from "next/font/google";
import "./globals.css";
import { cn } from "@/lib/utils";
import { ThemeProvider } from "@/components/theme/ThemeProvider";
import { Toaster } from "@/components/ui/sonner";
import { ClerkProvider } from '@clerk/nextjs';
import { dark } from '@clerk/themes';
import { THEME_STORAGE_KEY } from "@/lib/theme-constants";

const dmSans = DM_Sans({ subsets: ['latin'], variable: '--font-sans' });

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Levercast",
  description: "Create posts, publish everywhere",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={cn("h-full", geistSans.variable, geistMono.variable, dmSans.variable)}
      suppressHydrationWarning
    >
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(){try{var k=${JSON.stringify(
              THEME_STORAGE_KEY,
            )};var t=localStorage.getItem(k);var d=t!=='light';var el=document.documentElement;if(d){el.classList.add('dark');el.style.colorScheme='dark';}else{el.classList.remove('dark');el.style.colorScheme='light';}}catch(e){}})();`,
          }}
        />
      </head>
      <body className="min-h-full flex flex-col bg-background text-foreground">
        <ClerkProvider
          appearance={{
            baseTheme: dark,
            variables: {
              colorPrimary: '#e8721c',
              colorBackground: '#1c1c1c',
              colorInputBackground: '#252525',
              colorInputText: '#f5f5f5',
              colorText: '#f5f5f5',
              colorTextSecondary: '#a6a6a6',
              colorNeutral: '#ffffff',
              colorShimmer: '#2a2a2a',
              borderRadius: '0.5rem',
            },
            elements: {
              formFieldLabel: { color: "#f5f5f5" },
              formFieldInput: { color: "#f5f5f5" },
              formFieldAction: { color: "#f5f5f5" },
              headerTitle: { color: "#f5f5f5" },
              headerSubtitle: { color: "#a6a6a6" },
              dividerText: { color: "#a6a6a6" },
              dividerLine: { borderColor: "#383838" },
              footerActionText: { color: "#a6a6a6" },
              footerActionLink: { color: "#f5f5f5" },
              footer: { color: "#a6a6a6" },
              footerPages: { color: "#a6a6a6" },
              footerPagesLink: { color: "#a6a6a6" },
              socialButtonsBlockButtonText: { color: "#f5f5f5" },
              socialButtonsBlockButtonArrow: { color: "#f5f5f5" },
              formFieldInputShowPasswordButton: { color: "#a6a6a6" },
              // "Use passkey" / "Switch method" pill button top-right of card
              alternativeMethodsBlockButton: { color: "#f5f5f5", borderColor: "#383838" },
              alternativeMethodsBlockButtonText: { color: "#f5f5f5" },
              badge: { color: "#f5f5f5", backgroundColor: "#2a2a2a", borderColor: "#383838" },
              lastAuthenticationStrategyBadge: {
                color: "#f5f5f5",
                backgroundColor: "#2a2a2a",
                border: "1px solid #383838",
              },
              identityPreviewText: { color: "#f5f5f5" },
              identityPreviewEditButton: { color: "#e8721c" },
              formButtonPrimary: { color: "#0f0f0f" },
              formButtonReset: { color: "#f5f5f5" },
              userButtonPopoverCard: {
                backgroundColor: '#1c1c1c',
                border: '1px solid #383838',
                boxShadow: '0 8px 32px rgba(0,0,0,0.5)',
              },
              userButtonPopoverMain: { backgroundColor: '#1c1c1c' },
              userButtonPopoverActions: { backgroundColor: '#1c1c1c' },
              userButtonPopoverActionButton: {
                color: '#f5f5f5',
              },
              userButtonPopoverActionButton__manageAccount: {
                color: '#f5f5f5',
              },
              userButtonPopoverActionButton__signOut: {
                color: '#f5f5f5',
              },
              userButtonPopoverFooter: {
                backgroundColor: '#181818',
                borderTop: '1px solid #383838',
              },
              userPreviewMainIdentifier: { color: '#f5f5f5' },
              userPreviewSecondaryIdentifier: { color: '#a6a6a6' },
            },
          }}
        >
          <ThemeProvider>
            {children}
            <Toaster />
          </ThemeProvider>
        </ClerkProvider>
      </body>
    </html>
  );
}