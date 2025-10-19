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
import { Calendar, User, Users, Mail, Phone, MapPin, CreditCard, FileText, School, DollarSign } from "lucide-react"

interface StudentDetailsDialogProps {
  studentId: string | null
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function StudentDetailsDialog({ studentId, open, onOpenChange }: StudentDetailsDialogProps) {
  const [student, setStudent] = useState<AlunoResponse | null>(null)
  const [responsables, setResponsables] = useState<ResponsavelResponse[]>([])
  const [isLoading, setIsLoading] = useState(false)

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
                  <p className="text-sm font-medium text-muted-foreground flex items-center gap-1">
                    <School className="h-4 w-4" />
                    Turma
                  </p>
                  <p className="text-lg">{student.turma || "Não atribuída"}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Status</p>
                  <div className="mt-1">
                    <Badge variant={student.ativo ? "default" : "secondary"}>
                      {student.ativo ? "Ativo" : "Inativo"}
                    </Badge>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <DollarSign className="h-5 w-5" />
                Informações Financeiras
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Renda Familiar Mensal</p>
                  <p className="text-lg">
                    {student.renda_familiar_mensal 
                      ? `R$ ${student.renda_familiar_mensal}` 
                      : "Não informada"}
                  </p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Comprovante de Residência</p>
                  {student.comprovante_residencia_url ? (
                    <a 
                      href={student.comprovante_residencia_url?.toString() || ""} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-blue-500 underline hover:text-blue-700 flex items-center gap-2 mt-1"
                    >
                      <FileText className="h-4 w-4" />
                      Ver comprovante
                    </a>
                  ) : (
                    <p className="text-muted-foreground">Não anexado</p>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

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
                            <div className="md:col-span-2">
                              <p className="text-sm font-medium text-muted-foreground flex items-center gap-1">
                                <MapPin className="h-3 w-3" />
                                Endereço
                              </p>
                              <p>{responsable.endereco}</p>
                            </div>
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

