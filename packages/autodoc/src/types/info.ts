export interface PluginInfo {
    name: string; 
    description: string;
    version: string;
    parameters: Record<string, ParameterInfo>;
    data: Record<string, ParameterInfo>;
    examples: Record<string, ExampleInfo>;
}

export interface ExtensionInfo {
    name: string;
    description: string;
    version: string;
    initializeParameters: Record<string, ParameterInfo>;
    onStartParameters: Record<string, ParameterInfo>;
    onLoadParameters: Record<string, ParameterInfo>;
    onFinishParameters: Record<string, ParameterInfo>;
    data: Record<string, ParameterInfo>;
    examples: Record<string, ExampleInfo>;
}

export interface ParameterInfo {
    type: string;
    default: string;
    array?: boolean;
    description?: string;
    nested?: Record<string, ParameterInfo>;
}

export interface ExampleInfo {
    path: string;
    code: string;
}

export interface SectionTemplate<T> {
    heading: string; 
    render: (info: T) => string;
}
