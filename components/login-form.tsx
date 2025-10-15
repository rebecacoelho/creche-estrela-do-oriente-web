"use client"

import type React from "react"

import { useState } from "react"
import { useAuth } from "@/lib/auth"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

export function LoginForm() {
  const { login, register } = useAuth()
  const [loginError, setLoginError] = useState("")
  const [registerError, setRegisterError] = useState("")
  const [success, setSuccess] = useState("")
  const [activeTab, setActiveTab] = useState("login")
  const [isLoginLoading, setIsLoginLoading] = useState(false)
  const [isRegisterLoading, setIsRegisterLoading] = useState(false)
  
  const handleTabChange = (value: string) => {
    setActiveTab(value)
  }

  const handleLogin = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setLoginError("")
    setSuccess("")
    setIsLoginLoading(true)

    const formData = new FormData(e.currentTarget)
    const email = formData.get("email") as string
    const password = formData.get("password") as string

    const success = await login(email, password)
    setIsLoginLoading(false)
    if (!success) {
      setLoginError("Email ou senha incorretos")
    }
  }

  const handleRegister = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setRegisterError("")
    setSuccess("")

    const formData = new FormData(e.currentTarget)
    const email = formData.get("email") as string
    const password = formData.get("password") as string
    const username = email 
  
    if (password.length < 6) {
      setRegisterError("A senha deve ter pelo menos 6 caracteres")
      return
    }

    setIsRegisterLoading(true)
    const result = await register(email, password, username)
    setIsRegisterLoading(false)
    if (!result.success) {
      setRegisterError(result.error || "Erro ao cadastrar usuário. Tente novamente.")
    } else {
      setRegisterError("")
      setSuccess("Conta criada com sucesso!")
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-muted/50 p-4 bg-[url(../public/new-logo.png)] bg-contain bg-[center_60px] bg-no-repeat">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-bold text-primary">Sistema de Gestão</CardTitle>
          <CardDescription>Creche Estrela do Oriente</CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs value={activeTab} onValueChange={handleTabChange} className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger className="cursor-pointer" value="login">Entrar</TabsTrigger>
              <TabsTrigger className="cursor-pointer" value="register">Cadastrar</TabsTrigger>
            </TabsList>

            <TabsContent value="login">
              <form onSubmit={handleLogin} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input id="email" name="email" type="email" placeholder="seu@email.com" required />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="password">Senha</Label>
                  <Input id="password" name="password" type="password" placeholder="••••••••" required />
                </div>

                {loginError && (
                  <Alert variant="destructive">
                    <AlertDescription>{loginError}</AlertDescription>
                  </Alert>
                )}

                <Button type="submit" className="w-full cursor-pointer" disabled={isLoginLoading}>
                  {isLoginLoading ? "Entrando..." : "Entrar"}
                </Button>

              </form>
            </TabsContent>

            <TabsContent value="register">
              <form onSubmit={handleRegister} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="register-email">Email</Label>
                  <Input id="register-email" name="email" type="email" placeholder="seu@email.com" required />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="register-password">Senha</Label>
                  <Input id="register-password" name="password" type="password" placeholder="••••••••" required />
                </div>

                {registerError && (
                  <Alert variant="destructive">
                    <AlertDescription>{registerError}</AlertDescription>
                  </Alert>
                )}

                {success && (
                  <Alert>
                    <AlertDescription>{success}</AlertDescription>
                  </Alert>
                )}

                <Button type="submit" className="w-full cursor-pointer" disabled={isRegisterLoading}>
                  {isRegisterLoading ? "Cadastrando..." : "Cadastrar"}
                </Button>
              </form>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  )
}
