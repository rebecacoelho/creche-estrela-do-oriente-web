"use client"

import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from "react"

interface User {
  email: string
  username: string
  role: "admin" 
}

interface AuthTokens {
  access: string
  refresh: string
}

interface AuthContextType {
  user: User | null
  tokens: AuthTokens | null
  login: (email: string, password: string) => Promise<boolean>
  register: (email: string, password: string, username: string) => Promise<{ success: boolean; error?: string }>
  logout: () => void
  refreshToken: () => Promise<boolean>
  isLoading: boolean
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

const API_BASE_URL = "https://estreladooriente-production.up.railway.app/api"

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [tokens, setTokens] = useState<AuthTokens | null>(null)
  const [isLoading, setIsLoading] = useState(true)


  useEffect(() => {
    const storedUser = localStorage.getItem("daycare_user")
    const storedTokens = localStorage.getItem("daycare_tokens")
    
    if (storedUser && storedTokens) {
      setUser(JSON.parse(storedUser))
      setTokens(JSON.parse(storedTokens))
    }
    setIsLoading(false)
  }, [])

  const login = async (email: string, password: string): Promise<boolean> => {
    setIsLoading(true)

    try {
      const response = await fetch(`${API_BASE_URL}/token/`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          username: email,
          password: password,
        }),
      })

      if (response.ok) {
        const tokenData: AuthTokens = await response.json()
        
        const userData: User = {
          email: email,
          username: email,
          role: "admin",
        }

        setUser(userData)
        setTokens(tokenData)
        
        localStorage.setItem("daycare_user", JSON.stringify(userData))
        localStorage.setItem("daycare_tokens", JSON.stringify(tokenData))
        
        setIsLoading(false)
        return true
      } else {
        setIsLoading(false)
        return false
      }
    } catch (error) {
      console.error("Erro no login:", error)
      setIsLoading(false)
      return false
    }
  }

  const register = async (
    email: string,
    password: string,
    username: string,
  ): Promise<{ success: boolean; error?: string }> => {
    setIsLoading(true)

    try {
      const response = await fetch(`${API_BASE_URL}/register/`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: email,
          password: password,
          username: username,
        }),
      })

      if (response.ok) {
        const data = await response.json()

        const loginSuccess = await login(email, password)

        if (loginSuccess) {
          const tokensStored = localStorage.getItem("daycare_tokens")
          const tokenToUse = JSON.parse(tokensStored || "{}")

          await fetch(`${API_BASE_URL}/diretores/`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              "Authorization": `Bearer ${tokenToUse?.access}`,
            },
            body: JSON.stringify({
              user: data.id,
            }),
          })
        }

        setIsLoading(false)
        return { success: loginSuccess }
      } else {
        let errorMessage = "Erro ao cadastrar usuário. Tente novamente."
        
        try {
          const errorData = await response.json()
          errorMessage = errorData.username[0]

        } catch (parseError) {
          console.error('Erro ao fazer parse da resposta de erro:', parseError)
        }
        setIsLoading(false)
        return { success: false, error: errorMessage }
      }
    } catch (error) {
      console.error("Erro no registro:", error)
      setIsLoading(false)
      return { success: false, error: "Erro ao cadastrar usuário. Tente novamente." }
    }
  }

  const logout = useCallback(() => {
    setUser(null)
    setTokens(null)
    localStorage.removeItem("daycare_user")
    localStorage.removeItem("daycare_tokens")
  }, [])

  const refreshToken = useCallback(async (): Promise<boolean> => {
    if (!tokens?.refresh) {
      logout()
      return false
    }

    try {
      const response = await fetch(`${API_BASE_URL}/token/refresh/`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          refresh: tokens.refresh,
        }),
      })

      if (response.ok) {
        const newTokenData: AuthTokens = await response.json()
        setTokens(newTokenData)
        localStorage.setItem("daycare_tokens", JSON.stringify(newTokenData))
        return true
      } else {
        logout()
        return false
      }
    } catch (error) {
      console.error("Erro ao renovar token:", error)
      logout()
      return false
    }
  }, [tokens?.refresh, logout])

  useEffect(() => {
    if (!tokens?.access) return

    const checkTokenExpiration = () => {
      try {
        const payload = JSON.parse(atob(tokens.access.split('.')[1]))
        const currentTime = Date.now() / 1000
        const timeUntilExpiry = payload.exp - currentTime
        
        if (timeUntilExpiry <= 0) {
          logout()
        } else if (timeUntilExpiry < 300) { 
          refreshToken()
        }
      } catch (error) {
        console.error("Erro ao verificar expiração do token:", error)
        logout()
      }
    }

    checkTokenExpiration()
    const interval = setInterval(checkTokenExpiration, 120000) 

    return () => clearInterval(interval)
  }, [tokens?.access, refreshToken])

  return <AuthContext.Provider value={{ user, tokens, login, register, logout, refreshToken, isLoading }}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}

export async function makeAuthenticatedRequest(
  url: string,
  options: RequestInit = {},
  tokens: AuthTokens | null,
  refreshTokenFn: () => Promise<boolean>
): Promise<Response> {
  if (!tokens?.access) {
    throw new Error("Token de acesso não disponível")
  }

  try {
    const payload = JSON.parse(atob(tokens.access.split('.')[1]))
    const currentTime = Date.now() / 1000
    const timeUntilExpiry = payload.exp - currentTime
    
    if (timeUntilExpiry <= 0) {
      const refreshSuccess = await refreshTokenFn()
      if (!refreshSuccess) {
        throw new Error("Token expirado e não foi possível renovar")
      }
    }
  } catch (error) {
    throw new Error("Token inválido")
  }

  const isFormData = options.body instanceof FormData
  const headers: HeadersInit = {
    ...(options.headers || {}),
    "Authorization": `Bearer ${tokens.access}`,
  }
  
  if (!isFormData) {
    (headers as Record<string, string>)["Content-Type"] = "application/json"
  }

  let response = await fetch(url, {
    ...options,
    headers,
  })

  if (response.status === 401) {
    const refreshSuccess = await refreshTokenFn()
    
    if (refreshSuccess) {
      const storedTokens = localStorage.getItem("daycare_tokens")
      if (storedTokens) {
        const newTokens: AuthTokens = JSON.parse(storedTokens)
        
        const retryHeaders: HeadersInit = {
          ...(options.headers || {}),
          "Authorization": `Bearer ${newTokens.access}`,
        }
        
        if (!isFormData) {
          (retryHeaders as Record<string, string>)["Content-Type"] = "application/json"
        }
        
        response = await fetch(url, {
          ...options,
          headers: retryHeaders,
        })
      }
    }
  }

  return response
}

export function useAuthenticatedRequest() {
  const { tokens, refreshToken } = useAuth()

  const makeRequest = async (url: string, options: RequestInit = {}) => {
    return makeAuthenticatedRequest(url, options, tokens, refreshToken)
  }

  return { makeRequest }
}
