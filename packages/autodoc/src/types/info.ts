export interface PluginInfo {
    name: string;
    description: string;
    version: string; // gathered from package.json
    parameters: Record<string, ParameterInfo>;
    data: Record<string, ParameterInfo>;
    /** public (static or instance) helper methods, excluding the required `trial`/`simulate` lifecycle methods */
    functions: Record<string, FunctionInfo>;
    examples: Record<string, ExampleInfo>;
}

export interface ExtensionInfo {
    name: string;
    description: string;
    version: string; // gathered from package.json
    initializeParameters: Record<string, ParameterInfo>;
    onStartParameters: Record<string, ParameterInfo>;
    onLoadParameters: Record<string, ParameterInfo>;
    onFinishParameters: Record<string, ParameterInfo>;
    data: Record<string, ParameterInfo>;
    /** public (static or instance) helper methods, excluding the required `initialize`/`on_start`/`on_load`/`on_finish` lifecycle methods */
    functions: Record<string, FunctionInfo>;
    examples: Record<string, ExampleInfo>;
}

export interface TimelineInfo {
    name: string; // gathered from package.json, since createTimeline has no equivalent of a plugin's `info.name`
    description: string; // gathered from package.json, since createTimeline has no class-level JSDoc to extract
    version: string; // also gathered from package.json
    createTimeline: TimelineHelperInfo; // only one: no need to attach name
    timelineUnits: Record<string, TimelineHelperInfo>;
    utils: Record<string, TimelineHelperInfo>;
    /** common interfaces used by 2 or more functions */
    interfaces: Record<string, TimelineInterfaceInfo>;
    examples: Record<string, ExampleInfo>;
}

/** name is attached via record */
export interface TimelineInterfaceInfo {
    description: string;
    interfaceParameters: Record<string, ParameterInfo>;
}

/** name is attached via record */
export interface TimelineHelperInfo {
    description: string;
    helperParameters: Record<string, ParameterInfo>;
}

/** name is attached via record */
export interface FunctionInfo {
    description: string;
    isStatic: boolean;
    parameters: Record<string, ParameterInfo>;
    /** not present = returns nothing/void */
    returns?: ReturnInfo;
    examples: string[];
}

export interface ReturnInfo {
    type: string;
    array?: boolean;
    description?: string;
}

/** name is attached via record */
export interface ParameterInfo {
    type: string;
    default: string;
    array?: boolean;
    description?: string;
    nested?: Record<string, ParameterInfo>;
    /** used instead of `nested` if an interface is used across more than 2 functions (for timeline parsing) */
    interfaceRef?: string;
}

/** name is attached via record */
export interface ExampleInfo {
    title: string;
    hasCustomTitle: boolean;
    path: string;
    displayPath: string;
    code: string;
}

export interface SectionTemplate<T> {
    heading: string;
    render: (info: T) => string;
}

export interface AutodocConfig {
    plugin?: SectionTemplate<PluginInfo>[];
    extension?: SectionTemplate<ExtensionInfo>[];
    timeline?: SectionTemplate<TimelineInfo>[];
}
