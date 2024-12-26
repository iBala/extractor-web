import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { ScrollArea } from '@/components/ui/scroll-area'
import ImageThumbnail from '../components/ImageThumbnail'
import ExtractedDataViewer from '../components/ExtractedDataViewer'
import SaveTemplateDialog from '../components/SaveTemplateDialog'
import { useRouter } from 'next/navigation'

export default function ExtractionResultsPage() {
  const [selectedImage, setSelectedImage] = useState(0)
  const [isTemplateDialogOpen, setIsTemplateDialogOpen] = useState(false)
  const [extractedData, setExtractedData] = useState<any>(null)
  const router = useRouter()

  useEffect(() => {
    const storedData = localStorage.getItem('extractionResult')
    if (storedData) {
      setExtractedData(JSON.parse(storedData))
    }
  }, [])

  const handleBack = () => {
    router.push('/image-extraction/new')
  }

  const handleSaveTemplate = () => {
    setIsTemplateDialogOpen(true)
  }

  // Mock data for demonstration
  const images = [
    '/placeholder.svg?height=100&width=100',
    '/placeholder.svg?height=100&width=100',
    '/placeholder.svg?height=100&width=100',
  ]

  return (
    <div className="container mx-auto p-4">
      <div className="flex justify-between mb-4">
        <Button onClick={handleBack} variant="outline">Back</Button>
        <Button onClick={handleSaveTemplate}>Save as Template</Button>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="p-4">
          <ScrollArea className="h-[calc(100vh-12rem)]">
            <div className="space-y-2">
              {images.map((image, index) => (
                <ImageThumbnail
                  key={index}
                  src={image}
                  isSelected={index === selectedImage}
                  onClick={() => setSelectedImage(index)}
                />
              ))}
            </div>
          </ScrollArea>
        </Card>
        <Card className="md:col-span-2 p-4">
          {extractedData ? (
            <ExtractedDataViewer data={extractedData} />
          ) : (
            <p>No extracted data available.</p>
          )}
        </Card>
      </div>
      <SaveTemplateDialog
        isOpen={isTemplateDialogOpen}
        onClose={() => setIsTemplateDialogOpen(false)}
        onSave={(templateName) => {
          // TODO: Implement saving template to Supabase
          console.log('Saving template:', templateName)
          setIsTemplateDialogOpen(false)
        }}
      />
    </div>
  )
}

