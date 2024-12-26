import { useState, useCallback } from 'react'
import { useDropzone } from 'react-dropzone'
import { Button } from '@/components/ui/button'
import { ScrollArea } from '@/components/ui/scroll-area'
import { FileIcon, ChevronLeft, ChevronRight, X } from 'lucide-react'
import Image from 'next/image'

interface ImageUploaderProps {
  onFileUpload: (files: File[]) => void
  selectedFile: File | null
  onSelectFile: (file: File) => void
  uploadedFiles: File[]
  onDeleteFile: (file: File) => void
}

export default function ImageUploader({ onFileUpload, selectedFile, onSelectFile, uploadedFiles, onDeleteFile }: ImageUploaderProps) {
  const [previewIndex, setPreviewIndex] = useState(0)

  const onDrop = useCallback((acceptedFiles: File[]) => {
    onFileUpload([...uploadedFiles, ...acceptedFiles])
  }, [onFileUpload, uploadedFiles])

  const { getRootProps, getInputProps, isDragActive } = useDropzone({ onDrop })

  const renderThumbnail = (file: File) => {
    if (file.type.startsWith('image/')) {
      return (
        <Image
          src={URL.createObjectURL(file)}
          alt={`Thumbnail ${file.name}`}
          width={100}
          height={100}
          className="w-full h-full object-cover"
        />
      )
    } else if (file.type === 'application/pdf') {
      return (
        <div className="w-full h-full flex items-center justify-center bg-gray-100">
          <FileIcon className="w-8 h-8 text-gray-400" />
          <span className="ml-2 text-xs">PDF</span>
        </div>
      )
    }
  }

  const navigatePreview = (direction: 'prev' | 'next') => {
    if (direction === 'prev') {
      setPreviewIndex((prev) => (prev > 0 ? prev - 1 : uploadedFiles.length - 1))
    } else {
      setPreviewIndex((prev) => (prev < uploadedFiles.length - 1 ? prev + 1 : 0))
    }
    onSelectFile(uploadedFiles[previewIndex])
  }

  return (
    <div className="space-y-4">
      <div
        {...getRootProps()}
        className={`border-2 border-dashed rounded-lg p-4 text-center cursor-pointer ${
          isDragActive ? 'border-primary' : 'border-gray-300'
        }`}
      >
        <input {...getInputProps()} />
        <p>Drag 'n' drop some files here, or click to select files</p>
      </div>
      {selectedFile && (
        <div className="aspect-video relative">
          {renderThumbnail(selectedFile)}
          {uploadedFiles.length > 1 && (
            <>
              <Button
                variant="ghost"
                size="icon"
                className="absolute top-1/2 left-2 transform -translate-y-1/2"
                onClick={() => navigatePreview('prev')}
              >
                <ChevronLeft className="h-6 w-6" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="absolute top-1/2 right-2 transform -translate-y-1/2"
                onClick={() => navigatePreview('next')}
              >
                <ChevronRight className="h-6 w-6" />
              </Button>
            </>
          )}
        </div>
      )}
      <ScrollArea className="h-24">
        <div className="flex space-x-2">
          {uploadedFiles.map((file, index) => (
            <div key={index} className="relative">
              <Button
                variant={file === selectedFile ? 'default' : 'outline'}
                onClick={() => onSelectFile(file)}
                className="w-24 h-24 p-1"
              >
                {renderThumbnail(file)}
              </Button>
              <Button
                variant="destructive"
                size="icon"
                className="absolute -top-2 -right-2 h-6 w-6 rounded-full"
                onClick={() => onDeleteFile(file)}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          ))}
        </div>
      </ScrollArea>
    </div>
  )
}

