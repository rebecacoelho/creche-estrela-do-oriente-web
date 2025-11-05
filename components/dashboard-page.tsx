"use client"

import { useState, useEffect } from "react"
import { useAuth, useAuthenticatedRequest } from "@/lib/auth"
import { type AlunoResponse, studentsService, setAuthenticatedRequestFn } from "@/lib/students"
import { Button } from "@/components/ui/button"
import { DashboardStats } from "@/components/dashboard-stats"
import { StudentsTable } from "@/components/students-table"
import { StudentFormMultiStep } from "@/components/student-form-multi-step"
import { StudentEditForm } from "@/components/student-edit-form"
import { Plus, LogOut, Users, FileText } from "lucide-react"

export function DashboardPage() {
  const { logout } = useAuth()
  const { makeRequest } = useAuthenticatedRequest()
  const [students, setStudents] = useState<AlunoResponse[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [showEditForm, setShowEditForm] = useState(false)
  const [editingStudentId, setEditingStudentId] = useState<string | null>(null)
  const [currentView, setCurrentView] = useState<"dashboard" | "students">("dashboard")

  useEffect(() => {
    setAuthenticatedRequestFn(makeRequest)
  }, [makeRequest])

  useEffect(() => {
    loadStudents()
  }, [])

  const loadStudents = async () => {
    setIsLoading(true)
    try {
      const data = await studentsService.getAll()
      setStudents(data)
    } catch (error) {
      console.error("Erro ao carregar alunos:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleEdit = (aluno: AlunoResponse) => {
    setEditingStudentId(aluno.id.toString())
    setShowEditForm(true)
  }

  const handleDelete = async (id: string) => {
    if (confirm("Tem certeza que deseja excluir este aluno?")) {
      await studentsService.delete(id)
      loadStudents()
    }
  }

  const handleFormSuccess = () => {
    setShowForm(false)
    loadStudents()
  }

  const handleFormCancel = () => {
    setShowForm(false)
  }

  const handleEditSuccess = () => {
    setShowEditForm(false)
    setEditingStudentId(null)
    loadStudents()
  }

  const handleEditCancel = () => {
    setShowEditForm(false)
    setEditingStudentId(null)
  }

  if (showForm) {
    return (
      <div className="min-h-screen bg-muted/50 p-4 flex items-center">
        <StudentFormMultiStep onSuccess={handleFormSuccess} onCancel={handleFormCancel} />
      </div>
    )
  }

  if (showEditForm && editingStudentId) {
    return (
      <div className="min-h-screen bg-muted/50 p-4 flex items-center">
        <StudentEditForm 
          studentId={editingStudentId} 
          onSuccess={handleEditSuccess} 
          onCancel={handleEditCancel} 
        />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-muted/50">
      <header className="bg-card border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-4">
              <nav className="hidden md:flex gap-4">
                <Button
                  variant={currentView === "dashboard" ? "default" : "ghost"}
                  onClick={() => setCurrentView("dashboard")}
                  className="flex items-center gap-2 cursor-pointer"
                >
                  <FileText className="h-4 w-4" />
                  Dashboard
                </Button>
                <Button
                  variant={currentView === "students" ? "default" : "ghost"}
                  onClick={() => setCurrentView("students")}
                  className="flex items-center gap-2 cursor-pointer"
                >
                  <Users className="h-4 w-4" />
                  Alunos
                </Button>
              </nav>
            </div>
            <h1 className="text-xl font-bold text-primary">Creche Estrela do Oriente</h1>
            <div className="flex items-center gap-4">
              <span className="text-sm text-muted-foreground">
                Administrador
              </span>
              <Button variant="outline" onClick={logout} className="flex items-center gap-2 bg-transparent cursor-pointer">
                <LogOut className="h-4 w-4" />
                Sair
              </Button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {currentView === "dashboard" && (
          <div>
            <div className="mb-8">
              <h2 className="text-3xl font-bold text-gray-900 mb-2">Dashboard</h2>
              <p className="text-gray-600">Visão geral dos alunos e estatísticas da creche</p>
            </div>

            {isLoading ? (
              <div className="text-center py-20">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
                <p className="text-muted-foreground text-lg">Carregando dados do dashboard...</p>
              </div>
            ) : (
              <>
                <DashboardStats students={students} />
                
                {students.length === 0 && (
                  <div className="text-center py-20 bg-muted/20 rounded-lg mt-8">
                    <Users className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
                    <h3 className="text-xl font-semibold text-gray-700 mb-2">
                      Nenhum aluno cadastrado
                    </h3>
                    <p className="text-muted-foreground mb-6">
                      Comece cadastrando o primeiro aluno para visualizar as estatísticas
                    </p>
                    <Button 
                      onClick={() => setCurrentView("students")} 
                      className="cursor-pointer"
                    >
                      Ir para Gestão de Alunos
                    </Button>
                  </div>
                )}
              </>
            )}
          </div>
        )}

        {currentView === "students" && (
          <div>
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold">Gestão de Alunos</h2>
              <Button onClick={() => setShowForm(true)} className="flex items-center gap-2 cursor-pointer">
                <Plus className="h-4 w-4" />
                Novo Aluno
              </Button>
            </div>

            {isLoading ? (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
                <p className="text-muted-foreground">Carregando alunos...</p>
              </div>
            ) : (
              <StudentsTable students={students} onEdit={handleEdit} onDelete={handleDelete} onRefresh={loadStudents} />
            )}
          </div>
        )}
      </main>
    </div>
  )
}
