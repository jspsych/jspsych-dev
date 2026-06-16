export enum ParameterType {
    BOOL, STRING, INT, FLOAT, FUNCTION, KEY, KEYS, SELECT, HTML_STRING, IMAGE, AUDIO, VIDEO, OBJECT, COMPLEX
}

export interface JsPsychPlugin<T> {
    trial(display_element: HTMLElement, trial: T): void;
}

export interface JsPsychExtension {
    
}

export type JsPsych = {
    dummy: string;
}
