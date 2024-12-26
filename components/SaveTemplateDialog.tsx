import { useState, useEffect } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { createClient } from '@/utils/supabase/client'
import { toast } from '@/hooks/use-toast'

interface SaveTemplateDialogProps {
  isOpen: boolean
  onClose: () => void
  initialTemplateName: string
  templateId: number | null
  schema: any
}

export default function SaveTemplateDialog({ 
  isOpen, 
  onClose, 
  initialTemplateName,
  templateId,
  schema 
}: SaveTemplateDialogProps) {
  const [templateName, setTemplateName] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  useEffect(() => {
    setTemplateName(initialTemplateName || '')
  }, [initialTemplateName, isOpen])

  const handleSave = async () => {
    if (!templateName.trim()) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Template name is required",
      })
      return
    }

    setIsSubmitting(true)
    const supabase = createClient()
    
    const formattedSchema = {
      fields: Array.isArray(schema) ? schema : []
    }
    
    try {
      // Check if a template with this name already exists
      const { data: existingTemplates, error: searchError } = await supabase
        .from('schema_templates')
        .select('template_id, template_name')
        .eq('template_name', templateName.trim())
        .single()

      if (searchError && searchError.code !== 'PGRST116') {
        throw searchError
      }

      if (existingTemplates && existingTemplates.template_id !== templateId) {
        toast({
          variant: "destructive",
          title: "Error",
          description: "A template with this name already exists",
        })
        return
      }

      if (templateId && templateName === initialTemplateName) {
        const { error: updateError } = await supabase
          .from('schema_templates')
          .update({
            template_name: templateName.trim(),
            extraction_schema: formattedSchema,
            updated_at: new Date().toISOString(),
          })
          .eq('template_id', templateId)

        if (updateError) throw updateError
      } else {
        const { error: insertError } = await supabase
          .from('schema_templates')
          .insert([
            {
              template_name: templateName.trim(),
              extraction_schema: formattedSchema,
            }
          ])

        if (insertError) throw insertError
      }

      toast({
        title: "Success",
        description: templateId && templateName === initialTemplateName 
          ? "Template updated successfully" 
          : "Template saved successfully",
      })
      onClose()
    } catch (error) {
      console.error('Error saving template:', error)
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to save template",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            {templateId && templateName === initialTemplateName 
              ? 'Update Template' 
              : 'Save as Template'}
          </DialogTitle>
        </DialogHeader>
        <Input
          value={templateName}
          onChange={(e) => setTemplateName(e.target.value)}
          placeholder="Enter template name"
          disabled={isSubmitting}
        />
        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={isSubmitting}>
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={isSubmitting}>
            {isSubmitting ? 'Saving...' : (templateId && templateName === initialTemplateName ? 'Update' : 'Save')}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

