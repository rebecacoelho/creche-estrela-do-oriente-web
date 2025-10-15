"use client"

import { useAuth } from "@/lib/auth"
import { LoginForm } from "@/components/login-form"
import { DashboardPage } from "@/components/dashboard-page"

export default function HomePage() {
  const { user } = useAuth()

  if (!user) {
    return <LoginForm />
  }

  return <DashboardPage />
}
