import { Nunito_Sans, DM_Sans } from 'next/font/google'
import "./globals.css";
import Layout from '@/components/Layout/Layout'
import { Analytics } from "@vercel/analytics/next"

const nunito = Nunito_Sans({
    subsets: ['latin'],
    weight: ['400', '500', '600', '700'],
})

const dmSans = DM_Sans({
    subsets: ['latin'],
    weight: ['400', '500', '600', '700'],
})

const defaultUrl = process.env.VERCEL_URL
  ? `https://${process.env.VERCEL_URL}`
  : "http://localhost:3000"

export const metadata = {
  metadataBase: new URL(defaultUrl),
  title: "Flowspace - Next Generation Virtual Office",
  description: "Build immersive virtual workspaces where teams naturally connect, collaborate, and thrive.",
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={dmSans.className}>
      <body>
        <Layout>
            {children}
        </Layout>
        <Analytics />
      </body>
    </html>
  );
}
