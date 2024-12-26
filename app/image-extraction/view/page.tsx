'use client'

import { useSearchParams } from 'next/navigation'
import ExtractedDataViewer from '@/components/ExtractedDataViewer'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { useRouter } from 'next/navigation'

export default function ViewExtractedDataPage() {
  const searchParams = useSearchParams()
  const router = useRouter()
  
  const extractedData = searchParams ? searchParams.get('data') : null;
  let parsedData = {}
  
  try {
    parsedData = extractedData ? JSON.parse(decodeURIComponent(extractedData)) : {}
  } catch (error) {
    console.error('Error parsing data:', error)
  }

  return (
    <div className="container mx-auto p-4">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl font-bold">Extracted Data View</h2>
        <Button 
          variant="outline"
          onClick={() => router.push('/image-extraction/new')}
        >
          Extract Another Document
        </Button>
      </div>
      
      <Card className="p-6">
        <ExtractedDataViewer data={parsedData} />
      </Card>
    </div>
  )
} 