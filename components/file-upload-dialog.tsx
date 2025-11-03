"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { studentsService } from "@/lib/students"
import { Upload } from "lucide-react"

interface FileUploadDialogProps {
  studentId: string
  studentName: string
  fileType: "comprovante" | "certidao"
  open: boolean
  onOpenChange: (open: boolean) => void
  onSuccess?: () => void
}

export function FileUploadDialog({ 
  studentId, 
  studentName, 
  fileType, 
  open, 
  onOpenChange,
  onSuccess
}: FileUploadDialogProps) {
  const [file, setFile] = useState<File | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState(false)

  const fileTypeLabel = fileType === "comprovante" 
    ? "Comprovante de Residência" 
    : "Certidão de Nascimento"

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0]
    if (selectedFile) {
      setFile(selectedFile)
      setError("")
      setSuccess(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!file) {
      setError("Por favor, selecione um arquivo.")
      return
    }

    setIsLoading(true)
    setError("")
    setSuccess(false)

    try {
      let result
      if (fileType === "comprovante") {
        result = await studentsService.uploadComprovanteResidencia(studentId, file)
      } else {
        result = await studentsService.uploadCertidaoNascimento(studentId, file)
      }

      if (result) {
        setSuccess(true)
        setTimeout(() => {
          onOpenChange(false)
          setFile(null)
          setSuccess(false)
          if (onSuccess) onSuccess()
        }, 1500)
      } else {
        setError("Erro ao fazer upload do arquivo. Tente novamente.")
      }
    } catch (err) {
      setError("Erro ao fazer upload do arquivo. Tente novamente.")
    } finally {
      setIsLoading(false)
    }
  }

  const handleClose = () => {
    if (!isLoading) {
      onOpenChange(false)
      setFile(null)
      setError("")
      setSuccess(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Upload de {fileTypeLabel}</DialogTitle>
          <DialogDescription>
            Aluno: <strong>{studentName}</strong>
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="file">
              Selecione o arquivo (PDF, JPG, JPEG ou PNG)
            </Label>
            <Input
              id="file"
              type="file"
              accept=".pdf,.jpg,.jpeg,.png"
              onChange={handleFileChange}
              disabled={isLoading}
              required
            />
            {file && (
              <p className="text-sm text-muted-foreground">
                Arquivo selecionado: {file.name}
              </p>
            )}
          </div>

          {error && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {success && (
            <Alert className="bg-green-50 border-green-200">
              <AlertDescription className="text-green-800">
                Arquivo enviado com sucesso!
              </AlertDescription>
            </Alert>
          )}

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={handleClose}
              disabled={isLoading}
              className="cursor-pointer"
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              disabled={isLoading || !file}
              className="cursor-pointer"
            >
              {isLoading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                  Enviando...
                </>
              ) : (
                <>
                  <Upload className="h-4 w-4 mr-2" />
                  Enviar
                </>
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

