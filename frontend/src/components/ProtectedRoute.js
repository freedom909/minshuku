'use client'

import { useSession } from "next-auth/react"
import { useRouter, usePathname } from "next/navigation"
import { useEffect } from "react"
import Loading from "./Loading"

/**
 * 路由保护组件
 * @param {Object} props
 * @param {React.ReactNode} props.children - 子组件
 * @param {string[]} [props.allowedRoles] - 允许访问的角色列表，如果不提供则只检查是否登录
 * @param {string} [props.redirectTo="/login"] - 未授权时重定向的路径
 */
export default function ProtectedRoute({
  children,
  allowedRoles,
  redirectTo = "/login"
}) {
  const { data: session, status } = useSession()
  const router = useRouter()
  const pathname = usePathname()

  useEffect(() => {
    // 如果会话加载完成且用户未登录，重定向到登录页
    if (status === "unauthenticated") {
      router.push(`${redirectTo}?callbackUrl=${encodeURIComponent(pathname)}`)
      return
    }

    // 如果指定了角色限制且用户已登录，检查角色权限
    if (status === "authenticated" && allowedRoles?.length > 0) {
      const userRole = session?.user?.role || "user"
      if (!allowedRoles.includes(userRole)) {
        // 如果用户角色不在允许列表中，重定向到首页
        router.push("/")
      }
    }
  }, [status, session, router, pathname, allowedRoles, redirectTo])

  // 如果会话正在加载，显示加载状态
  if (status === "loading") {
    return <Loading />
  }

  // 如果未指定角色限制，只要用户已登录就显示内容
  if (!allowedRoles?.length && status === "authenticated") {
    return children
  }

  // 如果指定了角色限制，检查用户角色
  if (allowedRoles?.length > 0 && status === "authenticated") {
    const userRole = session?.user?.role || "user"
    if (allowedRoles.includes(userRole)) {
      return children
    }
    // 如果角色不匹配，返回 null（实际上会被上面的 useEffect 重定向）
    return null
  }

  // 其他情况（未登录等）返回 null（实际上会被上面的 useEffect 重定向）
  return null
}