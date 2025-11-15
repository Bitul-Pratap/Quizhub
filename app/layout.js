import "./globals.css";
import MainNavbar from "@/components/MainNavbar";
import SessionWrapper from "@/components/SessionWrapper";
import { ThemeProvider } from "next-themes";
import { Suspense } from "react";
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';



export const metadata = {
  title: "Quizhub",
  description: "An online quiz platform to create, share and manage quizzes.",
  icons: {
    icon: "/favicons/favicon.ico",                     // basic favicon
    shortcut: "/favicons/favicon-32x32.png",           // legacy shortcut icon
    apple: "/favicons/apple-touch-icon.png",           // iOS homescreen
    other: [
      { rel: "icon", url: "/favicons/favicon-16x16.png", sizes: "16x16" },
      { rel: "icon", url: "/favicons/favicon-32x32.png", sizes: "32x32" },
      { rel: "mask-icon", url: "/favicons/safari-pinned-tab.svg", color: "#111827" } // Safari pinned tab
    ]
  },
  manifest: "/favicons/site.webmanifest",              // link to web manifest in /public
  // themeColor: "#0f172a",                      // used for mobile browser UI
  openGraph: {
    title: "Quizhub",
    description: "An online quiz platform to create, share and manage quizzes.",
    url: `${process.env.NEXT_PUBLIC_URL}`,     // use your site URL
    images: [
      {
        url: `${process.env.NEXT_PUBLIC_URL}/image.png`,
        width: 1200,
        height: 630,
        alt: "Quizhub preview image"
      }
    ],
    siteName: "Quizhub",
    type: "website"
  },
  twitter: {
    card: "summary_large_image",
    title: "Quizhub",
    description: "An online quiz platform to create, share and manage quizzes.",
    images: [`${process.env.NEXT_PUBLIC_URL}/image.png`],
    creator: "@your_twitter_handle"
  },
  verification: {
    google: 'c7ATtBzryKDMheQ-C6VpeSaYTmlMs0X67-VyVad3Ezs',
  },

};

export default function RootLayout({ children }) {
  return (
    <html lang="en" suppressHydrationWarning>
      {/* <body className="bg-gradient-to-b from-gray-100 to-orange-200"> */}
      <body className="text-neutral-800  dark:text-[#e3e3e3] bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800">
        <SessionWrapper>
          <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
            <ToastContainer
              stacked
              position="top-right"
              autoClose={3000}
              hideProgressBar={false}
              newestOnTop={false}
              closeOnClick
              rtl={false}
              pauseOnFocusLoss
              draggable
              draggablePercent={60}
              pauseOnHover
              theme="light"
              style={{ zIndex: 100 }}
              toastStyle={{ background: "#FF5F1F", width: "100%" }}
            />
            <div className="min-h-screen  bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800  ">
              {/* <MainNavbar /> */}
              {/* <Suspense fallback={<Loading />}> */}
              {children}
              {/* </Suspense> */}
            </div>
          </ThemeProvider>
        </SessionWrapper>
      </body>
    </html>
  );
}
