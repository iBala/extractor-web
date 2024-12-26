'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/utils/supabase/client'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'

interface Template {
  template_id: number
  template_name: string
  extraction_schema: any
}

interface TemplateSelectorProps {
  onSelect: (selectedTemplate: { 
    description: string; 
    schema: any;
    template_name: string;
    template_id: number;
  }) => void;
}

export default function TemplateSelector({ onSelect }: TemplateSelectorProps) {
  const [templates, setTemplates] = useState<Template[]>([])
  const supabase = createClient()

  useEffect(() => {
    async function loadTemplates() {
      const { data, error } = await supabase
        .from('schema_templates')
        .select('template_id, template_name, extraction_schema')
        
      if (error) {
        console.error('Error loading templates:', error)
        return
      }
      
      setTemplates(data || [])
    }

    loadTemplates()
  }, [])

  return (
    <div className="space-y-2">
      <label className="text-sm font-medium text-gray-700">Select Template</label>
      <Select onValueChange={(value) => {
        const template = templates.find(t => t.template_id.toString() === value)
        if (template) {
          onSelect({
            description: template.template_name,
            schema: template.extraction_schema,
            template_name: template.template_name,
            template_id: template.template_id
          })
        }
      }}>
        <SelectTrigger className="w-full">
          <SelectValue placeholder="Choose a template" />
        </SelectTrigger>
        <SelectContent>
          {templates.map((template) => (
            <SelectItem 
              key={template.template_id} 
              value={template.template_id.toString()}
            >
              {template.template_name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  )
}

