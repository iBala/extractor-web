import { Button } from '@/components/ui/button'
import Image from 'next/image'

interface ImageThumbnailProps {
  src: string
  isSelected: boolean
  onClick: () => void
}

export default function ImageThumbnail({ src, isSelected, onClick }: ImageThumbnailProps) {
  return (
    <Button
      variant={isSelected ? 'default' : 'outline'}
      className="w-full p-1 h-auto"
      onClick={onClick}
    >
      <Image src={src} alt="Thumbnail" width={100} height={100} className="w-full h-auto" />
    </Button>
  )
}

