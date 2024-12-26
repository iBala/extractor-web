import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { ScrollArea } from '@/components/ui/scroll-area'
import ImageThumbnail from '../components/ImageThumbnail'
import ExtractedDataViewer from '../components/ExtractedDataViewer'
import SaveTemplateDialog from '../components/SaveTemplateDialog'
import { useRouter } from 'next/navigation'

// Mock data for demonstration
const mockExtractedData = {
  field1: 'Value 1',
  field2: 'Value 2',
  field3: 'Value 3',
}

export default function ExtractionResultsPage() {
  const [selectedImage, setSelectedImage] = useState(0)
  const [isTemplateDialogOpen, setIsTemplateDialogOpen] = useState(false)
  const router = useRouter()

  // Mock data for demonstration
  const images = [
    '/placeholder.svg?height=100&width=100',
    '/placeholder.svg?height=100&width=100',
    '/placeholder.svg?height=100&width=100',
  ]

  const handleBack = () => {
    router.push('/extraction')
  }

  const handleSaveTemplate = () => {
    setIsTemplateDialogOpen(true)
  }

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
          <ExtractedDataViewer data={mockExtractedData} />
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

