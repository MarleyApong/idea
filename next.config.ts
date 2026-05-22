import type { NextConfig } from "next"
import createNextIntlPlugin from "next-intl/plugin"

const withNextIntl = createNextIntlPlugin("./shared/i18n/request.ts")

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      // Google profile pictures
      { protocol: "https", hostname: "lh3.googleusercontent.com" },
      // GitHub profile pictures
      { protocol: "https", hostname: "avatars.githubusercontent.com" },
    ],
    localPatterns: [
      // Images uploadees par les utilisateurs
      { pathname: "/uploads/**" },
    ],
  },
}

export default withNextIntl(nextConfig)
