"use client"

import type { AlunoResponse } from "@/lib/students"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Users, UserCheck, UserX, Clock } from "lucide-react"

interface DashboardStatsProps {
  students: AlunoResponse[]
}

export function DashboardStats({ students }: DashboardStatsProps) {
  const totalStudents = students.length
  const activeStudents = students.filter((s) => s.ativo).length
  const inactiveStudents = students.filter((s) => !s.ativo).length
  const withTurma = students.filter((s) => s.turma).length

  const stats = [
    {
      title: "Total de Alunos",
      value: totalStudents,
      description: "Alunos cadastrados",
      icon: Users,
      color: "text-blue-600",
    },
    {
      title: "Alunos Ativos",
      value: activeStudents,
      description: "Frequentando atualmente",
      icon: UserCheck,
      color: "text-green-600",
    },
    {
      title: "Alunos Inativos",
      value: inactiveStudents,
      description: "Não frequentando",
      icon: UserX,
      color: "text-red-600",
    },
    {
      title: "Com Turma",
      value: withTurma,
      description: "Alunos com turma definida",
      icon: Clock,
      color: "text-yellow-600",
    }
  ]

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
      {stats.map((stat, index) => (
        <Card key={index}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
            <stat.icon className={`h-4 w-4 ${stat.color}`} />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stat.value}</div>
            <p className="text-xs text-muted-foreground">{stat.description}</p>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
