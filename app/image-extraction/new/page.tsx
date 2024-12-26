'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Card } from '@/components/ui/card'
import { ScrollArea } from '@/components/ui/scroll-area'
import ImageUploader from '@/components/ImageUploader'
import { SchemaBuilder } from '@/components/SchemaBuilder'
import TemplateSelector from '@/components/TemplateSelector'
import SaveTemplateDialog from '@/components/SaveTemplateDialog'
import { useRouter } from 'next/navigation'
import { extractData } from '../actions/extractData'
import { fileToBase64 } from '../utils/fileUtils'
import { createClient } from '@/utils/supabase/client'
import { toast } from '@/hooks/use-toast'
import { SchemaField } from '../actions/extractData'
import { Loader2 } from "lucide-react"
import ExtractedDataViewer from '@/components/ExtractedDataViewer'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Download } from "lucide-react"

export default function ExtractionPage() {
  const [uploadedFiles, setUploadedFiles] = useState<File[]>([])
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [documentDescription, setDocumentDescription] = useState('')
  const [schema, setSchema] = useState<SchemaField[]>([])
  const [isTemplateDialogOpen, setIsTemplateDialogOpen] = useState(false)
  const [currentTemplateName, setCurrentTemplateName] = useState<string>('')
  const [currentTemplateId, setCurrentTemplateId] = useState<number | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [extractedData, setExtractedData] = useState<any>(null)
  const router = useRouter()

  const handleFileUpload = (files: File[]) => {
    setUploadedFiles(files)
    setSelectedFile(files[files.length - 1] || null)
  }

  const handleDeleteFile = (fileToDelete: File) => {
    setUploadedFiles(uploadedFiles.filter(file => file !== fileToDelete))
    if (selectedFile === fileToDelete) {
      setSelectedFile(uploadedFiles.length > 1 ? uploadedFiles[0] : null)
    }
  }

  const handleConvert = async (convertAll: boolean = false) => {
    try {
      if (!selectedFile && !convertAll) {
        toast({
          variant: "destructive",
          title: "Error",
          description: "Please select a file to convert",
        })
        return
      }

      setIsLoading(true)
      const filesToProcess = convertAll ? uploadedFiles : [selectedFile!]
      
      for (const file of filesToProcess) {
        const base64 = await fileToBase64(file)
        const fileExtension = '.' + file.name.split('.').pop()?.toLowerCase() || '.pdf'
        
        const result = await extractData({
          file: base64,
          fields: schema,
          description: documentDescription,
          fileExtension: fileExtension
        })
        
        setExtractedData(result)
      }
    } catch (error) {
      console.error('Error converting file:', error)
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to convert file",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleSaveTemplate = () => {
    setIsTemplateDialogOpen(true)
  }

  const handleTemplateSelect = (template: { 
    description: string; 
    schema: any; 
    template_name: string;
    template_id: number;
  }) => {
    setDocumentDescription(template.description)
    setSchema(template.schema.fields)
    setCurrentTemplateName(template.template_name)
    setCurrentTemplateId(template.template_id)
  }

  const downloadAsJson = () => {
    const jsonString = JSON.stringify(extractedData, null, 2)
    const blob = new Blob([jsonString], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = 'extracted-data.json'
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)
  }

  const downloadAsCsv = () => {
    const flattenObject = (obj: any, prefix = ''): any => {
      return Object.keys(obj).reduce((acc: any, k: string) => {
        const pre = prefix.length ? prefix + '.' : ''
        if (typeof obj[k] === 'object' && obj[k] !== null && !Array.isArray(obj[k])) {
          Object.assign(acc, flattenObject(obj[k], pre + k))
        } else {
          acc[pre + k] = Array.isArray(obj[k]) ? obj[k].join('; ') : obj[k]
        }
        return acc
      }, {})
    }

    const flatData = flattenObject(extractedData)
    const headers = Object.keys(flatData)
    const csvContent = [
      headers.join(','),
      Object.values(flatData).map(v => `"${v}"`).join(',')
    ].join('\n')

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = 'extracted-data.csv'
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)
  }

  if (extractedData) {
    return (
      <div className="container mx-auto p-4">
        <div className="flex justify-between items-center mb-8">
          <Button 
            variant="ghost"
            onClick={() => setExtractedData(null)}
          >
            ← Back
          </Button>
          
          <h2 className="text-2xl font-medium">Here's the extracted data</h2>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm">
                <Download className="h-4 w-4 mr-2" />
                Download
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={downloadAsJson}>
                Download as JSON
              </DropdownMenuItem>
              <DropdownMenuItem onClick={downloadAsCsv}>
                Download as CSV
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
        
        <div className="mt-6">
          <ExtractedDataViewer data={extractedData} />
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto p-4 relative">
      {isLoading && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white p-8 rounded-lg flex flex-col items-center space-y-4">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
            <p className="text-lg font-medium">Processing your document...</p>
          </div>
        </div>
      )}
      <div className="flex justify-end space-x-4 mb-4">
        <Button onClick={() => handleConvert(false)} disabled={!selectedFile || schema.length === 0}>
          Convert Selected
        </Button>
        {uploadedFiles.length > 1 && (
          <Button variant="outline" onClick={() => handleConvert(true)} disabled={schema.length === 0}>
            Convert All
          </Button>
        )}
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <Card className="p-4 shadow-sm lg:col-span-1">
          <ImageUploader
            onFileUpload={handleFileUpload}
            selectedFile={selectedFile}
            onSelectFile={setSelectedFile}
            uploadedFiles={uploadedFiles}
            onDeleteFile={handleDeleteFile}
          />
        </Card>
        <Card className="p-4 shadow-sm md:col-span-1 lg:col-span-2 relative">
          <ScrollArea className="h-[calc(100vh-12rem)]">
            <div className="space-y-4 pb-16">
              <div className="flex justify-end mb-4">
                <div className="w-[200px]">
                  <TemplateSelector onSelect={handleTemplateSelect} />
                </div>
              </div>
              <div>
                <label htmlFor="document-description" className="block text-sm font-medium text-gray-700 mb-1">
                  Document Description
                </label>
                <Textarea
                  id="document-description"
                  placeholder="Enter document description"
                  value={documentDescription}
                  onChange={(e) => setDocumentDescription(e.target.value)}
                  className="w-full"
                />
              </div>
              <SchemaBuilder 
                schema={schema} 
                setSchema={setSchema}
              />
            </div>
          </ScrollArea>
          <div className="absolute bottom-4 right-4">
            <Button onClick={handleSaveTemplate}>Save as Template</Button>
          </div>
        </Card>
      </div>
      <SaveTemplateDialog
        isOpen={isTemplateDialogOpen}
        onClose={() => setIsTemplateDialogOpen(false)}
        initialTemplateName={currentTemplateName}
        templateId={currentTemplateId}
        schema={schema}
      />
    </div>
  )
}

