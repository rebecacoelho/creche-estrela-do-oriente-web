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
import { formatCpf, formatPhone, generateRegistration } from "@/utils/formatValues"

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
  // TODO: Implementar campos adicionais (preparados, ainda não enviados)
  hasn_mother?: boolean
  hasn_father?: boolean
  mae_nome?: string
  mae_cpf?: string
  mae_rg?: string
  mae_celular?: string
  mae_outro_contato?: string
  mae_local_trabalho?: string
  pai_nome?: string
  pai_cpf?: string
  pai_rg?: string
  pai_celular?: string
  pai_outro_contato?: string
  pai_local_trabalho?: string
  responsavel_principal_nome?: string
  responsavel_principal_cpf?: string
  responsavel_principal_rg?: string
  responsavel_principal_celular?: string
  responsavel_principal_outro_contato?: string
  responsavel_principal_local_trabalho?: string
  // Endereço detalhado
  endereco_principal?: string
  ponto_referencia?: string
  bairro?: string
  numero?: string
  endereco_cpf?: string
  uf?: string
  telefone_residencial?: string
}

interface AlunoData {
  nome: string
  matricula?: string
  dataNascimento: string
  genero: 'masc' | 'fem'
  turma?: string
  rendaFamiliarMensal?: string
  comprovanteFile?: File | null
  // TODO: Implementar campos adicionais (preparados, ainda não enviados)
  identidade?: string
  corRaca?: string
  temIrmaosNaCreche?: boolean
  gemeos?: boolean
  sus?: string
  unidadeSaude?: string
  problemasSaude?: string
  restricaoAlimentar?: string
  alergia?: string
  mobilidadeReduzida?: 'temporaria' | 'permanente' | ''
  deficienciasMultiplas?: string
  educacaoEspecial?: string
  classificacao?: string[]
  documentos?: {
    certidaoNascimento?: boolean
    numeroMatricula?: string
    municipioNascimento?: string
    cartorioRegistro?: string
    municipioRegistro?: string
    cpf?: string
    rg?: string
    dataEmissao?: string
    orgaoEmissor?: string
  }
  situacaoHabitacionalSanitaria?: {
    casa?: 'propria' | 'cedida' | 'alugada' | ''
    valorAluguel?: string
    numComodos?: string
    piso?: 'cimento' | 'lajota' | 'chao_batido' | ''
    tipoMoradia?: 'tijolo' | 'taipa' | 'madeira' | ''
    cobertura?: 'telha' | 'zinco' | 'palha' | ''
    saneamento?: string
    fossa?: boolean
    cifon?: boolean
    energiaEletrica?: boolean
    aguaEncanada?: boolean
    domicilioExtra?: string[]
  }
  composicaoFamiliar?: Array<{
    nome: string
    idade: string
    parentesco: string
    situacaoEscolar: string
    situacaoEmprego: string
    rendasBrutas: string
  }>
  rendaFamiliarTotal?: string
  rendaPerCapita?: string
  serieCursar?: string
  anoCursar?: string
  autorizadosRetirada?: Array<{ nome: string; parentesco: string; rg: string; telefone: string }>
  dataMatriculaTipo?: 'matricula' | 'rematricula' | 'prematricula' | ''
  statusAluno?: 'ativa' | 'inativa' | 'pre_matricula' | 'aguardando_rematricula' | ''
  dataDesligamento?: string
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
    endereco: "",
    hasn_mother: false,
    hasn_father: false
  })
  
  const [alunoData, setAlunoData] = useState<AlunoData>({
    nome: "",
    matricula: "",
    dataNascimento: "",
    genero: "masc",
    turma: "",
    rendaFamiliarMensal: "",
    comprovanteFile: null,
    dataMatriculaTipo: ''
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
      const errorMessage = err instanceof Error ? err.message : "Erro ao processar responsável. Verifique os dados e tente novamente."
      setError(errorMessage)
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
      dataMatriculaTipo: (formData.get("dataMatriculaTipo") as 'matricula' | 'prematricula' | 'rematricula' | '') || ''
    }

    try {
      if (!data.comprovanteFile || data.comprovanteFile.size === 0) {
        setError("Por favor, selecione o comprovante de residência.")
        setIsLoading(false)
        return
      }

        const created = await alunosService.createWithFile({
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
        // TODO: Mudar persistir localmente o objetivo do cadastro para exibição no dashboard
        try {
          const key = 'enrollmentTypeByStudent'
          const current = JSON.parse(localStorage.getItem(key) || '{}')
          if (created?.id && data.dataMatriculaTipo) {
            current[created.id] = data.dataMatriculaTipo
            localStorage.setItem(key, JSON.stringify(current))
          }
        } catch (_) {
          // ignore storage errors
        }

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
        <div className="mt-3 text-sm text-muted-foreground">
          Aviso: Alguns campos adicionais estão visíveis mas desabilitados. A integração com a API será implementada em breve; os dados desses campos ainda não são enviados.
        </div>
        
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
                        value={responsavelData.cpf}
                        onChange={(e) => setResponsavelData({ ...responsavelData, cpf: formatCpf(e.target.value) })}
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
                        value={responsavelData.telefone}
                        onChange={(e) => setResponsavelData({ ...responsavelData, telefone: formatPhone(e.target.value) })}
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

                  {/* TODO: Implementar campos adicionais: Responsáveis detalhados */}
                  <div className="mt-6 space-y-4">
                    <h4 className="text-sm font-medium text-muted-foreground">Campos adicionais (em breve)</h4>
                    {!responsavelData.hasn_mother && (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="md:col-span-2 text-sm font-medium text-muted-foreground">Dados da Mãe da criança</div>
                        <div className="space-y-2">
                          <Label>Mãe - Nome</Label>
                          <Input disabled placeholder="Em breve" />
                        </div>
                        <div className="space-y-2">
                          <Label>Mãe - CPF</Label>
                          <Input disabled placeholder="Em breve" />
                        </div>
                        <div className="space-y-2">
                          <Label>Mãe - RG</Label>
                          <Input disabled placeholder="Em breve" />
                        </div>
                        <div className="space-y-2">
                          <Label>Mãe - Celular/WhatsApp</Label>
                          <Input disabled placeholder="Em breve" />
                        </div>
                        <div className="space-y-2">
                          <Label>Mãe - Outro contato</Label>
                          <Input disabled placeholder="Em breve" />
                        </div>
                        <div className="space-y-2">
                          <Label>Mãe - Local de trabalho</Label>
                          <Input disabled placeholder="Em breve" />
                        </div>
                      </div>
                    )}
                      <div className="flex items-center space-x-2">
                        <Checkbox 
                          id="hasn_mother"
                          checked={!!responsavelData.hasn_mother}
                          onCheckedChange={(checked) => setResponsavelData({ ...responsavelData, hasn_mother: !!checked })}
                          className="cursor-pointer"
                        />
                        <Label htmlFor="hasn_mother">A criança não possui mãe</Label>
                      </div>
                    {!responsavelData.hasn_father && (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="md:col-span-2 text-sm font-medium text-muted-foreground">Dados do Pai da criança</div>
                        <div className="space-y-2">
                          <Label>Pai - Nome</Label>
                          <Input disabled placeholder="Em breve" />
                        </div>
                        <div className="space-y-2">
                          <Label>Pai - CPF</Label>
                          <Input disabled placeholder="Em breve" />
                        </div>
                        <div className="space-y-2">
                          <Label>Pai - RG</Label>
                          <Input disabled placeholder="Em breve" />
                        </div>
                        <div className="space-y-2">
                          <Label>Pai - Celular/WhatsApp</Label>
                          <Input disabled placeholder="Em breve" />
                        </div>
                        <div className="space-y-2">
                          <Label>Pai - Outro contato</Label>
                          <Input disabled placeholder="Em breve" />
                        </div>
                        <div className="space-y-2">
                          <Label>Pai - Local de trabalho</Label>
                          <Input disabled placeholder="Em breve" />
                        </div>
                      </div>
                    )}
                    <div className="flex items-center gap-6">
                      <div className="flex items-center space-x-2">
                        <Checkbox 
                          id="hasn_father"
                          checked={!!responsavelData.hasn_father}
                          onCheckedChange={(checked) => setResponsavelData({ ...responsavelData, hasn_father: !!checked })}
                          className="cursor-pointer"
                        />
                        <Label htmlFor="hasn_father">A criança não possui pai</Label>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label>Responsável Principal - Nome</Label>
                        <Input disabled placeholder="Em breve" />
                      </div>
                      <div className="space-y-2">
                        <Label>Responsável Principal - CPF</Label>
                        <Input disabled placeholder="Em breve" />
                      </div>
                      <div className="space-y-2">
                        <Label>Responsável Principal - RG</Label>
                        <Input disabled placeholder="Em breve" />
                      </div>
                      <div className="space-y-2">
                        <Label>Responsável Principal - Celular/WhatsApp</Label>
                        <Input disabled placeholder="Em breve" />
                      </div>
                      <div className="space-y-2">
                        <Label>Responsável Principal - Outro contato</Label>
                        <Input disabled placeholder="Em breve" />
                      </div>
                      <div className="space-y-2">
                        <Label>Responsável Principal - Local de trabalho</Label>
                        <Input disabled placeholder="Em breve" />
                      </div>
                    </div>

                    {/* Endereço detalhado (desabilitado) */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label>Endereço principal</Label>
                        <Input disabled placeholder="Em breve" />
                      </div>
                      <div className="space-y-2">
                        <Label>Ponto de referência</Label>
                        <Input disabled placeholder="Em breve" />
                      </div>
                      <div className="space-y-2">
                        <Label>Bairro</Label>
                        <Input disabled placeholder="Em breve" />
                      </div>
                      <div className="space-y-2">
                        <Label>Número</Label>
                        <Input disabled placeholder="Em breve" />
                      </div>
                      <div className="space-y-2">
                        <Label>CPF</Label>
                        <Input disabled placeholder="Em breve" />
                      </div>
                      <div className="space-y-2">
                        <Label>UF</Label>
                        <Input disabled placeholder="Em breve" />
                      </div>
                      <div className="space-y-2 md:col-span-2">
                        <Label>Telefone Residencial</Label>
                        <Input disabled placeholder="Em breve" />
                      </div>
                    </div>
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
                  <div className="flex gap-2">
                    <Button type="button" variant="outline" onClick={() => setAlunoData({ ...alunoData, matricula: generateRegistration(alunoData.turma) })} className="cursor-pointer">
                      Gerar matrícula
                    </Button>
                  </div>
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
                    onValueChange={(value) => {
                      const next = { ...alunoData, turma: value }
                      if (!next.matricula) {
                        next.matricula = generateRegistration(value)
                      }
                      setAlunoData(next)
                    }}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione a turma" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem defaultChecked value="Infantil A">Infantil A</SelectItem>
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

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="dataMatriculaTipo">Objetivo do cadastro *</Label>
                  <Select 
                    name="dataMatriculaTipo" 
                    value={alunoData.dataMatriculaTipo || ''} 
                    onValueChange={(value: 'matricula' | 'prematricula' | 'rematricula') => setAlunoData({ ...alunoData, dataMatriculaTipo: value })}
                    required
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione o objetivo" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="matricula">Matrícula</SelectItem>
                      <SelectItem value="prematricula">Pré-matrícula</SelectItem>
                      <SelectItem value="rematricula">Rematrícula</SelectItem>
                    </SelectContent>
                  </Select>
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

              {/* TODO: Implementar campos adicionais: Aluno */}
              <div className="mt-6 space-y-4">
                <h4 className="text-sm font-medium text-muted-foreground">Campos adicionais do aluno (em breve)</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Identidade (CPF/RG)</Label>
                    <Input disabled placeholder="Em breve" />
                  </div>
                  <div className="space-y-2">
                    <Label>Cor/Raça</Label>
                    <Input disabled placeholder="Em breve" />
                  </div>
                  <div className="space-y-2">
                    <Label>Tem irmãos na creche?</Label>
                    <div className="flex items-center space-x-2">
                      <Checkbox disabled id="tem_irmaos" />
                      <Label htmlFor="tem_irmaos" className="text-sm text-muted-foreground">Em breve</Label>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label>Gêmeos?</Label>
                    <div className="flex items-center space-x-2">
                      <Checkbox disabled id="gemeos" />
                      <Label htmlFor="gemeos" className="text-sm text-muted-foreground">Em breve</Label>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label>Cadastro SUS</Label>
                    <Input disabled placeholder="Em breve" />
                  </div>
                  <div className="space-y-2">
                    <Label>Unidade de Saúde</Label>
                    <Input disabled placeholder="Em breve" />
                  </div>
                  <div className="space-y-2 md:col-span-2">
                    <Label>Problemas de Saúde</Label>
                    <Input disabled placeholder="Em breve" />
                  </div>
                  <div className="space-y-2 md:col-span-2">
                    <Label>Restrição Alimentar (qual?)</Label>
                    <Input disabled placeholder="Em breve" />
                  </div>
                  <div className="space-y-2 md:col-span-2">
                    <Label>Alergia (qual?)</Label>
                    <Input disabled placeholder="Em breve" />
                  </div>
                  <div className="space-y-2">
                    <Label>Mobilidade Reduzida</Label>
                    <Input disabled placeholder="Temporária ou Permanente (em breve)" />
                  </div>
                  <div className="space-y-2">
                    <Label>Possui Deficiências Múltiplas? (qual?)</Label>
                    <Input disabled placeholder="Em breve" />
                  </div>
                  <div className="space-y-2 md:col-span-2">
                    <Label>Público Alvo de Educação Especial? (qual?)</Label>
                    <Input disabled placeholder="Em breve" />
                  </div>
                  <div className="space-y-2 md:col-span-2">
                    <Label>Classificação</Label>
                    <Input disabled placeholder="Lista de itens predefinidos (em breve)" />
                  </div>
                </div>

                <h5 className="text-sm font-medium text-muted-foreground mt-4">Documentos da Criança</h5>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Certidão de Nascimento</Label>
                    <Input disabled placeholder="Em breve" />
                  </div>
                  <div className="space-y-2">
                    <Label>Número da matrícula</Label>
                    <Input disabled placeholder="Em breve" />
                  </div>
                  <div className="space-y-2">
                    <Label>Município de Nascimento</Label>
                    <Input disabled placeholder="Em breve" />
                  </div>
                  <div className="space-y-2">
                    <Label>Cartório de Registro</Label>
                    <Input disabled placeholder="Em breve" />
                  </div>
                  <div className="space-y-2">
                    <Label>Município de Registro</Label>
                    <Input disabled placeholder="Em breve" />
                  </div>
                  <div className="space-y-2">
                    <Label>CPF</Label>
                    <Input disabled placeholder="Em breve" />
                  </div>
                  <div className="space-y-2">
                    <Label>RG</Label>
                    <Input disabled placeholder="Em breve" />
                  </div>
                  <div className="space-y-2">
                    <Label>Data de Emissão</Label>
                    <Input disabled placeholder="Em breve" />
                  </div>
                  <div className="space-y-2">
                    <Label>Órgão Emissor</Label>
                    <Input disabled placeholder="Em breve" />
                  </div>
                </div>

                <h5 className="text-sm font-medium text-muted-foreground mt-4">Situação Habitacional e Sanitária</h5>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Casa (Própria/Cedida/Alugada)</Label>
                    <Input disabled placeholder="Em breve" />
                  </div>
                  <div className="space-y-2">
                    <Label>Valor do Aluguel</Label>
                    <Input disabled placeholder="Em breve" />
                  </div>
                  <div className="space-y-2">
                    <Label>Número de cômodos</Label>
                    <Input disabled placeholder="Em breve" />
                  </div>
                  <div className="space-y-2">
                    <Label>Piso (cimento/lajota/chão batido)</Label>
                    <Input disabled placeholder="Em breve" />
                  </div>
                  <div className="space-y-2">
                    <Label>Tipo de Moradia</Label>
                    <Input disabled placeholder="Tijolo/Taipa/Madeira (em breve)" />
                  </div>
                  <div className="space-y-2">
                    <Label>Cobertura</Label>
                    <Input disabled placeholder="Telha/Zinco/Palha (em breve)" />
                  </div>
                  <div className="space-y-2 md:col-span-2">
                    <Label>Saneamento</Label>
                    <Input disabled placeholder="Em breve" />
                  </div>
                  <div className="space-y-2">
                    <Label>Fossa</Label>
                    <div className="flex items-center space-x-2">
                      <Checkbox disabled id="fossa" />
                      <Label htmlFor="fossa" className="text-sm text-muted-foreground">Em breve</Label>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label>Cifon</Label>
                    <div className="flex items-center space-x-2">
                      <Checkbox disabled id="cifon" />
                      <Label htmlFor="cifon" className="text-sm text-muted-foreground">Em breve</Label>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label>Energia elétrica</Label>
                    <div className="flex items-center space-x-2">
                      <Checkbox disabled id="energia_eletrica" />
                      <Label htmlFor="energia_eletrica" className="text-sm text-muted-foreground">Em breve</Label>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label>Água encanada</Label>
                    <div className="flex items-center space-x-2">
                      <Checkbox disabled id="agua_encanada" />
                      <Label htmlFor="agua_encanada" className="text-sm text-muted-foreground">Em breve</Label>
                    </div>
                  </div>
                  <div className="space-y-2 md:col-span-2">
                    <Label>Domicílio Extra</Label>
                    <Input disabled placeholder="Array de itens (em breve)" />
                  </div>
                </div>

                <h5 className="text-sm font-medium text-muted-foreground mt-4">Composição Familiar</h5>
                <div className="space-y-2">
                  <Input disabled placeholder="Array de pessoas (em breve)" />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                  <div className="space-y-2">
                    <Label>Renda familiar total</Label>
                    <Input disabled placeholder="Em breve" />
                  </div>
                  <div className="space-y-2">
                    <Label>Renda per capita</Label>
                    <Input disabled placeholder="Em breve" />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                  <div className="space-y-2">
                    <Label>Série que irá cursar</Label>
                    <Input disabled placeholder="Em breve" />
                  </div>
                  <div className="space-y-2">
                    <Label>Ano que irá cursar</Label>
                    <Input disabled placeholder="Em breve" />
                  </div>
                </div>

                <h5 className="text-sm font-medium text-muted-foreground mt-4">Pessoas autorizadas a retirar</h5>
                <div className="space-y-2">
                  <Input disabled placeholder="Array de pessoas (em breve)" />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                  <div className="space-y-2">
                    <Label>Data (matrícula/rematrícula/pré-matrícula)</Label>
                    <Input disabled placeholder="Em breve" />
                  </div>
                  <div className="space-y-2">
                    <Label>Status do aluno</Label>
                    <Input disabled placeholder="Ativa/Inativa/Pré/Rematrícula (em breve)" />
                  </div>
                  <div className="space-y-2 md:col-span-2">
                    <Label>Data de desligamento (se houver)</Label>
                    <Input disabled placeholder="Em breve" />
                  </div>
                </div>
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
