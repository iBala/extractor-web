import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Card } from '@/components/ui/card'
import { ScrollArea } from '@/components/ui/scroll-area'
import ImageUploader from './components/ImageUploader'
import SchemaBuilder from './components/SchemaBuilder'
import ExtractedDataViewer from './components/ExtractedDataViewer'
import TemplateSelector from './components/TemplateSelector'
import SaveTemplateDialog from './components/SaveTemplateDialog'
import { useRouter } from 'next/navigation'

export default function ExtractionPage() {
  const [uploadedFiles, setUploadedFiles] = useState<File[]>([])
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [documentDescription, setDocumentDescription] = useState('')
  const [schema, setSchema] = useState([])
  const [isTemplateDialogOpen, setIsTemplateDialogOpen] = useState(false)
  const router = useRouter()

  const handleFileUpload = (files: File[]) => {
    setUploadedFiles(files)
    setSelectedFile(files[files.length - 1] || null)
  }

  const handleConvert = async (convertAll: boolean) => {
    // TODO: Implement actual conversion logic
    console.log('Converting', convertAll ? 'all files' : 'selected file')
    router.push('/extraction/results')
  }

  const handleSaveTemplate = () => {
    setIsTemplateDialogOpen(true)
  }

  return (
    <div className="container mx-auto p-4">
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
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card className="p-4">
          <ImageUploader
            onFileUpload={handleFileUpload}
            selectedFile={selectedFile}
            onSelectFile={setSelectedFile}
            uploadedFiles={uploadedFiles}
          />
        </Card>
        <Card className="p-4">
          <ScrollArea className="h-[calc(100vh-12rem)]">
            <div className="space-y-4">
              <TemplateSelector onSelect={(template) => {
                setDocumentDescription(template.description)
                setSchema(template.schema)
              }} />
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
                <p className="text-sm text-gray-500 mt-1">
                  Provide context about the document type for more accurate extraction.
                </p>
              </div>
              <SchemaBuilder schema={schema} setSchema={setSchema} />
              <Button onClick={handleSaveTemplate} className="w-full">Save as Template</Button>
            </div>
          </ScrollArea>
        </Card>
      </div>
      <SaveTemplateDialog
        isOpen={isTemplateDialogOpen}
        onClose={() => setIsTemplateDialogOpen(false)}
        onSave={(templateName) => {
          // TODO: Implement saving template to Supabase
          console.log('Saving template:', templateName, { documentDescription, schema })
          setIsTemplateDialogOpen(false)
        }}
      />
    </div>
  )
}

