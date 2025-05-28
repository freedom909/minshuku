import { withAuth } from "next-auth/middleware"

// 更多配置参见: https://next-auth.js.org/configuration/nextjs#middleware
export default withAuth({
  // 需要保护的路由
  callbacks: {
    authorized({ req, token }) {
      // `/admin` 需要 admin 角色
      if (req.nextUrl.pathname.startsWith("/admin")) {
        return token?.role === "admin"
      }
      // 其他需要登录的路由只需要有 token 即可
      return !!token
    },
  },
})

// 配置需要保护的路由
export const config = {
  matcher: [
    // 需要保护的路由
    "/dashboard/:path*",
    "/admin/:path*",
    "/api/dashboard/:path*",
    "/api/users/:path*",
    // 排除不需要保护的路由
    "/((?!api/auth|_next/static|_next/image|favicon.ico|login).*)",
  ],
}