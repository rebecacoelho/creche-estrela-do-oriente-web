"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { useAuthenticatedRequest } from "@/lib/auth"
import { 
  responsaveisService, 
  alunosService, 
  setAuthenticatedRequestFn, 
  type ResponsavelResponse,
  type Endereco,
  type DocumentosAluno,
  type SituacaoHabitacional,
  type BensDomicilio,
  type MembroFamiliar,
  type PessoaAutorizada,
  type AlunoFormData
} from "@/lib/students"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Checkbox } from "@/components/ui/checkbox"
import { ChevronLeft, ChevronRight, Plus, Trash2 } from "lucide-react"
import { formatCpf, formatPhone, generateRegistration } from "@/utils/formatValues"

interface StudentFormMultiStepProps {
  onSuccess: () => void
  onCancel: () => void
}

const CLASSIFICACOES_POSSIVEIS = [
  "Altas Habilidades (superdotação)",
  "Cegueira",
  "Deficiência Auditiva (surdez leve ou moderada)",
  "Deficiência Auditiva (surdez severa ou profunda)",
  "Deficiência Auditiva (processamento central)",
  "Deficiência Visual (baixa visão)",
  "Deficiência Física (cadeirante) - permanente",
  "Deficiência Física (paralisia cerebral)",
  "Deficiência Física (paraplegia ou monoplegia)",
  "Deficiência Física (outros)",
  "Disfemia (gagueira)",
  "Deficiência Intelectual",
  "Sensorial Alta (sensibilidade)",
  "Sensorial Baixa (sensibilidade)",
  "Deficiência mental",
  "Espectro Autista Nível I",
  "Espectro Autista Nível II",
  "Espectro Autista Nível III",
  "Estrabismo",
  "Surdo",
  "Síndrome de Down",
  "TEA",
  "TDAH",
  "TOD",
]

