"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { useAuthenticatedRequest } from "@/lib/auth"
import { responsaveisService, alunosService, setAuthenticatedRequestFn, type ResponsavelResponse } from "@/lib/students"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Checkbox } from "@/components/ui/checkbox"
import { ChevronLeft, ChevronRight } from "lucide-react"

interface StudentFormMultiStepProps {
  onSuccess: () => void
  onCancel: () => void
}

interface ResponsavelData {
  nome: string
  cpf: string
  telefone: string
  email: string
  endereco: string
}

interface AlunoData {
  nome: string
  matricula?: string
  dataNascimento: string
  genero: 'masc' | 'fem'
  turma?: string
  rendaFamiliarMensal?: string
  comprovanteFile?: File | null
}

export function StudentFormMultiStep({ onSuccess, onCancel }: StudentFormMultiStepProps) {
  const { makeRequest } = useAuthenticatedRequest()
  const [currentStep, setCurrentStep] = useState(1)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")
  
  const [useExistingParent, setUseExistingParent] = useState(false)
  const [existingParents, setExistingParents] = useState<ResponsavelResponse[]>([])
  const [selectedResponsavelId, setSelectedResponsavelId] = useState<number | null>(null)
  
  const [responsavelData, setResponsavelData] = useState<ResponsavelData>({
    nome: "",
    cpf: "",
    telefone: "",
    email: "",
    endereco: ""
  })
  
  const [alunoData, setAlunoData] = useState<AlunoData>({
    nome: "",
    matricula: "",
    dataNascimento: "",
    genero: "masc",
    turma: "",
    rendaFamiliarMensal: "",
    comprovanteFile: null
  })

  const [createdResponsavel, setCreatedResponsavel] = useState<ResponsavelResponse | null>(null)

  useEffect(() => {
    setAuthenticatedRequestFn(makeRequest)
    loadExistingResponsaveis()
  }, [makeRequest])

  const loadExistingResponsaveis = async () => {
    try {
      const parents = await responsaveisService.getAll()
      setExistingParents(parents)
    } catch (error) {
      console.error('Erro ao carregar responsáveis:', error)
    }
  }

  const handleResponsavelSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setIsLoading(true)
    setError("")

    try {
      if (useExistingParent) {
        if (!selectedResponsavelId) {
          setError("Por favor, selecione um responsável existente.")
          setIsLoading(false)
          return
        }
        
        const selectedResponsavel = existingParents.find(r => r.id === selectedResponsavelId)
        if (!selectedResponsavel) {
          setError("Responsável selecionado não encontrado.")
          setIsLoading(false)
          return
        }
        
        setCreatedResponsavel(selectedResponsavel)
        setCurrentStep(2)
      } else {
        const formData = new FormData(e.currentTarget)
        const data: ResponsavelData = {
          nome: formData.get("nome") as string,
          cpf: formData.get("cpf") as string,
          telefone: formData.get("telefone") as string,
          email: formData.get("email") as string,
          endereco: formData.get("endereco") as string,
        }

        const responsavel = await responsaveisService.create({
          ...data,
          dados_extra: null
        })
        
        setCreatedResponsavel(responsavel)
        setResponsavelData(data)
        setCurrentStep(2)
      }
    } catch (err) {
      setError("Erro ao processar responsável. Verifique os dados e tente novamente.")
    } finally {
      setIsLoading(false)
    }
  }

  const handleAlunoSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setIsLoading(true)
    setError("")

    if (!createdResponsavel) {
      setError("Erro: Responsável não encontrado")
      setIsLoading(false)
      return
    }

    const formData = new FormData(e.currentTarget)
    const data: AlunoData = {
      nome: formData.get("nome") as string,
      matricula: (formData.get("matricula") as string) || undefined,
      dataNascimento: formData.get("dataNascimento") as string,
      genero: formData.get("genero") as 'masc' | 'fem',
      turma: (formData.get("turma") as string) || undefined,
      rendaFamiliarMensal: (formData.get("rendaFamiliarMensal") as string) || undefined,
      comprovanteFile: formData.get("comprovante") as File,
    }

    try {
      if (!data.comprovanteFile || data.comprovanteFile.size === 0) {
        setError("Por favor, selecione o comprovante de residência.")
        setIsLoading(false)
        return
      }

        await alunosService.createWithFile({
          nome: data.nome,
          matricula: data.matricula || null,
          data_nascimento: data.dataNascimento,
          genero: data.genero,
          responsaveis: [createdResponsavel.id],
          turma: data.turma || null,
          renda_familiar_mensal: data.rendaFamiliarMensal || null,
          ativo: true,
          comprovante_residencia_url: data.comprovanteFile,
        })
      
      setAlunoData(data)
      onSuccess()
    } catch (err) {
      setError("Erro ao cadastrar aluno. Verifique os dados e tente novamente.")
    } finally {
      setIsLoading(false)
    }
  }

  const handleBackToStep1 = () => {
    setCurrentStep(1)
    setError("")
    setCreatedResponsavel(null)
    setUseExistingParent(false)
    setSelectedResponsavelId(null)
    setAlunoData({
      nome: "",
      matricula: "",
      dataNascimento: "",
      genero: "masc",
      turma: "",
      rendaFamiliarMensal: "",
      comprovanteFile: null
    })
  }

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle>
          {currentStep === 1 ? "Cadastrar Responsável" : "Cadastrar Aluno"}
        </CardTitle>
        <CardDescription>
          {currentStep === 1 
            ? "Etapa 1 de 2: Preencha os dados do responsável"
            : "Etapa 2 de 2: Preencha os dados do aluno"
          }
        </CardDescription>
        
        <div className="flex items-center space-x-2 mt-4">
          <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
            currentStep >= 1 ? 'bg-blue-500 text-white' : 'bg-gray-200 text-gray-600'
          }`}>
            1
          </div>
          <div className={`flex-1 h-1 ${currentStep >= 2 ? 'bg-blue-500' : 'bg-gray-200'}`} />
          <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
            currentStep >= 2 ? 'bg-blue-500 text-white' : 'bg-gray-200 text-gray-600'
          }`}>
            2
          </div>
        </div>
      </CardHeader>
      
      <CardContent>
        {currentStep === 1 ? (
          <form onSubmit={handleResponsavelSubmit} className="space-y-6">
            <div className="space-y-4">
              <div className="flex items-center space-x-2">
                <Checkbox 
                  id="useExisting" 
                  checked={useExistingParent}
                  onCheckedChange={(checked) => {
                    setUseExistingParent(checked as boolean)
                    setSelectedResponsavelId(null)
                    setError("")
                  }}
                  className="cursor-pointer"
                />
                <Label htmlFor="useExisting" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                  Vincular a um responsável já cadastrado
                </Label>
              </div>

              {useExistingParent ? (
                <div className="space-y-2">
                  <Label htmlFor="responsavelExistente">Selecionar responsável *</Label>
                  <Select 
                    value={selectedResponsavelId?.toString() || ""} 
                    onValueChange={(value) => setSelectedResponsavelId(Number(value))}
                    required
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione um responsável" />
                    </SelectTrigger>
                    <SelectContent>
                      {existingParents.map((parent) => (
                        <SelectItem key={parent.id} value={parent.id.toString()}>
                          {parent.nome} - {parent.cpf}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {existingParents.length === 0 && (
                    <p className="text-sm text-muted-foreground">
                      Nenhum responsável encontrado. Desmarque a opção para cadastrar um novo.
                    </p>
                  )}
                </div>
              ) : (
                <>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="nome">Nome completo *</Label>
                      <Input 
                        id="nome" 
                        name="nome" 
                        maxLength={255} 
                        defaultValue={responsavelData.nome}
                        required 
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="cpf">CPF *</Label>
                      <Input 
                        id="cpf" 
                        name="cpf" 
                        maxLength={14}
                        placeholder="000.000.000-00"
                        defaultValue={responsavelData.cpf}
                        required 
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="telefone">Telefone *</Label>
                      <Input
                        id="telefone"
                        name="telefone"
                        maxLength={20}
                        placeholder="(11) 99999-9999"
                        defaultValue={responsavelData.telefone}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="email">Email *</Label>
                      <Input 
                        id="email" 
                        name="email" 
                        type="email" 
                        maxLength={254}
                        defaultValue={responsavelData.email}
                        required 
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="endereco">Endereço completo *</Label>
                    <Input 
                      id="endereco" 
                      name="endereco" 
                      defaultValue={responsavelData.endereco}
                      required 
                    />
                  </div>
                </>
              )}
            </div>

            {error && (
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            <div className="flex gap-4 justify-end">
              <Button type="button" variant="outline" onClick={onCancel} className="cursor-pointer">
                Cancelar
              </Button>
              <Button type="submit" disabled={isLoading} className="cursor-pointer">
                {isLoading ? (useExistingParent ? "Selecionando..." : "Cadastrando...") : "Próximo"}
                <ChevronRight className="ml-2 h-4 w-4" />
              </Button>
            </div>
          </form>
        ) : (
          <form onSubmit={handleAlunoSubmit} className="space-y-6">
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="nome">Nome completo *</Label>
                  <Input 
                    id="nome" 
                    name="nome" 
                    maxLength={255} 
                    value={alunoData.nome}
                    onChange={(e) => setAlunoData({ ...alunoData, nome: e.target.value })}
                    required 
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="matricula">Matrícula</Label>
                  <Input 
                    id="matricula" 
                    name="matricula" 
                    maxLength={50} 
                    value={alunoData.matricula}
                    onChange={(e) => setAlunoData({ ...alunoData, matricula: e.target.value })}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="dataNascimento">Data de nascimento *</Label>
                  <Input 
                    id="dataNascimento" 
                    name="dataNascimento" 
                    type="date" 
                    value={alunoData.dataNascimento}
                    onChange={(e) => setAlunoData({ ...alunoData, dataNascimento: e.target.value })}
                    required 
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="genero">Gênero *</Label>
                  <Select 
                    name="genero" 
                    value={alunoData.genero} 
                    onValueChange={(value: 'masc' | 'fem') => setAlunoData({ ...alunoData, genero: value })} 
                    required
                  >
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
                  <Select 
                    name="turma" 
                    value={alunoData.turma} 
                    onValueChange={(value) => setAlunoData({ ...alunoData, turma: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione a turma" />
                    </SelectTrigger>
                    <SelectContent>
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
                  <Label htmlFor="rendaFamiliarMensal">Renda familiar mensal</Label>
                  <Input 
                    id="rendaFamiliarMensal" 
                    name="rendaFamiliarMensal" 
                    type="number"
                    step="0.01"
                    placeholder="0.00"
                    value={alunoData.rendaFamiliarMensal}
                    onChange={(e) => setAlunoData({ ...alunoData, rendaFamiliarMensal: e.target.value })}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="comprovante">Comprovante de Residência *</Label>
                <Input 
                  id="comprovante" 
                  name="comprovante" 
                  type="file" 
                  accept=".pdf,.jpg,.jpeg,.png"
                  onChange={(e) => setAlunoData({ ...alunoData, comprovanteFile: e.target.files?.[0] || null })}
                  required 
                />
              </div>
            </div>

            {error && (
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            <div className="flex gap-4 justify-between">
              <Button type="button" variant="outline" onClick={handleBackToStep1} className="cursor-pointer">
                <ChevronLeft className="mr-2 h-4 w-4" />
                Voltar
              </Button>
              <div className="flex gap-4">
                <Button type="button" variant="outline" onClick={onCancel} className="cursor-pointer">
                  Cancelar
                </Button>
                <Button type="submit" disabled={isLoading} className="cursor-pointer">
                  {isLoading ? "Cadastrando..." : "Finalizar Cadastro"}
                </Button>
              </div>
            </div>
          </form>
        )}
      </CardContent>
    </Card>
  )
}
