"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { useAuthenticatedRequest } from "@/lib/auth"
import { studentsService, setAuthenticatedRequestFn, type AlunoResponse } from "@/lib/students"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Switch } from "@/components/ui/switch"
import { ArrowLeft } from "lucide-react"

interface StudentEditFormProps {
  studentId: string
  onSuccess: () => void
  onCancel: () => void
}

interface AlunoEditFormData {
  nome: string
  matricula?: string | null
  data_nascimento: string
  genero: 'masc' | 'fem'
  responsaveis: number[]
  turma?: string | null
  renda_familiar_mensal?: string | null
  ativo?: boolean
  comprovante_residencia_url?: File | null
}

interface AlunoEditData {
  nome: string
  matricula?: string
  data_nascimento: string
  genero: 'masc' | 'fem'
  turma?: string
  renda_familiar_mensal?: string
  ativo: boolean
  comprovante_residencia_url?: File | null
}

export function StudentEditForm({ studentId, onSuccess, onCancel }: StudentEditFormProps) {
  const { makeRequest } = useAuthenticatedRequest()
  const [isLoading, setIsLoading] = useState(false)
  const [isLoadingData, setIsLoadingData] = useState(true)
  const [error, setError] = useState("")
  const [student, setStudent] = useState<AlunoResponse | null>(null)
  
  const [alunoData, setAlunoData] = useState<AlunoEditData>({
    nome: "",
    matricula: "",
    data_nascimento: "",
    genero: "masc",
    turma: "",
    renda_familiar_mensal: "",
    ativo: true,
    comprovante_residencia_url: null
  })

  useEffect(() => {
    setAuthenticatedRequestFn(makeRequest)
  }, [makeRequest])

  useEffect(() => {
    loadStudentData()
  }, [studentId])

  const loadStudentData = async () => {
    setIsLoadingData(true)
    try {
      const studentData = await studentsService.getById(studentId)
      if (studentData) {
        setStudent(studentData)
        setAlunoData({
          nome: studentData.nome,
          matricula: studentData.matricula || "",
          data_nascimento: studentData.data_nascimento,
          genero: studentData.genero,
          turma: studentData.turma || "",
          renda_familiar_mensal: studentData.renda_familiar_mensal || "",
          ativo: studentData.ativo ?? true,
          comprovante_residencia_url: null
        })
      } else {
        setError("Aluno não encontrado")
      }
    } catch (err) {
      setError("Erro ao carregar dados do aluno")
    } finally {
      setIsLoadingData(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setIsLoading(true)
    setError("")

    const formData = new FormData(e.currentTarget)
    const turmaValue = formData.get("turma") as string
    const data: AlunoEditData = {
      nome: formData.get("nome") as string,
      matricula: (formData.get("matricula") as string) || undefined,
      data_nascimento: formData.get("data_nascimento") as string,
      genero: formData.get("genero") as 'masc' | 'fem',
      turma: (turmaValue === "sem-turma" ? undefined : turmaValue) || undefined,
      renda_familiar_mensal: (formData.get("renda_familiar_mensal") as string) || undefined,
      ativo: formData.get("ativo") === "on",
      comprovante_residencia_url: formData.get("comprovante") as File || null,
    }

    try {
      if (data.comprovante_residencia_url && data.comprovante_residencia_url.size > 0) {
        const updateData: AlunoEditFormData = {
          nome: data.nome,
          matricula: data.matricula || null,
          data_nascimento: data.data_nascimento,
          genero: data.genero,
          turma: data.turma || null,
          renda_familiar_mensal: data.renda_familiar_mensal || null,
          ativo: data.ativo,
          comprovante_residencia_url: data.comprovante_residencia_url,
          responsaveis: student?.responsaveis || [],
        }
        await studentsService.updateWithFile(studentId, updateData)
      } else {
        const updateData = {
          nome: data.nome,
          matricula: data.matricula || null,
          data_nascimento: data.data_nascimento,
          genero: data.genero,
          turma: data.turma || null,
          renda_familiar_mensal: data.renda_familiar_mensal || null,
          ativo: data.ativo,
          responsaveis: student?.responsaveis || [],
        }
        await studentsService.update(studentId, updateData)
      }
      
      onSuccess()
    } catch (err) {
      setError("Erro ao atualizar aluno. Verifique os dados e tente novamente.")
    } finally {
      setIsLoading(false)
    }
  }

  if (isLoadingData) {
    return (
      <Card className="w-full max-w-2xl mx-auto">
        <CardContent className="flex items-center justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Carregando dados do aluno...</p>
        </CardContent>
      </Card>
    )
  }

  if (!student) {
    return (
      <Card className="w-full max-w-2xl mx-auto">
        <CardContent className="py-8">
          <Alert variant="destructive">
            <AlertDescription>
              {error || "Aluno não encontrado"}
            </AlertDescription>
          </Alert>
          <Button onClick={onCancel} className="mt-4 cursor-pointer">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Voltar
          </Button>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle>Editar Aluno</CardTitle>
        <CardDescription>
          Altere os dados do aluno {student.nome}
        </CardDescription>
      </CardHeader>
      
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="nome">Nome completo *</Label>
                <Input 
                  id="nome" 
                  name="nome" 
                  maxLength={255} 
                  defaultValue={alunoData.nome}
                  required 
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="matricula">Matrícula</Label>
                <Input 
                  id="matricula" 
                  name="matricula" 
                  maxLength={50} 
                  defaultValue={alunoData.matricula}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="data_nascimento">Data de nascimento *</Label>
                <Input 
                  id="data_nascimento" 
                  name="data_nascimento" 
                  type="date" 
                  defaultValue={alunoData.data_nascimento}
                  required 
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="genero">Gênero *</Label>
                <Select name="genero" defaultValue={alunoData.genero} required>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione o gênero" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="masc">Masculino</SelectItem>
                    <SelectItem value="fem">Feminino</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="turma">Turma</Label>
                <Select name="turma" defaultValue={alunoData.turma || "sem-turma"}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione a turma" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="sem-turma">Nenhuma turma</SelectItem>
                    <SelectItem value="Infantil A">Infantil A</SelectItem>
                    <SelectItem value="Infantil B">Infantil B</SelectItem>
                    <SelectItem value="Maternal A">Maternal A</SelectItem>
                    <SelectItem value="Maternal B">Maternal B</SelectItem>
                    <SelectItem value="Jardim A">Jardim A</SelectItem>
                    <SelectItem value="Jardim B">Jardim B</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="renda_familiar_mensal">Renda familiar mensal</Label>
                <Input 
                  id="renda_familiar_mensal" 
                  name="renda_familiar_mensal" 
                  type="number"
                  step="0.01"
                  placeholder="0.00"
                  defaultValue={alunoData.renda_familiar_mensal}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="comprovante">Novo Comprovante de Residência (opcional)</Label>
              <Input 
                id="comprovante" 
                name="comprovante" 
                type="file" 
                accept=".pdf,.jpg,.jpeg,.png"
              />
              <p className="text-sm text-muted-foreground">
                Deixe vazio para manter o comprovante atual. Formatos aceitos: PDF, JPG, JPEG, PNG (máximo 10MB)
              </p>
            </div>

            <div className="flex items-center space-x-2">
              <Switch 
                id="ativo" 
                name="ativo" 
                defaultChecked={alunoData.ativo}
              />
              <Label htmlFor="ativo">Aluno ativo</Label>
            </div>
          </div>

          {error && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <div className="flex gap-4 justify-end">
            <Button type="button" variant="outline" onClick={onCancel} className="cursor-pointer">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Cancelar
            </Button>
            <Button type="submit" disabled={isLoading} className="cursor-pointer">
              {isLoading ? "Salvando..." : "Salvar Alterações"}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}
