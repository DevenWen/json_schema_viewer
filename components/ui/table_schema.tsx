import React from 'react'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { MarkdownRenderer } from "@/components/ui/markdown-render";

type SchemaProperty = {
    type?: string | string[];
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

const PropertyRow: React.FC<{ name: string, value: any, depth: number, requiredFields: string[], path: string }> = ({ name, value, depth, requiredFields, path }) => {
    const [isExpanded, setIsExpanded] = React.useState(true);
    const [isHovered, setIsHovered] = React.useState(false);
    const isObject = value.type === 'object' && value.properties;
    const isArray = value.type === 'array' && value.items;
    const isOneOf = value.oneOf;
    const hasChildren = isObject || isArray || isOneOf;
    const isRequired = requiredFields.includes(name);
    const fieldPath = `${path}.${name}`.replace(/^\./, '');

    if (value["x-enum-description"]) {
        const enumDescriptions = value["x-enum-description"].map((item: { value: any; description: string }) =>
            `- **${item.value}**: ${item.description}`
        ).join('\n');
        value.full_description = (value.description || '') + '\n\n' + enumDescriptions;
    } else {
        value.full_description = value.description
    }

    return (
        <React.Fragment>
            <tr className="border-b" id={fieldPath}>
                <td className="p-2 w-1/4">
                    <div
                        className="flex items-center"
                        style={{ paddingLeft: `${depth * 1.5}rem` }}
                        onMouseEnter={() => setIsHovered(true)}
                        onMouseLeave={() => setIsHovered(false)}
                    >
                        {hasChildren && (
                            <button onClick={() => setIsExpanded(!isExpanded)} className="mr-2 w-4 h-4 inline-flex items-center justify-center bg-gray-200 rounded-full text-xs">
                                {isExpanded ? '▼' : '▶'}
                            </button>
                        )}
                        <span className="font-medium">{name}</span>
                        {isHovered && (
                            <a href={`#${fieldPath}`} className="ml-1 text-blue-500 hover:text-blue-700">#</a>
                        )}
                    </div>
                </td>
                <td className="p-2 w-1/6">
                    {Array.isArray(value.type)
                        ? value.type.map((t, i) => (
                            <React.Fragment key={i}>
                                {i > 0 && <span className="text-blue-500"> or </span>}{t}
                            </React.Fragment>
                        ))
                        : (value.type || (isOneOf ? '多选一' : '未指定'))}
                </td>
                <td className="p-2 w-1/3">
                    {value.full_description && <MarkdownRenderer content={value.full_description} />}
                </td>
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
                            path={fieldPath}
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
    oneOfOptions?: any[],
    path: string
}> = ({ properties, depth, requiredFields, isArrayItem, isOneOf, oneOfOptions, path }) => {
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
                            path={`${path}.oneOf[${index}]`}
                        />
                    ))
                ) : (
                    Object.entries(properties).map(([key, value]) => (
                        <PropertyRow key={key} name={key} value={value} depth={depth} requiredFields={requiredFields} path={path} />
                    ))
                )}
            </tbody>
        </table>
    );
};


export const SchemaRenderer: React.FC<{ schema?: SchemaInfo, title: string }> = ({ schema, title }) => {
    const containerRef = React.useRef<HTMLDivElement>(null);

    React.useEffect(() => {
        const handleHashChange = () => {
            const hash = window.location.hash.slice(1);
            if (hash) {
                const element = document.getElementById(hash);
                if (element) {
                    element.scrollIntoView({ behavior: 'smooth' });
                }
            }
        };

        handleHashChange();
        window.addEventListener('hashchange', handleHashChange);
        return () => window.removeEventListener('hashchange', handleHashChange);
    }, []);

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
            <CardContent ref={containerRef}>
                <PropertyTable properties={schema.properties} depth={0} requiredFields={schema.required || []} path={title.toLowerCase().replace(' ', '_')} />
            </CardContent>
        </Card>
    )
}