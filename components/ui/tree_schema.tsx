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

const PropertyNode: React.FC<{
    name: string,
    value: SchemaProperty,
    depth: number,
    isRequired: boolean
}> = ({ name, value, depth, isRequired }) => {
    const [isExpanded, setIsExpanded] = React.useState(true);
    const isObject = value.type === 'object' && value.properties;
    const isArray = value.type === 'array' && value.items;
    const isOneOf = value.oneOf;
    const hasChildren = isObject || isArray || isOneOf;

    const getLimits = (prop: SchemaProperty): React.ReactNode[] => {
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
        <div className="border-l-2 border-gray-200 pl-4 mb-2">
            <div className="flex items-center">
                {hasChildren && (
                    <button
                        onClick={() => setIsExpanded(!isExpanded)}
                        className="mr-2 w-4 h-4 inline-flex items-center justify-center bg-gray-200 rounded-full text-xs"
                    >
                        {isExpanded ? '▼' : '▶'}
                    </button>
                )}
                <span className="font-medium">{name}</span>
                <span className="ml-2 text-sm text-gray-600">{value.type || (isOneOf ? '多选一' : '未指定')}</span>
                <span className="ml-2 text-sm text-gray-500">{value.description || ''}</span>
            </div>
            <div className="mt-1">{getLimits(value)}</div>
            {isExpanded && hasChildren && (
                <div className="mt-2 ml-4">
                    {isObject && (
                        <PropertyTree
                            properties={value.properties!}
                            requiredFields={value.required || []}
                            depth={depth + 1}
                        />
                    )}
                    {isArray && (
                        <div>
                            <div className="font-medium mb-1">数组项:</div>
                            <PropertyTree
                                properties={{ item: value.items! }}
                                requiredFields={[]}
                                depth={depth + 1}
                            />
                        </div>
                    )}
                    {isOneOf && (
                        <div>
                            {value.oneOf!.map((option: SchemaProperty, index: number) => (
                                <div key={index} className="mb-2">
                                    <div className="font-medium mb-1">选项 {index + 1}:</div>
                                    <PropertyTree
                                        properties={{ [`选项 ${index + 1}`]: option }}
                                        requiredFields={[]}
                                        depth={depth + 1}
                                    />
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

const PropertyTree: React.FC<{
    properties: Record<string, SchemaProperty>,
    requiredFields: string[],
    depth: number
}> = ({ properties, requiredFields, depth }) => {
    return (
        <div className="space-y-2">
            {Object.entries(properties).map(([key, value]) => (
                <PropertyNode
                    key={key}
                    name={key}
                    value={value}
                    depth={depth}
                    isRequired={requiredFields.includes(key)}
                />
            ))}
        </div>
    );
};

export const SchemaRenderer: React.FC<{ schema?: SchemaInfo, title: string }> = ({ schema, title }) => {
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

    return (
        <Card className="mt-4">
            <CardHeader>
                <CardTitle>{title}</CardTitle>
            </CardHeader>
            <CardContent>
                <PropertyTree properties={schema.properties} requiredFields={schema.required || []} depth={0} />
            </CardContent>
        </Card>
    )
}
