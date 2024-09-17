import React from 'react'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

type SchemaProperty = {
    type?: string;
    description?: string;
    properties?: Record<string, SchemaProperty>;
    items?: SchemaProperty;
    oneOf?: SchemaProperty[];
    required?: string[];
    [key: string]: any;
}

type SchemaInfo = {
    type?: string;
    properties?: Record<string, SchemaProperty>;
    required?: string[];
}

const getLimits = (prop: SchemaProperty, isRequired: boolean): React.ReactNode[] => {
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

const PropertyRow: React.FC<{ name: string, value: any, depth: number, requiredFields: string[] }> = ({ name, value, depth, requiredFields }) => {
    const [isExpanded, setIsExpanded] = React.useState(true);
    const isObject = value.type === 'object' && value.properties;
    const isArray = value.type === 'array' && value.items;
    const isOneOf = value.oneOf;
    const hasChildren = isObject || isArray || isOneOf;
    const isRequired = requiredFields.includes(name);

    return (
        <React.Fragment>
            <tr className="border-b">
                <td className="p-2 w-1/4">
                    <div className="flex items-center" style={{ paddingLeft: `${depth * 1.5}rem` }}>
                        {hasChildren && (
                            <button onClick={() => setIsExpanded(!isExpanded)} className="mr-2 w-4 h-4 inline-flex items-center justify-center bg-gray-200 rounded-full text-xs">
                                {isExpanded ? '▼' : '▶'}
                            </button>
                        )}
                        <span className="font-medium">{name}</span>
                    </div>
                </td>
                <td className="p-2 w-1/6">{value.type || (isOneOf ? '多选一' : '未指定')}</td>
                <td className="p-2 w-1/3">{value.description || ''}</td>
                <td className="p-2 w-1/4">{getLimits(value, isRequired)}</td>
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
                        <th className="text-left p-2 w-1/4">Name</th>
                        <th className="text-left p-2 w-1/6">Type</th>
                        <th className="text-left p-2 w-1/3">Description</th>
                        <th className="text-left p-2 w-1/4">Limits</th>
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


export const SchemaRenderer: React.FC<{ schema?: SchemaInfo, title: string }> = ({ schema, title }) => {

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