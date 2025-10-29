"use client"

import { useEffect, useState } from "react"
import { type AlunoResponse, type ResponsavelResponse, studentsService, responsaveisService } from "@/lib/students"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { Calendar, User, Users, Mail, Phone, MapPin, CreditCard, FileText, School, DollarSign, Heart, Home, Package, UserCheck, AlertCircle, BookOpen } from "lucide-react"

interface StudentDetailsDialogProps {
  studentId: string | null
  open: boolean
  onOpenChange: (open: boolean) => void
  onUpdate?: () => void
}

export function StudentDetailsDialog({ studentId, open, onOpenChange, onUpdate }: StudentDetailsDialogProps) {
  const [student, setStudent] = useState<AlunoResponse | null>(null)
  const [responsables, setResponsables] = useState<ResponsavelResponse[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false)

  useEffect(() => {
    if (studentId && open) {
      loadStudentDetails()
    }
  }, [studentId, open])

  const loadStudentDetails = async () => {
    if (!studentId) return

    setIsLoading(true)
    try {
      const studentData = await studentsService.getById(studentId)
      if (studentData) {
        setStudent(studentData)
        
        const allResponsables = await responsaveisService.getAll()
        const studentResponsables = allResponsables.filter(r => 
          studentData.responsaveis.includes(r.id)
        )
        setResponsables(studentResponsables)
      }
    } catch (error) {
      console.error("Erro ao carregar detalhes do aluno:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleStatusChange = async (newStatus: boolean) => {
    if (!student || !studentId) return

    setIsUpdatingStatus(true)
    try {
      const updatedStudent = await studentsService.update(studentId, {
        ativo: newStatus
      })
      
      if (updatedStudent) {
        setStudent(updatedStudent)
        if (onUpdate) {
          onUpdate()
        }
      }
    } catch (error) {
      console.error("Erro ao atualizar status do aluno:", error)
    } finally {
      setIsUpdatingStatus(false)
    }
  }

  if (!student) {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>Detalhes do Aluno</DialogTitle>
          </DialogHeader>
          {isLoading ? (
            <div className="flex justify-center items-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              Nenhum aluno selecionado
            </div>
          )}
        </DialogContent>
      </Dialog>
    )
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('pt-BR')
  }

  const calculateAge = (birthDate: string) => {
    const today = new Date()
    const birth = new Date(birthDate)
    let age = today.getFullYear() - birth.getFullYear()
    const monthDiff = today.getMonth() - birth.getMonth()
    
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
      age--
    }
    
    return age
  }

  const getStatusMatriculaLabel = (ativo: boolean) => {
    return ativo ? 'Matriculado' : 'Pré-Matrícula'
  }

  const getStatusMatriculaVariant = (ativo: boolean): "default" | "secondary" | "outline" => {
    return ativo ? 'default' : 'outline'
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl">Detalhes do Aluno</DialogTitle>
          <DialogDescription>
            Visualize todas as informações do aluno e seus responsáveis
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 mt-4">
          {/* Informações Pessoais */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5" />
                Informações Pessoais
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Nome Completo</p>
                  <p className="text-lg font-semibold">{student.nome}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Matrícula</p>
                  <p className="text-lg">{student.matricula || "Não informada"}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground flex items-center gap-1">
                    <Calendar className="h-4 w-4" />
                    Data de Nascimento
                  </p>
                  <p className="text-lg">{formatDate(student.data_nascimento)}</p>
                  <p className="text-sm text-muted-foreground">
                    {calculateAge(student.data_nascimento)} anos
                  </p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Gênero</p>
                  <p className="text-lg">{student.genero === 'masc' ? 'Masculino' : 'Feminino'}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Raça/Cor</p>
                  <p className="text-lg capitalize">{student.raca}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground flex items-center gap-1">
                    <School className="h-4 w-4" />
                    Turma
                  </p>
                  <p className="text-lg">{student.turma || "Não atribuída"}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground mb-2">Status de Matrícula</p>
                  <div className="space-y-2">
                    <Badge variant={getStatusMatriculaVariant(student.ativo)}>
                      {getStatusMatriculaLabel(student.ativo)}
                    </Badge>
                    <div className="flex items-center space-x-2 mt-2">
                      <Switch
                        id="status-matricula"
                        checked={student.ativo}
                        onCheckedChange={handleStatusChange}
                        disabled={isUpdatingStatus}
                      />
                      <Label htmlFor="status-matricula" className="text-sm">
                        {student.ativo ? "Matriculado" : "Mudar para Matriculado"}
                      </Label>
                    </div>
                  </div>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground flex items-center gap-1">
                    <Phone className="h-4 w-4" />
                    Telefone
                  </p>
                  <p className="text-lg">{student.telefone || "Não informado"}</p>
                </div>
                {student.serie_cursar && (
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Série a Cursar</p>
                    <p className="text-lg">{student.serie_cursar}</p>
                  </div>
                )}
                {student.ano_cursar && (
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Ano de Início</p>
                    <p className="text-lg">{student.ano_cursar}</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Informações de Saúde */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Heart className="h-5 w-5" />
                Informações de Saúde
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">CNS</p>
                  <p className="text-lg">{student.cadastro_nacional_de_saude}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Unidade de Saúde</p>
                  <p className="text-lg">{student.unidade_de_saude}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Problemas de Saúde</p>
                  <Badge variant={student.problemas_de_saude ? "destructive" : "secondary"}>
                    {student.problemas_de_saude ? "Sim" : "Não"}
                  </Badge>
                </div>
                {student.restricao_alimentar && (
                  <div className="md:col-span-2">
                    <p className="text-sm font-medium text-muted-foreground">Restrição Alimentar</p>
                    <p className="text-lg">{student.restricao_alimentar}</p>
                  </div>
                )}
                {student.alergia && (
                  <div className="md:col-span-2">
                    <p className="text-sm font-medium text-muted-foreground">Alergias</p>
                    <p className="text-lg">{student.alergia}</p>
                  </div>
                )}
                {student.mobilidade_reduzida && (
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Mobilidade Reduzida</p>
                    <p className="text-lg">{student.mobilidade_reduzida === 'temp' ? 'Temporária' : 'Permanente'}</p>
                  </div>
                )}
                {student.deficiencias_multiplas && (
                  <div className="md:col-span-2">
                    <p className="text-sm font-medium text-muted-foreground">Deficiências Múltiplas</p>
                    <p className="text-lg">{student.deficiencias_multiplas}</p>
                  </div>
                )}
                {student.classificacoes && student.classificacoes.length > 0 && (
                  <div className="md:col-span-2">
                    <p className="text-sm font-medium text-muted-foreground mb-2">Classificações Especiais</p>
                    <div className="flex flex-wrap gap-2">
                      {student.classificacoes.map((classificacao, index) => (
                        <Badge key={index} variant="outline">{classificacao}</Badge>
                      ))}
                    </div>
                  </div>
                )}
                {student.crianca_alvo_educacao_especial && (
                  <div className="md:col-span-2">
                    <p className="text-sm font-medium text-muted-foreground">Educação Especial</p>
                    <p className="text-lg">{student.crianca_alvo_educacao_especial}</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Documentos */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Documentos
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {student.documentosaluno && (
                  <>
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">CPF</p>
                      <p className="text-lg">{student.documentosaluno.cpf}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">RG</p>
                      <p className="text-lg">{student.documentosaluno.rg}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Data Emissão RG</p>
                      <p className="text-lg">{formatDate(student.documentosaluno.data_emissao_rg)}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Órgão Emissor RG</p>
                      <p className="text-lg">{student.documentosaluno.orgao_emissor_rg}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Certidão de Nascimento</p>
                      <p className="text-lg">{student.documentosaluno.certidao_nascimento_matricula}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Município de Nascimento</p>
                      <p className="text-lg">{student.documentosaluno.municipio_nascimento}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Município de Registro</p>
                      <p className="text-lg">{student.documentosaluno.municipio_registro}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Cartório de Registro</p>
                      <p className="text-lg">{student.documentosaluno.cartorio_registro}</p>
                    </div>
                  </>
                )}
                {student.certidao_nascimento && (
                  <div className="md:col-span-2">
                    <p className="text-sm font-medium text-muted-foreground">Arquivo Certidão</p>
                    <a 
                      href={student.certidao_nascimento} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-blue-500 underline hover:text-blue-700 flex items-center gap-2 mt-1"
                    >
                      <FileText className="h-4 w-4" />
                      Ver certidão de nascimento
                    </a>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Endereço */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MapPin className="h-5 w-5" />
                Endereço
              </CardTitle>
            </CardHeader>
            <CardContent>
              {student.endereco && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="md:col-span-2">
                    <p className="text-sm font-medium text-muted-foreground">Logradouro</p>
                    <p className="text-lg">{student.endereco.logradouro}, {student.endereco.numero}</p>
                  </div>
                  {student.endereco.ponto_referencia && (
                    <div className="md:col-span-2">
                      <p className="text-sm font-medium text-muted-foreground">Ponto de Referência</p>
                      <p className="text-lg">{student.endereco.ponto_referencia}</p>
                    </div>
                  )}
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Bairro</p>
                    <p className="text-lg">{student.endereco.bairro}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">CEP</p>
                    <p className="text-lg">{student.endereco.cep}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Município</p>
                    <p className="text-lg">{student.endereco.municipio}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">UF</p>
                    <p className="text-lg">{student.endereco.uf}</p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Informações Financeiras */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <DollarSign className="h-5 w-5" />
                Informações Financeiras e Habitacionais
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Renda Familiar Mensal</p>
                    <p className="text-lg">
                      {student.renda_familiar_mensal 
                        ? `R$ ${Number(student.renda_familiar_mensal).toFixed(2)}` 
                        : "Não informada"}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Renda Familiar Total</p>
                    <p className="text-lg font-semibold">R$ {Number(student.renda_familiar_total).toFixed(2)}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Renda Per Capita</p>
                    <p className="text-lg">R$ {Number(student.renda_per_capta).toFixed(2)}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Recebe Auxílio</p>
                    <p className="text-lg">{student.responsavel_recebe_auxilio || "Não informado"}</p>
                  </div>
                </div>
                {student.comprovante_residencia_url && (
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Comprovante de Residência</p>
                    <a 
                      href={student.comprovante_residencia_url?.toString() || ""} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-blue-500 underline hover:text-blue-700 flex items-center gap-2 mt-1"
                    >
                      <FileText className="h-4 w-4" />
                      Ver comprovante
                    </a>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Situação Habitacional */}
          {student.situacaohabitacional && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Home className="h-5 w-5" />
                  Situação Habitacional
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Tipo de Imóvel</p>
                    <p className="text-lg capitalize">{student.situacaohabitacional.tipo_imovel}</p>
                  </div>
                  {student.situacaohabitacional.valor_aluguel && (
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Valor do Aluguel</p>
                      <p className="text-lg">R$ {Number(student.situacaohabitacional.valor_aluguel).toFixed(2)}</p>
                    </div>
                  )}
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Número de Cômodos</p>
                    <p className="text-lg">{student.situacaohabitacional.numero_comodos}</p>
                  </div>
                  <div className="md:col-span-2">
                    <p className="text-sm font-medium text-muted-foreground mb-2">Infraestrutura</p>
                    <div className="flex flex-wrap gap-2">
                      {student.situacaohabitacional.energia_eletrica && <Badge variant="outline">Energia Elétrica</Badge>}
                      {student.situacaohabitacional.agua_encanada && <Badge variant="outline">Água Encanada</Badge>}
                      {student.situacaohabitacional.piso_cimento && <Badge variant="outline">Piso de Cimento</Badge>}
                      {student.situacaohabitacional.piso_lajota && <Badge variant="outline">Piso de Lajota</Badge>}
                      {student.situacaohabitacional.piso_chao_batido && <Badge variant="outline">Chão Batido</Badge>}
                      {student.situacaohabitacional.saneamento_fossa && <Badge variant="outline">Fossa</Badge>}
                      {student.situacaohabitacional.saneamento_cifon && <Badge variant="outline">Esgoto</Badge>}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Bens do Domicílio */}
          {student.bensdomicilio && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Package className="h-5 w-5" />
                  Bens do Domicílio
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  {student.bensdomicilio.tv && <Badge variant="secondary">TV</Badge>}
                  {student.bensdomicilio.dvd && <Badge variant="secondary">DVD</Badge>}
                  {student.bensdomicilio.radio && <Badge variant="secondary">Rádio</Badge>}
                  {student.bensdomicilio.computador && <Badge variant="secondary">Computador</Badge>}
                  {student.bensdomicilio.notebook && <Badge variant="secondary">Notebook</Badge>}
                  {student.bensdomicilio.tablet && <Badge variant="secondary">Tablet</Badge>}
                  {student.bensdomicilio.telefone_fixo && <Badge variant="secondary">Telefone Fixo</Badge>}
                  {student.bensdomicilio.telefone_celular && <Badge variant="secondary">Celular</Badge>}
                  {student.bensdomicilio.internet && <Badge variant="secondary">Internet</Badge>}
                  {student.bensdomicilio.tv_assinatura && <Badge variant="secondary">TV por Assinatura</Badge>}
                  {student.bensdomicilio.fogao && <Badge variant="secondary">Fogão</Badge>}
                  {student.bensdomicilio.geladeira && <Badge variant="secondary">Geladeira</Badge>}
                  {student.bensdomicilio.freezer && <Badge variant="secondary">Freezer</Badge>}
                  {student.bensdomicilio.micro_ondas && <Badge variant="secondary">Micro-ondas</Badge>}
                  {student.bensdomicilio.maquina_lavar_roupa && <Badge variant="secondary">Máquina de Lavar</Badge>}
                  {student.bensdomicilio.ar_condicionado && <Badge variant="secondary">Ar Condicionado</Badge>}
                  {student.bensdomicilio.bicicleta && <Badge variant="secondary">Bicicleta</Badge>}
                  {student.bensdomicilio.moto && <Badge variant="secondary">Moto</Badge>}
                  {student.bensdomicilio.automovel && <Badge variant="secondary">Automóvel</Badge>}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Composição Familiar */}
          {student.composicao_familiar && student.composicao_familiar.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="h-5 w-5" />
                  Composição Familiar
                </CardTitle>
                <CardDescription>
                  {student.composicao_familiar.length} membro(s) da família
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {student.composicao_familiar.map((membro, index) => (
                    <Card key={index} className="bg-muted/30">
                      <CardContent className="pt-4">
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                          <div>
                            <p className="text-sm font-medium text-muted-foreground">Nome</p>
                            <p className="font-medium">{membro.nome}</p>
                          </div>
                          <div>
                            <p className="text-sm font-medium text-muted-foreground">Idade</p>
                            <p>{membro.idade} anos</p>
                          </div>
                          <div>
                            <p className="text-sm font-medium text-muted-foreground">Parentesco</p>
                            <p>{membro.parentesco}</p>
                          </div>
                          <div>
                            <p className="text-sm font-medium text-muted-foreground">Renda</p>
                            <p>R$ {Number(membro.renda_bruta).toFixed(2)}</p>
                          </div>
                          {membro.situacao_escolar && (
                            <div className="col-span-2">
                              <p className="text-sm font-medium text-muted-foreground">Situação Escolar</p>
                              <p>{membro.situacao_escolar}</p>
                            </div>
                          )}
                          {membro.situacao_emprego && (
                            <div className="col-span-2">
                              <p className="text-sm font-medium text-muted-foreground">Situação de Emprego</p>
                              <p>{membro.situacao_emprego}</p>
                            </div>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Pessoas Autorizadas para Retirada */}
          {student.autorizados_retirada && student.autorizados_retirada.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <UserCheck className="h-5 w-5" />
                  Pessoas Autorizadas para Retirada
                </CardTitle>
                <CardDescription>
                  {student.autorizados_retirada.length} pessoa(s) autorizada(s)
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {student.autorizados_retirada.map((pessoa, index) => (
                    <Card key={index} className="bg-muted/30">
                      <CardContent className="pt-4">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                          <div>
                            <p className="text-sm font-medium text-muted-foreground">Nome</p>
                            <p className="font-medium">{pessoa.nome}</p>
                          </div>
                          <div>
                            <p className="text-sm font-medium text-muted-foreground">Parentesco</p>
                            <p>{pessoa.parentesco}</p>
                          </div>
                          <div>
                            <p className="text-sm font-medium text-muted-foreground">RG</p>
                            <p>{pessoa.rg}</p>
                          </div>
                          <div>
                            <p className="text-sm font-medium text-muted-foreground">Telefone</p>
                            <p>{pessoa.fone}</p>
                          </div>
                          <div>
                            <p className="text-sm font-medium text-muted-foreground">Responsável Legal</p>
                            <Badge variant={pessoa.e_responsavel_legal ? "default" : "secondary"}>
                              {pessoa.e_responsavel_legal ? "Sim" : "Não"}
                            </Badge>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                Responsáveis
              </CardTitle>
              <CardDescription>
                {responsables.length} responsável(is) cadastrado(s)
              </CardDescription>
            </CardHeader>
            <CardContent>
              {responsables.length === 0 ? (
                <p className="text-muted-foreground text-center py-4">
                  Nenhum responsável cadastrado
                </p>
              ) : (
                <div className="space-y-4">
                  {responsables.map((responsable, index) => (
                    <Card key={responsable.id} className="bg-muted/30">
                      <CardContent>
                        <div className="space-y-3">
                          <div className="flex items-center gap-2 mb-2">
                            <Badge variant="outline">Responsável {index + 1}</Badge>
                          </div>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                            <div>
                              <p className="text-sm font-medium text-muted-foreground flex items-center gap-1">
                                <User className="h-3 w-3" />
                                Nome
                              </p>
                              <p className="font-medium">{responsable.nome}</p>
                            </div>
                            <div>
                              <p className="text-sm font-medium text-muted-foreground flex items-center gap-1">
                                <CreditCard className="h-3 w-3" />
                                CPF
                              </p>
                              <p>{responsable.cpf}</p>
                            </div>
                            <div>
                              <p className="text-sm font-medium text-muted-foreground flex items-center gap-1">
                                <Phone className="h-3 w-3" />
                                Telefone
                              </p>
                              <p>{responsable.telefone}</p>
                            </div>
                            <div>
                              <p className="text-sm font-medium text-muted-foreground flex items-center gap-1">
                                <Mail className="h-3 w-3" />
                                E-mail
                              </p>
                              <p className="text-sm break-all">{responsable.email}</p>
                            </div>
                            {responsable.endereco_texto && (
                              <div className="md:col-span-2">
                                <p className="text-sm font-medium text-muted-foreground flex items-center gap-1">
                                  <MapPin className="h-3 w-3" />
                                  Endereço
                                </p>
                                <p>{responsable.endereco_texto}</p>
                              </div>
                            )}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Informações de Cadastro</CardTitle>
            </CardHeader>
            <CardContent>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Data de Cadastro</p>
                <p className="text-lg">{formatDate(student.criado_em)}</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </DialogContent>
    </Dialog>
  )
}

