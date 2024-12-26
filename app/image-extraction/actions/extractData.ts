'use server'

import { cookies } from 'next/headers'

export interface SchemaField {
  name: string;
  type: string;
  description: string;
  children?: SchemaField[];
  isExpanded?: boolean;
}

interface ExtractionPayload {
  file_content: string;
  extraction_schema: {
    fields: SchemaField[];
  };
  document_description: string;
  file_extension: string;
}

export async function extractData(payload: {
  file: string;
  fields: SchemaField[];
  description: string;
  fileExtension: string;
}) {
  const { file, fields, description, fileExtension } = payload;

  const formData: ExtractionPayload = {
    file_content: file,
    extraction_schema: {
      fields: fields.map(field => ({
        name: field.name,
        type: field.type,
        description: field.description,
        children: field.children || []
      }))
    },
    document_description: description,
    file_extension: fileExtension
  };

  const apiUrl = process.env.NEXT_PUBLIC_API_URL;
  const secretKey = process.env.SECRET_KEY;
  
  const response = await fetch(`${apiUrl}/api/v1/extract`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
      'Authorization': `Bearer ${secretKey}`
    },
    body: JSON.stringify(formData)
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.message || 'Failed to extract data');
  }

  const data = await response.json();
  return data;
}