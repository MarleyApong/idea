import createMiddleware from "next-intl/middleware"
import { routing } from "@/shared/i18n/routing"

export default createMiddleware(routing)

export const config = {
  matcher: [
    "/((?!api|uploads|_next/static|_next/image|favicon.ico|.*\\.(?:png|jpg|jpeg|gif|webp|svg|ico|pdf|txt|md)).*)",
  ],
}
