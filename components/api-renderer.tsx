'use client'

import React from 'react'
import { SchemaRenderer } from '@/components/ui/table_schema'
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"

type APIInfo = {
  api?: string
  request?: {
    type?: string
    properties?: Record<string, { type?: string; description?: string }>
  }
  response?: {
    type?: string
    properties?: Record<string, { type?: string; description?: string }>
  }
}

export function ApiRenderer({ api, request, response }: APIInfo) {
  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold mb-4">API Documentation</h1>
      <div className="mb-4">
        <Label>API Endpoint</Label>
        <Input value={api || 'No API endpoint specified'} readOnly />
      </div>
      <SchemaRenderer schema={request} title="Request Schema" />
      <SchemaRenderer schema={response} title="Response Schema" />
    </div>
  )
}