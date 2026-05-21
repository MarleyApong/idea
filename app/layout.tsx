import type { Metadata } from "next"

export const metadata: Metadata = {
  icons: {
    icon: "/icon.png",
    shortcut: "/icon.png",
    apple: "/icon.png",
  },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return children
}
