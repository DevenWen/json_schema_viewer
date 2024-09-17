'use client'

import React from 'react'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
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

const SchemaRenderer: React.FC<{ schema?: APIInfo['request'] | APIInfo['response'], title: string }> = ({ schema, title }) => {
  if (!schema || !schema.properties) {
    return (
      <Card className="mt-4">
        <CardHeader>
          <CardTitle>{title}</CardTitle>
        </CardHeader>
        <CardContent>
          <p>No schema information available.</p>
        </CardContent>
      </Card>
    )
  }

  const PropertyRow: React.FC<{ name: string, value: any, depth: number, requiredFields: string[] }> = ({ name, value, depth, requiredFields }) => {
    const [isExpanded, setIsExpanded] = React.useState(true);
    const isObject = value.type === 'object' && value.properties;
    const isArray = value.type === 'array' && value.items;
    const isOneOf = value.oneOf;
    const hasChildren = isObject || isArray || isOneOf;
    const isRequired = requiredFields.includes(name);

    const getLimits = (prop: any): React.ReactNode[] => {
      const limits = [];
      if (prop.minimum !== undefined) limits.push(`最小值: ${prop.minimum}`);
      if (prop.maximum !== undefined) limits.push(`最大值: ${prop.maximum}`);
      if (prop.minLength !== undefined) limits.push(`最小长度: ${prop.minLength}`);
      if (prop.maxLength !== undefined) limits.push(`最大长度: ${prop.maxLength}`);
      if (prop.minItems !== undefined) limits.push(`最少项数: ${prop.minItems}`);
      if (prop.maxItems !== undefined) limits.push(`最多项数: ${prop.maxItems}`);
      if (prop.pattern) limits.push(`模式: ${prop.pattern}`);
      if (prop.enum) limits.push(`枚举值: ${prop.enum.join(', ')}`);
      if (prop.format) limits.push(`格式: ${prop.format}`);
      if (prop.default !== undefined) limits.push(`默认值: ${prop.default}`);
      if (isRequired) limits.push('必填');
      if (prop.oneOf) limits.push('多选一');
      return limits.map((limit, index) => (
        <span key={index} className="inline-block bg-yellow-100 border border-yellow-300 rounded px-1 mr-1 mb-1">
          {limit}
        </span>
      ));
    };

    return (
      <React.Fragment>
        <tr className="border-b">
          <td className="p-2">
            <div className="flex items-center" style={{ paddingLeft: `${depth * 1.5}rem` }}>
              {hasChildren && (
                <button onClick={() => setIsExpanded(!isExpanded)} className="mr-2 w-4 h-4 inline-flex items-center justify-center bg-gray-200 rounded-full text-xs">
                  {isExpanded ? '▼' : '▶'}
                </button>
              )}
              <span className="font-medium">{name}</span>
            </div>
          </td>
          <td className="p-2">{value.type || (isOneOf ? '多选一' : '未指定')}</td>
          <td className="p-2">{value.description || ''}</td>
          <td className="p-2">{getLimits(value)}</td>
        </tr>
        {isExpanded && hasChildren && (
          <tr>
            <td colSpan={4} className="p-0">
              <PropertyTable
                properties={isObject ? value.properties : (isArray ? { item: value.items } : {})}
                depth={depth + 1}
                requiredFields={isObject ? (value.required || []) : []}
                isArrayItem={isArray}
                isOneOf={isOneOf}
                oneOfOptions={isOneOf ? value.oneOf : []}
              />
            </td>
          </tr>
        )}
      </React.Fragment>
    )
  }

  const PropertyTable: React.FC<{ 
    properties: Record<string, any>, 
    depth: number, 
    requiredFields: string[], 
    isArrayItem?: boolean,
    isOneOf?: boolean,
    oneOfOptions?: any[]
  }> = ({ properties, depth, requiredFields, isArrayItem, isOneOf, oneOfOptions }) => {
    return (
      <table className="w-full text-sm">
        {depth === 0 && (
          <thead>
            <tr className="bg-gray-100">
              <th className="text-left p-2">Name</th>
              <th className="text-left p-2">Type</th>
              <th className="text-left p-2">Description</th>
              <th className="text-left p-2">Limits</th>
            </tr>
          </thead>
        )}
        <tbody>
          {isArrayItem && (
            <tr>
              <td colSpan={4} className="p-2 font-medium" style={{ paddingLeft: `${depth * 1.5}rem` }}>
                数组项:
              </td>
            </tr>
          )}
          {isOneOf ? (
            oneOfOptions.map((option: any, index: number) => (
              <PropertyRow
                key={index}
                name={`选项 ${index + 1}`}
                value={option}
                depth={depth}
                requiredFields={[]}
              />
            ))
          ) : (
            Object.entries(properties).map(([key, value]) => (
              <PropertyRow key={key} name={key} value={value} depth={depth} requiredFields={requiredFields} />
            ))
          )}
        </tbody>
      </table>
    );
  };

  return (
    <Card className="mt-4">
      <CardHeader>
        <CardTitle>{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <PropertyTable properties={schema.properties} depth={0} requiredFields={schema.required || []} />
      </CardContent>
    </Card>
  )
}

export function ApiRenderer({ api, request, response }: APIInfo) {
  return (
    <div className="max-w-2xl mx-auto p-4">
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