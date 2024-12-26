import { useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select'
import { X, Trash2 } from 'lucide-react'
import { toast } from "@/hooks/use-toast"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormDescription,
} from "@/components/ui/form"
import { useForm } from "react-hook-form"

// Define the Field interface
interface Field {
  name: string;
  type: string;
  description: string;
  children?: Field[];
  isExpanded?: boolean;
}

interface SchemaBuilderProps {
  schema: Field[];
  setSchema: (schema: Field[]) => void;
}

export function SchemaBuilder({ schema, setSchema }: SchemaBuilderProps) {
  const form = useForm()

  const addField = () => {
    setSchema([...schema, { 
      name: '', 
      type: 'string', 
      description: '',
      isExpanded: true 
    }])
  }

  const updateField = (index: number, updates: Partial<Field>) => {
    const newSchema = [...schema]
    newSchema[index] = { ...newSchema[index], ...updates }
    setSchema(newSchema)
  }

  const removeField = (index: number) => {
    setSchema(schema.filter((_, i) => i !== index))
  }

  const addChildField = (parentIndex: number) => {
    const newSchema = [...schema]
    if (!newSchema[parentIndex].children) {
      newSchema[parentIndex].children = []
    }
    newSchema[parentIndex].children?.push({
      name: '',
      type: 'string',
      description: '',
      isExpanded: true
    })
    setSchema(newSchema)
  }

  const updateChildField = (parentIndex: number, childIndex: number, updates: Partial<Field>) => {
    const newSchema = [...schema]
    if (newSchema[parentIndex].children) {
      newSchema[parentIndex].children[childIndex] = {
        ...newSchema[parentIndex].children[childIndex],
        ...updates
      }
    }
    setSchema(newSchema)
  }

  const saveSchema = async () => {
    try {
      const response = await fetch('/api/schema', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ schema }),
      })
      
      if (!response.ok) {
        throw new Error('Failed to save schema')
      }
      
      toast({
        title: "Success",
        description: "Schema saved successfully",
      })
    } catch (error) {
      console.error('Error saving schema:', error)
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to save schema",
      })
    }
  }

  const isValidFieldName = (name: string) => /^[a-zA-Z0-9-_]*$/.test(name)

  const renderField = (field: Field, index: number, parentIndex?: number) => (
    <div key={index} className="rounded-lg border border-input bg-background p-4 mb-2">
      <div className="flex items-start gap-4">
        {field.type === 'array' && (
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={(e) => {
              e.preventDefault()
              const newSchema = [...schema]
              if (parentIndex !== undefined) {
                const parentField = newSchema[parentIndex]
                if (parentField.children) {
                  parentField.children[index] = {
                    ...parentField.children[index],
                    isExpanded: !parentField.children[index].isExpanded
                  }
                }
              } else {
                newSchema[index] = {
                  ...newSchema[index],
                  isExpanded: !newSchema[index].isExpanded
                }
              }
              setSchema(newSchema)
            }}
            className="mt-6 h-8 w-8 p-0 flex-shrink-0"
          >
            {field.isExpanded ? '▼' : '▶'}
          </Button>
        )}

        <div className="flex-1 grid grid-cols-[1fr_1fr_2fr] gap-4">
          <FormField
            control={form.control}
            name={`fields.${index}.name`}
            render={() => (
              <FormItem className="space-y-1.5">
                <FormLabel className="text-sm font-normal text-muted-foreground">
                  Field Name
                </FormLabel>
                <FormControl>
                  <Input
                    placeholder="Enter field name"
                    value={field.name}
                    onChange={(e) => {
                      const newName = e.target.value
                      if (isValidFieldName(newName) || newName === '') {
                        parentIndex !== undefined 
                          ? updateChildField(parentIndex, index, { name: newName })
                          : updateField(index, { name: newName })
                      }
                    }}
                    className="h-8"
                  />
                </FormControl>
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name={`fields.${index}.type`}
            render={() => (
              <FormItem className="space-y-1.5">
                <FormLabel className="text-sm font-normal text-muted-foreground">
                  Type
                </FormLabel>
                <Select
                  value={field.type}
                  onValueChange={(value) => 
                    parentIndex !== undefined 
                      ? updateChildField(parentIndex, index, { type: value })
                      : updateField(index, { type: value })
                  }
                >
                  <FormControl>
                    <SelectTrigger className="h-8">
                      <SelectValue placeholder="Select type" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="string">String</SelectItem>
                    <SelectItem value="number">Number</SelectItem>
                    <SelectItem value="boolean">Boolean</SelectItem>
                    <SelectItem value="date">Date</SelectItem>
                    {!parentIndex && <SelectItem value="array">Array</SelectItem>}
                  </SelectContent>
                </Select>
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name={`fields.${index}.description`}
            render={() => (
              <FormItem className="space-y-1.5">
                <FormLabel className="text-sm font-normal text-muted-foreground">
                  Description
                </FormLabel>
                <FormControl>
                  <Input
                    placeholder="Enter field description"
                    value={field.description}
                    onChange={(e) => 
                      parentIndex !== undefined 
                        ? updateChildField(parentIndex, index, { description: e.target.value })
                        : updateField(index, { description: e.target.value })
                    }
                    className="h-8"
                  />
                </FormControl>
              </FormItem>
            )}
          />
        </div>

        <Button
          variant="ghost"
          size="sm"
          onClick={() => {
            if (parentIndex !== undefined) {
              const newSchema = [...schema]
              newSchema[parentIndex].children = newSchema[parentIndex].children?.filter(
                (_, i) => i !== index
              )
              setSchema(newSchema)
            } else {
              removeField(index)
            }
          }}
          className="mt-6 h-8 w-8 p-0 text-muted-foreground hover:text-destructive flex-shrink-0"
        >
          <Trash2 className="h-4 w-4" />
        </Button>
      </div>

      {field.type === 'array' && field.isExpanded && (
        <div className="mt-4 ml-8 pl-4 border-l-2 border-muted">
          <div className="mb-2">
            <Button 
              type="button" 
              variant="outline" 
              size="sm" 
              onClick={(e) => {
                e.preventDefault()
                const newSchema = [...schema]
                if (!newSchema[index].children) {
                  newSchema[index].children = []
                }
                newSchema[index].children?.push({
                  name: '',
                  type: 'string',
                  description: '',
                  isExpanded: true
                })
                setSchema(newSchema)
              }}
              className="h-8"
            >
              Add Child Field
            </Button>
          </div>
          <div className="space-y-2">
            {field.children?.map((childField, childIndex) => 
              renderField(childField, childIndex, index)
            )}
          </div>
        </div>
      )}
    </div>
  )

  const handleSave = (e: React.MouseEvent) => {
    e.preventDefault()
    saveSchema()
  }

  return (
    <Form {...form}>
      <form className="space-y-4">
        <Button 
          type="button"
          variant="outline" 
          onClick={(e) => {
            e.preventDefault()
            addField()
          }}
          className="h-8"
        >
          Add Field
        </Button>
        
        <div className="space-y-2">
          {schema.map((field, index) => renderField(field, index))}
        </div>
      </form>
    </Form>
  )
}