export function StudentFormMultiStep({ onSuccess, onCancel }: StudentFormMultiStepProps) {
  const { makeRequest } = useAuthenticatedRequest()
  const [currentStep, setCurrentStep] = useState(1)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")
  
  // Estado para responsável
  const [useExistingParent, setUseExistingParent] = useState(false)
  const [existingParents, setExistingParents] = useState<ResponsavelResponse[]>([])
  const [selectedResponsavelId, setSelectedResponsavelId] = useState<number | null>(null)
  const [createdResponsavel, setCreatedResponsavel] = useState<ResponsavelResponse | null>(null)
  
  // Estado do responsável
  const [responsavelData, setResponsavelData] = useState({
    nome: "",
    cpf: "",
    rg: "",  
    telefone: "",
    email: "",
    endereco: "",
    local_de_trabalho: ""  
  })
  
  const [alunoNome, setAlunoNome] = useState("")
  const [alunoMatricula, setAlunoMatricula] = useState("")
  const [alunoDataNascimento, setAlunoDataNascimento] = useState("")
  const [alunoGenero, setAlunoGenero] = useState<'masc' | 'fem'>('masc')
  const [alunoRaca, setAlunoRaca] = useState<'branca' | 'parda' | 'negra'>('parda')
  const [alunoTurma, setAlunoTurma] = useState("")
  const [alunoTelefone, setAlunoTelefone] = useState("")
  const [alunoSus, setAlunoSus] = useState("")
  const [alunoUnidadeSaude, setAlunoUnidadeSaude] = useState("")
  const [alunoResponsavelRecebeAuxilio, setAlunoResponsavelRecebeAuxilio] = useState("")
  
  const [alunoGemeos, setAlunoGemeos] = useState("")
  const [alunoIrmaoNaCreche, setAlunoIrmaoNaCreche] = useState(false)
  const [alunoProblemasSaude, setAlunoProblemasSaude] = useState(false)
  const [alunoRestricaoAlimentar, setAlunoRestricaoAlimentar] = useState("")
  const [alunoAlergia, setAlunoAlergia] = useState("")
  const [alunoDeficienciasMultiplas, setAlunoDeficienciasMultiplas] = useState("")
  const [alunoMobilidadeReduzida, setAlunoMobilidadeReduzida] = useState<'temp' | 'perm' | ''>("")
  const [alunoCriancaAlvoEducacaoEspecial, setAlunoCriancaAlvoEducacaoEspecial] = useState("")
  const [alunoClassificacoes, setAlunoClassificacoes] = useState<string[]>([])
  const [alunoSerieCursar, setAlunoSerieCursar] = useState("")
  const [alunoAnoCursar, setAlunoAnoCursar] = useState("")
  const [alunoRendaFamiliarMensal, setAlunoRendaFamiliarMensal] = useState("")
  
  const [comprovanteFile, setComprovanteFile] = useState<File | null>(null)
  const [certidaoFile, setCertidaoFile] = useState<File | null>(null)
  
  const [documentos, setDocumentos] = useState<DocumentosAluno>({
    certidao_nascimento_matricula: "",
    municipio_nascimento: "",
    municipio_registro: "",
    cartorio_registro: "",
    cpf: "",
    rg: "",
    data_emissao_rg: "",
    orgao_emissor_rg: ""
  })
  
  const [endereco, setEndereco] = useState<Endereco>({
    logradouro: "",
    numero: "",
    ponto_referencia: "",
    bairro: "",
    municipio: "",
    uf: "",
    cep: ""
  })
  
  const [situacaoHabitacional, setSituacaoHabitacional] = useState<SituacaoHabitacional>({
    tipo_imovel: 'propria',
    valor_aluguel: null,
    numero_comodos: 1,
    piso_cimento: false,
    piso_lajota: false,
    piso_chao_batido: false,
    tipo_moradia_estrutura: [],
    saneamento_fossa: false,
    saneamento_cifon: false,
    energia_eletrica: false,
    agua_encanada: false
  })
  
  const [bensDomicilio, setBensDomicilio] = useState<BensDomicilio>({
    tv: false,
    dvd: false,
    radio: false,
    computador: false,
    notebook: false,
    telefone_fixo: false,
    telefone_celular: false,
    tablet: false,
    internet: false,
    tv_assinatura: false,
    fogao: false,
    geladeira: false,
    freezer: false,
    micro_ondas: false,
    maquina_lavar_roupa: false,
    ar_condicionado: false,
    bicicleta: false,
    moto: false,
    automovel: false
  })
  
  const [composicaoFamiliar, setComposicaoFamiliar] = useState<MembroFamiliar[]>([])
  
  const [autorizadosRetirada, setAutorizadosRetirada] = useState<PessoaAutorizada[]>([])

  useEffect(() => {
    setAuthenticatedRequestFn(makeRequest)
    loadExistingResponsaveis()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const loadExistingResponsaveis = async () => {
    try {
      const parents = await responsaveisService.getAll()
      setExistingParents(parents)
    } catch (error) {
      console.error('Erro ao carregar responsáveis:', error)
    }
  }

  // Handler para o responsável (Passo 1)
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
        // Validação dos campos obrigatórios (rg e local_de_trabalho opcionais temporariamente)
        if (!responsavelData.nome || !responsavelData.cpf || 
            !responsavelData.telefone || !responsavelData.email || !responsavelData.endereco) {
          setError("Por favor, preencha todos os campos obrigatórios do responsável.")
          setIsLoading(false)
          return
        }

        const responsavel = await responsaveisService.create({
          nome: responsavelData.nome,
          cpf: responsavelData.cpf,
          rg: responsavelData.rg || 'Não informado',
          telefone: responsavelData.telefone,
          email: responsavelData.email,
          endereco_texto: responsavelData.endereco,  
          local_trabalho: responsavelData.local_de_trabalho || 'Não informado',
          profissao: 'Não informado',
          data_nascimento: '1900-01-01',  
          renda_mensal: 0
        })
        
        setCreatedResponsavel(responsavel)
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

    if (!comprovanteFile) {
      setError("Por favor, selecione o comprovante de residência.")
      setIsLoading(false)
      return
    }

    try {
      const alunoData: AlunoFormData = {
        nome: alunoNome,
        matricula: alunoMatricula || null,
        data_nascimento: alunoDataNascimento,
        genero: alunoGenero,
        raca: alunoRaca,
        responsaveis: [createdResponsavel.id],
        turma: alunoTurma || null,
        renda_familiar_mensal: alunoRendaFamiliarMensal ? parseFloat(alunoRendaFamiliarMensal) : null,
        ativo: true,
        comprovante_residencia_url: comprovanteFile,
        
        cadastro_nacional_de_saude: alunoSus,
        unidade_de_saude: alunoUnidadeSaude,
        responsavel_recebe_auxilio: alunoResponsavelRecebeAuxilio,
        telefone: alunoTelefone,
        
        gemeos: alunoGemeos || null,
        irmao_na_creche: alunoIrmaoNaCreche,
        problemas_de_saude: alunoProblemasSaude,
        restricao_alimentar: alunoRestricaoAlimentar || null,
        alergia: alunoAlergia || null,
        deficiencias_multiplas: alunoDeficienciasMultiplas || null,
        mobilidade_reduzida: alunoMobilidadeReduzida || null,
        crianca_alvo_educacao_especial: alunoCriancaAlvoEducacaoEspecial || null,
        classificacoes: alunoClassificacoes.length > 0 ? alunoClassificacoes : undefined,
        serie_cursar: alunoSerieCursar || null,
        ano_cursar: alunoAnoCursar || null,
        certidao_nascimento: certidaoFile,
        
        endereco,
        documentosaluno: documentos,
        situacaohabitacional: situacaoHabitacional,
        bensdomicilio: bensDomicilio,
        composicao_familiar: composicaoFamiliar,
        autorizados_retirada: autorizadosRetirada
      }

      await alunosService.createWithFile(alunoData)
      onSuccess()
    } catch (err) {
      console.error("Erro ao cadastrar aluno:", err)
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
  }

  const handleNextStep = (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setCurrentStep(currentStep + 1)
  }

  const handlePrevStep = () => {
    setError("")
    setCurrentStep(currentStep - 1)
  }

  const addMembroFamiliar = () => {
    setComposicaoFamiliar([...composicaoFamiliar, {
      nome: "",
      idade: 0,
      parentesco: "",
      situacao_escolar: "",
      situacao_emprego: "",
      renda_bruta: 0
    }])
  }

  const removeMembroFamiliar = (index: number) => {
    setComposicaoFamiliar(composicaoFamiliar.filter((_, i) => i !== index))
  }

  const updateMembroFamiliar = (index: number, field: keyof MembroFamiliar, value: any) => {
    const updated = [...composicaoFamiliar]
    updated[index] = { ...updated[index], [field]: value }
    setComposicaoFamiliar(updated)
  }

  const addPessoaAutorizada = () => {
    setAutorizadosRetirada([...autorizadosRetirada, {
      nome: "",
      parentesco: "",
      rg: "",
      fone: "",
      e_responsavel_legal: false
    }])
  }

  const removePessoaAutorizada = (index: number) => {
    setAutorizadosRetirada(autorizadosRetirada.filter((_, i) => i !== index))
  }

  const updatePessoaAutorizada = (index: number, field: keyof PessoaAutorizada, value: any) => {
    const updated = [...autorizadosRetirada]
    updated[index] = { ...updated[index], [field]: value }
    setAutorizadosRetirada(updated)
  }

  const toggleClassificacao = (classificacao: string) => {
    if (alunoClassificacoes.includes(classificacao)) {
      setAlunoClassificacoes(alunoClassificacoes.filter(c => c !== classificacao))
    } else {
      setAlunoClassificacoes([...alunoClassificacoes, classificacao])
    }
  }

  const toggleEstruturaMoradia = (estrutura: string) => {
    if (situacaoHabitacional.tipo_moradia_estrutura.includes(estrutura)) {
      setSituacaoHabitacional({
        ...situacaoHabitacional,
        tipo_moradia_estrutura: situacaoHabitacional.tipo_moradia_estrutura.filter(e => e !== estrutura)
      })
    } else {
      setSituacaoHabitacional({
        ...situacaoHabitacional,
        tipo_moradia_estrutura: [...situacaoHabitacional.tipo_moradia_estrutura, estrutura]
      })
    }
  }

  const totalSteps = 8

  return (
    <Card className="w-full max-w-4xl mx-auto">
      <CardHeader>
        <CardTitle>
          {currentStep === 1 && "Cadastrar Responsável"}
          {currentStep === 2 && "Dados Básicos do Aluno"}
          {currentStep === 3 && "Documentos do Aluno"}
          {currentStep === 4 && "Endereço"}
          {currentStep === 5 && "Saúde e Necessidades Especiais"}
          {currentStep === 6 && "Situação Habitacional e Bens"}
          {currentStep === 7 && "Composição Familiar"}
          {currentStep === 8 && "Pessoas Autorizadas"}
        </CardTitle>
        <CardDescription>
          Etapa {currentStep} de {totalSteps}
        </CardDescription>
        
        <div className="flex items-center space-x-2 mt-4">
          {[...Array(totalSteps)].map((_, i) => (
            <div key={i}>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                currentStep >= i + 1 ? 'bg-blue-500 text-white' : 'bg-gray-200 text-gray-600'
              }`}>
                {i + 1}
              </div>
              {i < totalSteps - 1 && (
                <div className={`flex-1 h-1 ${currentStep > i + 1 ? 'bg-blue-500' : 'bg-gray-200'}`} />
              )}
            </div>
          ))}
        </div>
      </CardHeader>
      
      <CardContent>
        {/* PASSO 1: RESPONSÁVEL */}
        {currentStep === 1 && (
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
                <Label htmlFor="useExisting" className="text-sm font-medium">
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
                </div>
              ) : (
                <>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="resp_nome">Nome completo *</Label>
                      <Input 
                        id="resp_nome" 
                        value={responsavelData.nome}
                        onChange={(e) => setResponsavelData({ ...responsavelData, nome: e.target.value })}
                        required 
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="resp_cpf">CPF *</Label>
                      <Input 
                        id="resp_cpf" 
                        value={responsavelData.cpf}
                        onChange={(e) => setResponsavelData({ ...responsavelData, cpf: formatCpf(e.target.value) })}
                        placeholder="000.000.000-00"
                        required 
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="resp_rg">RG</Label>
                      <Input 
                        id="resp_rg" 
                        value={responsavelData.rg}
                        onChange={(e) => setResponsavelData({ ...responsavelData, rg: e.target.value })}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="resp_telefone">Telefone *</Label>
                      <Input
                        id="resp_telefone"
                        value={responsavelData.telefone}
                        onChange={(e) => setResponsavelData({ ...responsavelData, telefone: formatPhone(e.target.value) })}
                        placeholder="(11) 99999-9999"
                        required
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="resp_email">Email *</Label>
                      <Input 
                        id="resp_email" 
                        type="email"
                        value={responsavelData.email}
                        onChange={(e) => setResponsavelData({ ...responsavelData, email: e.target.value })}
                        required 
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="resp_local_trabalho">Local de trabalho</Label>
                      <Input 
                        id="resp_local_trabalho" 
                        value={responsavelData.local_de_trabalho}
                        onChange={(e) => setResponsavelData({ ...responsavelData, local_de_trabalho: e.target.value })}
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="resp_endereco">Endereço completo *</Label>
                    <Input 
                      id="resp_endereco" 
                      value={responsavelData.endereco}
                      onChange={(e) => setResponsavelData({ ...responsavelData, endereco: e.target.value })}
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
        )}

        {/* PASSO 2: DADOS BÁSICOS DO ALUNO */}
        {currentStep === 2 && (
          <form onSubmit={handleNextStep} className="space-y-6">
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="aluno_nome">Nome completo *</Label>
                  <Input 
                    id="aluno_nome" 
                    value={alunoNome}
                    onChange={(e) => setAlunoNome(e.target.value)}
                    required 
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="aluno_matricula">Matrícula</Label>
                  <div className="flex gap-2">
                    <Input 
                      id="aluno_matricula" 
                      value={alunoMatricula}
                      onChange={(e) => setAlunoMatricula(e.target.value)}
                    />
                    <Button 
                      type="button" 
                      variant="outline" 
                      onClick={() => setAlunoMatricula(generateRegistration(alunoTurma))}
                      className="cursor-pointer"
                    >
                      Gerar
                    </Button>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="aluno_data_nascimento">Data de nascimento *</Label>
                  <Input 
                    id="aluno_data_nascimento" 
                    type="date"
                    value={alunoDataNascimento}
                    onChange={(e) => setAlunoDataNascimento(e.target.value)}
                    required 
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="aluno_genero">Gênero *</Label>
                  <Select 
                    value={alunoGenero} 
                    onValueChange={(value: 'masc' | 'fem') => setAlunoGenero(value)} 
                    required
                  >
                    <SelectTrigger>
                      <SelectValue />
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
                  <Label htmlFor="aluno_raca">Cor/Raça *</Label>
                  <Select 
                    value={alunoRaca} 
                    onValueChange={(value: 'branca' | 'parda' | 'negra') => setAlunoRaca(value)} 
                    required
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="branca">Branca</SelectItem>
                      <SelectItem value="parda">Parda</SelectItem>
                      <SelectItem value="negra">Negra</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="aluno_turma">Turma</Label>
                  <Select 
                    value={alunoTurma} 
                    onValueChange={setAlunoTurma}
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
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="aluno_telefone">Telefone *</Label>
                  <Input 
                    id="aluno_telefone" 
                    value={alunoTelefone}
                    onChange={(e) => setAlunoTelefone(formatPhone(e.target.value))}
                    placeholder="(11) 99999-9999"
                    required 
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="aluno_sus">Cadastro SUS *</Label>
                  <Input 
                    id="aluno_sus" 
                    value={alunoSus}
                    onChange={(e) => setAlunoSus(e.target.value)}
                    required 
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="aluno_unidade_saude">Unidade de Saúde *</Label>
                  <Input 
                    id="aluno_unidade_saude" 
                    value={alunoUnidadeSaude}
                    onChange={(e) => setAlunoUnidadeSaude(e.target.value)}
                    required 
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="aluno_auxilio">Responsável recebe auxílio? *</Label>
                  <Input 
                    id="aluno_auxilio" 
                    value={alunoResponsavelRecebeAuxilio}
                    onChange={(e) => setAlunoResponsavelRecebeAuxilio(e.target.value)}
                    placeholder="Sim/Não - Qual?"
                    required 
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="aluno_gemeos">Gêmeos? (Nome do irmão/irmã)</Label>
                  <Input 
                    id="aluno_gemeos" 
                    value={alunoGemeos}
                    onChange={(e) => setAlunoGemeos(e.target.value)}
                  />
                </div>
                <div className="space-y-2 flex items-center pt-8">
                  <Checkbox 
                    id="aluno_irmao_creche"
                    checked={alunoIrmaoNaCreche}
                    onCheckedChange={(checked) => setAlunoIrmaoNaCreche(!!checked)}
                    className="cursor-pointer"
                  />
                  <Label htmlFor="aluno_irmao_creche" className="ml-2">Tem irmãos na creche?</Label>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="aluno_serie">Série que irá cursar</Label>
                  <Input 
                    id="aluno_serie" 
                    value={alunoSerieCursar}
                    onChange={(e) => setAlunoSerieCursar(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="aluno_ano">Ano de início</Label>
                  <Input 
                    id="aluno_ano" 
                    value={alunoAnoCursar}
                    onChange={(e) => setAlunoAnoCursar(e.target.value)}
                    placeholder="Ex: 2025"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="aluno_renda">Renda familiar mensal</Label>
                <Input 
                  id="aluno_renda" 
                  type="number"
                  step="0.01"
                  value={alunoRendaFamiliarMensal}
                  onChange={(e) => setAlunoRendaFamiliarMensal(e.target.value)}
                  placeholder="0.00"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="comprovante">Comprovante de Residência *</Label>
                <Input 
                  id="comprovante" 
                  type="file" 
                  accept=".pdf,.jpg,.jpeg,.png"
                  onChange={(e) => setComprovanteFile(e.target.files?.[0] || null)}
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
                <Button type="submit" className="cursor-pointer">
                  Próximo
                  <ChevronRight className="ml-2 h-4 w-4" />
                </Button>
              </div>
            </div>
          </form>
        )}

        {/* PASSO 3: DOCUMENTOS DO ALUNO */}
        {currentStep === 3 && (
          <form onSubmit={handleNextStep} className="space-y-6">
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Certidão de Nascimento</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="doc_certidao_matricula">Nº Matrícula da Certidão *</Label>
                  <Input 
                    id="doc_certidao_matricula" 
                    value={documentos.certidao_nascimento_matricula}
                    onChange={(e) => setDocumentos({ ...documentos, certidao_nascimento_matricula: e.target.value })}
                    required 
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="doc_municipio_nascimento">Município de Nascimento *</Label>
                  <Input 
                    id="doc_municipio_nascimento" 
                    value={documentos.municipio_nascimento}
                    onChange={(e) => setDocumentos({ ...documentos, municipio_nascimento: e.target.value })}
                    required 
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="doc_cartorio">Cartório de Registro *</Label>
                  <Input 
                    id="doc_cartorio" 
                    value={documentos.cartorio_registro}
                    onChange={(e) => setDocumentos({ ...documentos, cartorio_registro: e.target.value })}
                    required 
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="doc_municipio_registro">Município de Registro *</Label>
                  <Input 
                    id="doc_municipio_registro" 
                    value={documentos.municipio_registro}
                    onChange={(e) => setDocumentos({ ...documentos, municipio_registro: e.target.value })}
                    required 
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="certidao_file">Arquivo da Certidão (PDF/Imagem)</Label>
                <Input 
                  id="certidao_file" 
                  type="file" 
                  accept=".pdf,.jpg,.jpeg,.png"
                  onChange={(e) => setCertidaoFile(e.target.files?.[0] || null)}
                />
              </div>

              <h3 className="text-lg font-semibold mt-6">Documentos de Identidade</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="doc_cpf">CPF *</Label>
                  <Input 
                    id="doc_cpf" 
                    value={documentos.cpf}
                    onChange={(e) => setDocumentos({ ...documentos, cpf: formatCpf(e.target.value) })}
                    placeholder="000.000.000-00"
                    required 
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="doc_rg">RG *</Label>
                  <Input 
                    id="doc_rg" 
                    value={documentos.rg}
                    onChange={(e) => setDocumentos({ ...documentos, rg: e.target.value })}
                    required 
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="doc_data_emissao">Data de Emissão do RG *</Label>
                  <Input 
                    id="doc_data_emissao" 
                    type="date"
                    value={documentos.data_emissao_rg}
                    onChange={(e) => setDocumentos({ ...documentos, data_emissao_rg: e.target.value })}
                    required 
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="doc_orgao_emissor">Órgão Emissor do RG *</Label>
                  <Input 
                    id="doc_orgao_emissor" 
                    value={documentos.orgao_emissor_rg}
                    onChange={(e) => setDocumentos({ ...documentos, orgao_emissor_rg: e.target.value })}
                    placeholder="Ex: SSP/MA"
                    required 
                  />
                </div>
              </div>
            </div>

            {error && (
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            <div className="flex gap-4 justify-between">
              <Button type="button" variant="outline" onClick={handlePrevStep} className="cursor-pointer">
                <ChevronLeft className="mr-2 h-4 w-4" />
                Voltar
              </Button>
              <div className="flex gap-4">
                <Button type="button" variant="outline" onClick={onCancel} className="cursor-pointer">
                  Cancelar
                </Button>
                <Button type="submit" className="cursor-pointer">
                  Próximo
                  <ChevronRight className="ml-2 h-4 w-4" />
                </Button>
              </div>
            </div>
          </form>
        )}

        {/* PASSO 4: ENDEREÇO */}
        {currentStep === 4 && (
          <form onSubmit={handleNextStep} className="space-y-6">
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2 md:col-span-2">
                  <Label htmlFor="end_logradouro">Logradouro *</Label>
                  <Input 
                    id="end_logradouro" 
                    value={endereco.logradouro}
                    onChange={(e) => setEndereco({ ...endereco, logradouro: e.target.value })}
                    placeholder="Rua, Avenida, etc."
                    required 
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="end_numero">Número *</Label>
                  <Input 
                    id="end_numero" 
                    value={endereco.numero}
                    onChange={(e) => setEndereco({ ...endereco, numero: e.target.value })}
                    required 
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="end_bairro">Bairro *</Label>
                  <Input 
                    id="end_bairro" 
                    value={endereco.bairro}
                    onChange={(e) => setEndereco({ ...endereco, bairro: e.target.value })}
                    required 
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="end_ponto_ref">Ponto de Referência</Label>
                  <Input 
                    id="end_ponto_ref" 
                    value={endereco.ponto_referencia}
                    onChange={(e) => setEndereco({ ...endereco, ponto_referencia: e.target.value })}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="end_municipio">Município *</Label>
                  <Input 
                    id="end_municipio" 
                    value={endereco.municipio}
                    onChange={(e) => setEndereco({ ...endereco, municipio: e.target.value })}
                    required 
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="end_uf">UF *</Label>
                  <Input 
                    id="end_uf" 
                    value={endereco.uf}
                    onChange={(e) => setEndereco({ ...endereco, uf: e.target.value.toUpperCase() })}
                    maxLength={2}
                    placeholder="Ex: MA"
                    required 
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="end_cep">CEP *</Label>
                  <Input 
                    id="end_cep" 
                    value={endereco.cep}
                    onChange={(e) => setEndereco({ ...endereco, cep: e.target.value })}
                    placeholder="00000-000"
                    required 
                  />
                </div>
              </div>
            </div>

            {error && (
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            <div className="flex gap-4 justify-between">
              <Button type="button" variant="outline" onClick={handlePrevStep} className="cursor-pointer">
                <ChevronLeft className="mr-2 h-4 w-4" />
                Voltar
              </Button>
              <div className="flex gap-4">
                <Button type="button" variant="outline" onClick={onCancel} className="cursor-pointer">
                  Cancelar
                </Button>
                <Button type="submit" className="cursor-pointer">
                  Próximo
                  <ChevronRight className="ml-2 h-4 w-4" />
                </Button>
              </div>
            </div>
          </form>
        )}

        {/* PASSO 5: SAÚDE E NECESSIDADES ESPECIAIS */}
        {currentStep === 5 && (
          <form onSubmit={handleNextStep} className="space-y-6">
            <div className="space-y-4">
              <div className="space-y-2 flex items-center">
                <Checkbox 
                  id="aluno_problemas_saude"
                  checked={alunoProblemasSaude}
                  onCheckedChange={(checked) => setAlunoProblemasSaude(!!checked)}
                  className="cursor-pointer"
                />
                <Label htmlFor="aluno_problemas_saude" className="ml-2">Possui problemas de saúde?</Label>
              </div>

              <div className="space-y-2">
                <Label htmlFor="aluno_restricao">Restrição alimentar</Label>
                <Input 
                  id="aluno_restricao" 
                  value={alunoRestricaoAlimentar}
                  onChange={(e) => setAlunoRestricaoAlimentar(e.target.value)}
                  placeholder="Descreva se houver"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="aluno_alergia">Alergias</Label>
                <Input 
                  id="aluno_alergia" 
                  value={alunoAlergia}
                  onChange={(e) => setAlunoAlergia(e.target.value)}
                  placeholder="Descreva se houver"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="aluno_deficiencias">Deficiências múltiplas</Label>
                <Input 
                  id="aluno_deficiencias" 
                  value={alunoDeficienciasMultiplas}
                  onChange={(e) => setAlunoDeficienciasMultiplas(e.target.value)}
                  placeholder="Descreva se houver"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="aluno_mobilidade">Mobilidade reduzida</Label>
                <div className="flex items-center gap-4">
                  <Select 
                    value={alunoMobilidadeReduzida || undefined} 
                    onValueChange={(value: 'temp' | 'perm') => setAlunoMobilidadeReduzida(value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione se houver" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="temp">Temporária</SelectItem>
                      <SelectItem value="perm">Permanente</SelectItem>
                    </SelectContent>
                  </Select>
                  {alunoMobilidadeReduzida && (
                    <Button 
                      type="button" 
                      variant="outline" 
                      size="sm"
                      onClick={() => setAlunoMobilidadeReduzida('')}
                      className="cursor-pointer"
                    >
                      Limpar
                    </Button>
                  )}
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="aluno_educacao_especial">Público alvo de educação especial</Label>
                <Input 
                  id="aluno_educacao_especial" 
                  value={alunoCriancaAlvoEducacaoEspecial}
                  onChange={(e) => setAlunoCriancaAlvoEducacaoEspecial(e.target.value)}
                  placeholder="Descreva se houver"
                />
              </div>

              <div className="space-y-2">
                <Label>Classificações especiais</Label>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2 max-h-64 overflow-y-auto border p-3 rounded">
                  {CLASSIFICACOES_POSSIVEIS.map((classificacao) => (
                    <div key={classificacao} className="flex items-center space-x-2">
                      <Checkbox 
                        id={`classif_${classificacao}`}
                        checked={alunoClassificacoes.includes(classificacao)}
                        onCheckedChange={() => toggleClassificacao(classificacao)}
                        className="cursor-pointer"
                      />
                      <Label htmlFor={`classif_${classificacao}`} className="text-sm">
                        {classificacao}
                      </Label>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {error && (
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            <div className="flex gap-4 justify-between">
              <Button type="button" variant="outline" onClick={handlePrevStep} className="cursor-pointer">
                <ChevronLeft className="mr-2 h-4 w-4" />
                Voltar
              </Button>
              <div className="flex gap-4">
                <Button type="button" variant="outline" onClick={onCancel} className="cursor-pointer">
                  Cancelar
                </Button>
                <Button type="submit" className="cursor-pointer">
                  Próximo
                  <ChevronRight className="ml-2 h-4 w-4" />
                </Button>
              </div>
            </div>
          </form>
        )}

        {/* PASSO 6: SITUAÇÃO HABITACIONAL E BENS */}
        {currentStep === 6 && (
          <form onSubmit={handleNextStep} className="space-y-6">
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Situação Habitacional</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="hab_tipo_imovel">Tipo de imóvel *</Label>
                  <Select 
                    value={situacaoHabitacional.tipo_imovel} 
                    onValueChange={(value: 'propria' | 'cedida' | 'alugada') => 
                      setSituacaoHabitacional({ ...situacaoHabitacional, tipo_imovel: value })
                    }
                    required
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="propria">Própria</SelectItem>
                      <SelectItem value="cedida">Cedida</SelectItem>
                      <SelectItem value="alugada">Alugada</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                {situacaoHabitacional.tipo_imovel === 'alugada' && (
                  <div className="space-y-2">
                    <Label htmlFor="hab_valor_aluguel">Valor do aluguel</Label>
                    <Input 
                      id="hab_valor_aluguel" 
                      type="number"
                      step="0.01"
                      value={situacaoHabitacional.valor_aluguel || ''}
                      onChange={(e) => setSituacaoHabitacional({ 
                        ...situacaoHabitacional, 
                        valor_aluguel: e.target.value ? parseFloat(e.target.value) : null 
                      })}
                    />
                  </div>
                )}
                
                <div className="space-y-2">
                  <Label htmlFor="hab_num_comodos">Nº de cômodos *</Label>
                  <Input 
                    id="hab_num_comodos" 
                    type="number"
                    min="1"
                    value={situacaoHabitacional.numero_comodos}
                    onChange={(e) => setSituacaoHabitacional({ 
                      ...situacaoHabitacional, 
                      numero_comodos: parseInt(e.target.value) || 1 
                    })}
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label>Tipo de piso</Label>
                <div className="flex gap-4">
                  <div className="flex items-center space-x-2">
                    <Checkbox 
                      id="piso_cimento"
                      checked={situacaoHabitacional.piso_cimento}
                      onCheckedChange={(checked) => setSituacaoHabitacional({ 
                        ...situacaoHabitacional, 
                        piso_cimento: !!checked 
                      })}
                      className="cursor-pointer"
                    />
                    <Label htmlFor="piso_cimento">Cimento</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox 
                      id="piso_lajota"
                      checked={situacaoHabitacional.piso_lajota}
                      onCheckedChange={(checked) => setSituacaoHabitacional({ 
                        ...situacaoHabitacional, 
                        piso_lajota: !!checked 
                      })}
                      className="cursor-pointer"
                    />
                    <Label htmlFor="piso_lajota">Lajota</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox 
                      id="piso_chao_batido"
                      checked={situacaoHabitacional.piso_chao_batido}
                      onCheckedChange={(checked) => setSituacaoHabitacional({ 
                        ...situacaoHabitacional, 
                        piso_chao_batido: !!checked 
                      })}
                      className="cursor-pointer"
                    />
                    <Label htmlFor="piso_chao_batido">Chão batido</Label>
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <Label>Estrutura da moradia (paredes/cobertura)</Label>
                <div className="flex gap-4 flex-wrap">
                  {['tijolo', 'taipa', 'madeira', 'telha', 'zinco', 'palha'].map((tipo) => (
                    <div key={tipo} className="flex items-center space-x-2">
                      <Checkbox 
                        id={`estrutura_${tipo}`}
                        checked={situacaoHabitacional.tipo_moradia_estrutura.includes(tipo)}
                        onCheckedChange={() => toggleEstruturaMoradia(tipo)}
                        className="cursor-pointer"
                      />
                      <Label htmlFor={`estrutura_${tipo}`} className="capitalize">{tipo}</Label>
                    </div>
                  ))}
                </div>
              </div>

              <div className="space-y-2">
                <Label>Saneamento e infraestrutura</Label>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                  <div className="flex items-center space-x-2">
                    <Checkbox 
                      id="hab_fossa"
                      checked={situacaoHabitacional.saneamento_fossa}
                      onCheckedChange={(checked) => setSituacaoHabitacional({ 
                        ...situacaoHabitacional, 
                        saneamento_fossa: !!checked 
                      })}
                      className="cursor-pointer"
                    />
                    <Label htmlFor="hab_fossa">Fossa</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox 
                      id="hab_cifon"
                      checked={situacaoHabitacional.saneamento_cifon}
                      onCheckedChange={(checked) => setSituacaoHabitacional({ 
                        ...situacaoHabitacional, 
                        saneamento_cifon: !!checked 
                      })}
                      className="cursor-pointer"
                    />
                    <Label htmlFor="hab_cifon">Cifon</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox 
                      id="hab_energia"
                      checked={situacaoHabitacional.energia_eletrica}
                      onCheckedChange={(checked) => setSituacaoHabitacional({ 
                        ...situacaoHabitacional, 
                        energia_eletrica: !!checked 
                      })}
                      className="cursor-pointer"
                    />
                    <Label htmlFor="hab_energia">Energia elétrica</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox 
                      id="hab_agua"
                      checked={situacaoHabitacional.agua_encanada}
                      onCheckedChange={(checked) => setSituacaoHabitacional({ 
                        ...situacaoHabitacional, 
                        agua_encanada: !!checked 
                      })}
                      className="cursor-pointer"
                    />
                    <Label htmlFor="hab_agua">Água encanada</Label>
                  </div>
                </div>
              </div>

              <h3 className="text-lg font-semibold mt-6">Bens no Domicílio</h3>
              
              <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                {Object.keys(bensDomicilio).map((bem) => (
                  <div key={bem} className="flex items-center space-x-2">
                    <Checkbox 
                      id={`bem_${bem}`}
                      checked={bensDomicilio[bem as keyof BensDomicilio]}
                      onCheckedChange={(checked) => setBensDomicilio({ 
                        ...bensDomicilio, 
                        [bem]: !!checked 
                      })}
                      className="cursor-pointer"
                    />
                    <Label htmlFor={`bem_${bem}`} className="text-sm capitalize">
                      {bem.replace(/_/g, ' ')}
                    </Label>
                  </div>
                ))}
              </div>
            </div>

            {error && (
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            <div className="flex gap-4 justify-between">
              <Button type="button" variant="outline" onClick={handlePrevStep} className="cursor-pointer">
                <ChevronLeft className="mr-2 h-4 w-4" />
                Voltar
              </Button>
              <div className="flex gap-4">
                <Button type="button" variant="outline" onClick={onCancel} className="cursor-pointer">
                  Cancelar
                </Button>
                <Button type="submit" className="cursor-pointer">
                  Próximo
                  <ChevronRight className="ml-2 h-4 w-4" />
                </Button>
              </div>
            </div>
          </form>
        )}

        {/* PASSO 7: COMPOSIÇÃO FAMILIAR */}
        {currentStep === 7 && (
          <form onSubmit={handleNextStep} className="space-y-6">
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-semibold">Composição Familiar</h3>
                <Button type="button" variant="outline" onClick={addMembroFamiliar} className="cursor-pointer">
                  <Plus className="mr-2 h-4 w-4" />
                  Adicionar membro
                </Button>
              </div>

              {composicaoFamiliar.length === 0 ? (
                <p className="text-sm text-muted-foreground">
                  Nenhum membro familiar adicionado. Clique em "Adicionar membro" para incluir.
                </p>
              ) : (
                <div className="space-y-4">
                  {composicaoFamiliar.map((membro, index) => (
                    <Card key={index}>
                      <CardContent className="pt-6">
                        <div className="space-y-4">
                          <div className="flex justify-between items-center">
                            <h4 className="font-medium">Membro {index + 1}</h4>
                            <Button 
                              type="button" 
                              variant="destructive" 
                              size="sm"
                              onClick={() => removeMembroFamiliar(index)}
                              className="cursor-pointer"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                          
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-2">
                              <Label>Nome completo</Label>
                              <Input 
                                value={membro.nome}
                                onChange={(e) => updateMembroFamiliar(index, 'nome', e.target.value)}
                                required
                              />
                            </div>
                            <div className="space-y-2">
                              <Label>Idade</Label>
                              <Input 
                                type="number"
                                min="0"
                                value={membro.idade}
                                onChange={(e) => updateMembroFamiliar(index, 'idade', parseInt(e.target.value) || 0)}
                                required
                              />
                            </div>
                          </div>

                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-2">
                              <Label>Parentesco</Label>
                              <Input 
                                value={membro.parentesco}
                                onChange={(e) => updateMembroFamiliar(index, 'parentesco', e.target.value)}
                                placeholder="Ex: Mãe, Pai, Irmão"
                                required
                              />
                            </div>
                            <div className="space-y-2">
                              <Label>Situação escolar</Label>
                              <Input 
                                value={membro.situacao_escolar}
                                onChange={(e) => updateMembroFamiliar(index, 'situacao_escolar', e.target.value)}
                              />
                            </div>
                          </div>

                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-2">
                              <Label>Situação de emprego</Label>
                              <Input 
                                value={membro.situacao_emprego}
                                onChange={(e) => updateMembroFamiliar(index, 'situacao_emprego', e.target.value)}
                              />
                            </div>
                            <div className="space-y-2">
                              <Label>Renda bruta (R$)</Label>
                              <Input 
                                type="number"
                                step="0.01"
                                min="0"
                                value={membro.renda_bruta}
                                onChange={(e) => updateMembroFamiliar(index, 'renda_bruta', parseFloat(e.target.value) || 0)}
                                required
                              />
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </div>

            {error && (
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            <div className="flex gap-4 justify-between">
              <Button type="button" variant="outline" onClick={handlePrevStep} className="cursor-pointer">
                <ChevronLeft className="mr-2 h-4 w-4" />
                Voltar
              </Button>
              <div className="flex gap-4">
                <Button type="button" variant="outline" onClick={onCancel} className="cursor-pointer">
                  Cancelar
                </Button>
                <Button type="submit" className="cursor-pointer">
                  Próximo
                  <ChevronRight className="ml-2 h-4 w-4" />
                </Button>
              </div>
            </div>
          </form>
        )}

        {/* PASSO 8: PESSOAS AUTORIZADAS */}
        {currentStep === 8 && (
          <form onSubmit={handleAlunoSubmit} className="space-y-6">
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-semibold">Pessoas Autorizadas para Retirada</h3>
                <Button type="button" variant="outline" onClick={addPessoaAutorizada} className="cursor-pointer">
                  <Plus className="mr-2 h-4 w-4" />
                  Adicionar pessoa
                </Button>
              </div>

              {autorizadosRetirada.length === 0 ? (
                <p className="text-sm text-muted-foreground">
                  Nenhuma pessoa autorizada adicionada. Clique em "Adicionar pessoa" para incluir.
                </p>
              ) : (
                <div className="space-y-4">
                  {autorizadosRetirada.map((pessoa, index) => (
                    <Card key={index}>
                      <CardContent className="pt-6">
                        <div className="space-y-4">
                          <div className="flex justify-between items-center">
                            <h4 className="font-medium">Pessoa autorizada {index + 1}</h4>
                            <Button 
                              type="button" 
                              variant="destructive" 
                              size="sm"
                              onClick={() => removePessoaAutorizada(index)}
                              className="cursor-pointer"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                          
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-2">
                              <Label>Nome completo</Label>
                              <Input 
                                value={pessoa.nome}
                                onChange={(e) => updatePessoaAutorizada(index, 'nome', e.target.value)}
                                required
                              />
                            </div>
                            <div className="space-y-2">
                              <Label>Parentesco</Label>
                              <Input 
                                value={pessoa.parentesco}
                                onChange={(e) => updatePessoaAutorizada(index, 'parentesco', e.target.value)}
                                placeholder="Ex: Tio, Avó"
                                required
                              />
                            </div>
                          </div>

                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-2">
                              <Label>RG</Label>
                              <Input 
                                value={pessoa.rg}
                                onChange={(e) => updatePessoaAutorizada(index, 'rg', e.target.value)}
                                required
                              />
                            </div>
                            <div className="space-y-2">
                              <Label>Telefone</Label>
                              <Input 
                                value={pessoa.fone}
                                onChange={(e) => updatePessoaAutorizada(index, 'fone', formatPhone(e.target.value))}
                                placeholder="(11) 99999-9999"
                                required
                              />
                            </div>
                          </div>

                          <div className="flex items-center space-x-2">
                            <Checkbox 
                              id={`responsavel_legal_${index}`}
                              checked={pessoa.e_responsavel_legal}
                              onCheckedChange={(checked) => updatePessoaAutorizada(index, 'e_responsavel_legal', !!checked)}
                              className="cursor-pointer"
                            />
                            <Label htmlFor={`responsavel_legal_${index}`}>
                              É responsável legal cadastrado
                            </Label>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </div>

            {error && (
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            <div className="flex gap-4 justify-between">
              <Button type="button" variant="outline" onClick={handlePrevStep} className="cursor-pointer">
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
