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

export interface TimelineInfo {
    name: string;
    description: string; // TODO: just gather this from package.json
    version: string;
    createTimeline: TimelineHelperInfo; // only one: no need to attach name
    timelineUnits: Record<string, TimelineHelperInfo>;
    utils: Record<string, TimelineHelperInfo>;
    examples: Record<string, ExampleInfo>;
}

// name is attached via Record
export interface TimelineHelperInfo {
    description: string;
    helperParameters: Record<string, ParameterInfo>;
}

// name is attached via Record
export interface ParameterInfo {
    type: string;
    default: string;
    array?: boolean;
    description?: string;
    nested?: Record<string, ParameterInfo>;
}

// name is attached via Record
export interface ExampleInfo {
    path: string;
    code: string;
}

export interface SectionTemplate<T> {
    heading: string; 
    render: (info: T) => string;
}
