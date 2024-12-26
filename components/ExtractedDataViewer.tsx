import { ScrollArea } from '@/components/ui/scroll-area'

interface ExtractedDataViewerProps {
  data: any
}

export default function ExtractedDataViewer({ data }: ExtractedDataViewerProps) {
  const renderValue = (value: any): JSX.Element => {
    if (Array.isArray(value)) {
      return (
        <ul className="list-disc pl-5">
          {value.map((item, index) => (
            <li key={index}>{renderValue(item)}</li>
          ))}
        </ul>
      )
    } else if (typeof value === 'object' && value !== null) {
      return (
        <div className="pl-4">
          {Object.entries(value).map(([key, val]) => (
            <div key={key} className="mb-2">
              <span className="font-medium">{key}: </span>
              {renderValue(val)}
            </div>
          ))}
        </div>
      )
    } else {
      return <span>{String(value)}</span>
    }
  }

  return (
    <div>
      <h3 className="text-lg font-semibold mb-2">Extracted Data</h3>
      <ScrollArea className="h-[calc(100vh-16rem)]">
        <div className="space-y-4">
          {Object.entries(data).map(([key, value]) => (
            <div key={key} className="border-b pb-2">
              <div className="font-medium">{key}:</div>
              <div>{renderValue(value)}</div>
            </div>
          ))}
        </div>
      </ScrollArea>
    </div>
  )
}

