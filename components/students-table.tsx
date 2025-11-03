"use client"

import { useEffect, useState } from "react"
import { type AlunoResponse, studentsService } from "@/lib/students"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { StudentDetailsDialog } from "@/components/student-details-dialog"
import { FileUploadDialog } from "@/components/file-upload-dialog"
import { Download, Edit, Trash2, Search, Filter, Eye, FileUp, FileText } from "lucide-react"

interface StudentsTableProps {
  students: AlunoResponse[]
  onEdit: (aluno: AlunoResponse) => void
  onDelete: (id: string) => void
  onRefresh?: () => void
}

export function StudentsTable({ students, onEdit, onDelete, onRefresh }: StudentsTableProps) {
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState<string>("all")
  const [classroomFilter, setClassroomFilter] = useState<string>("all")
  const [selectedStudentId, setSelectedStudentId] = useState<string | null>(null)
  const [showDetailsDialog, setShowDetailsDialog] = useState(false)
  const [showComprovanteDialog, setShowComprovanteDialog] = useState(false)
  const [showCertidaoDialog, setShowCertidaoDialog] = useState(false)
  const [uploadStudentId, setUploadStudentId] = useState<string | null>(null)
  const [uploadStudentName, setUploadStudentName] = useState<string>("")

  const filteredStudents = students.filter((aluno) => {
    const matchesSearch = aluno.nome.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatus = statusFilter === "all" || 
      (statusFilter === "matriculado" && aluno.ativo) ||
      (statusFilter === "pre_matricula" && !aluno.ativo)
    const matchesClassroom = classroomFilter === "all" || aluno.turma === classroomFilter

    return matchesSearch && matchesStatus && matchesClassroom
  })

  const handleExportCsv = () => {
    const csvContent = studentsService.exportToCsv(filteredStudents)
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" })
    const link = document.createElement("a")
    const url = URL.createObjectURL(blob)
    link.setAttribute("href", url)
    link.setAttribute("download", `alunos_${new Date().toISOString().split("T")[0]}.csv`)
    link.style.visibility = "hidden"
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  const getStatusBadge = (ativo: boolean) => {
    return (
      <Badge variant={ativo ? "default" : "outline"}>
        {ativo ? "Matriculado" : "Pré-Matrícula"}
      </Badge>
    )
  }

  const uniqueClassrooms = [...new Set(students.map((s) => s.turma).filter(Boolean))]

  const handleViewDetails = (studentId: number) => {
    setSelectedStudentId(studentId.toString())
    setShowDetailsDialog(true)
  }

  const handleUploadComprovante = (aluno: AlunoResponse) => {
    setUploadStudentId(aluno.id.toString())
    setUploadStudentName(aluno.nome)
    setShowComprovanteDialog(true)
  }

  const handleUploadCertidao = (aluno: AlunoResponse) => {
    setUploadStudentId(aluno.id.toString())
    setUploadStudentName(aluno.nome)
    setShowCertidaoDialog(true)
  }

  const handleUploadSuccess = () => {
    if (onRefresh) onRefresh()
  }

  return (
    <>
      <StudentDetailsDialog 
        studentId={selectedStudentId}
        open={showDetailsDialog}
        onOpenChange={setShowDetailsDialog}
        onUpdate={onRefresh}
      />
      
      {uploadStudentId && (
        <>
          <FileUploadDialog
            studentId={uploadStudentId}
            studentName={uploadStudentName}
            fileType="comprovante"
            open={showComprovanteDialog}
            onOpenChange={setShowComprovanteDialog}
            onSuccess={handleUploadSuccess}
          />
          <FileUploadDialog
            studentId={uploadStudentId}
            studentName={uploadStudentName}
            fileType="certidao"
            open={showCertidaoDialog}
            onOpenChange={setShowCertidaoDialog}
            onSuccess={handleUploadSuccess}
          />
        </>
      )}
      
      <Card>
      <CardHeader>
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <CardTitle>Lista de Alunos</CardTitle>
            <CardDescription>
              {filteredStudents.length} de {students.length} alunos
            </CardDescription>
          </div>
          <Button onClick={handleExportCsv} className="flex items-center gap-2 cursor-pointer">
            <Download className="h-4 w-4" />
            Exportar CSV
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col sm:flex-row gap-4 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
            <Input
              placeholder="Buscar por nome do aluno..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-full sm:w-48">
              <Filter className="h-4 w-4 mr-2" />
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos os status</SelectItem>
              <SelectItem value="matriculado">Matriculado</SelectItem>
              <SelectItem value="pre_matricula">Pré-Matrícula</SelectItem>
            </SelectContent>
          </Select>
          <Select value={classroomFilter} onValueChange={setClassroomFilter}>
            <SelectTrigger className="w-full sm:w-48">
              <SelectValue placeholder="Turma" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todas as turmas</SelectItem>
              {uniqueClassrooms.map((turma) => (
                <SelectItem key={turma} value={turma!}>
                  {turma}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="rounded-md border overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nome</TableHead>
                <TableHead>Matrícula</TableHead>
                <TableHead>Turma</TableHead>
                <TableHead>Status de Matrícula</TableHead>
                <TableHead>Documentos</TableHead>
                <TableHead className="text-right">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredStudents.map((aluno) => (
                <TableRow key={aluno.id}>
                  <TableCell className="font-medium">{aluno.nome}</TableCell>
                  <TableCell>{aluno.matricula || "-"}</TableCell>
                  <TableCell>{aluno.turma || "-"}</TableCell>
                  <TableCell>{getStatusBadge(aluno.ativo ?? false)}</TableCell>
                  <TableCell>
                    <div className="flex flex-col gap-1">
                      <div className="flex items-center gap-2">
                        {aluno.comprovante_residencia_url ? (
                          <Badge variant="default" className="text-xs">
                            <FileText className="h-3 w-3 mr-1" />
                            Comprovante OK
                          </Badge>
                        ) : (
                          <Badge variant="outline" className="text-xs">
                            Comprovante pendente
                          </Badge>
                        )}
                      </div>
                      <div className="flex items-center gap-2">
                        {aluno.certidao_nascimento ? (
                          <Badge variant="default" className="text-xs">
                            <FileText className="h-3 w-3 mr-1" />
                            Certidão OK
                          </Badge>
                        ) : (
                          <Badge variant="outline" className="text-xs">
                            Certidão pendente
                          </Badge>
                        )}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-1 flex-wrap">
                      <Button variant="outline" size="sm" onClick={() => handleViewDetails(aluno.id)} className="cursor-pointer" title="Ver detalhes">
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button 
                        variant="outline" 
                        size="sm" 
                        onClick={() => handleUploadComprovante(aluno)} 
                        className="cursor-pointer" 
                        title="Upload Comprovante"
                      >
                        <FileUp className="h-4 w-4" />
                      </Button>
                      <Button 
                        variant="outline" 
                        size="sm" 
                        onClick={() => handleUploadCertidao(aluno)} 
                        className="cursor-pointer" 
                        title="Upload Certidão"
                      >
                        <FileText className="h-4 w-4" />
                      </Button>
                      <Button variant="outline" size="sm" onClick={() => onEdit(aluno)} className="cursor-pointer" title="Editar">
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button variant="outline" size="sm" onClick={() => onDelete(aluno.id.toString())} className="cursor-pointer" title="Excluir">
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
              {filteredStudents.length === 0 && (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                    Nenhum aluno encontrado
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
    </>
  )
}
