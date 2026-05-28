// import { JsPsych ... }

// import { version } ...

import { ParameterType, JsPsychPlugin } from "../../utils.js"

/** A test jsPsych plugin. */
class TestPlugin implements JsPsychPlugin<typeof info.parameters> {
    trial(_display_element: HTMLElement, _trial: typeof info.parameters): void {}
}

const info = <const>{
    name: "test-plugin",
    version: "1.0.0",
    parameters: {
        /** Single-line description. */
        single: {
            type: ParameterType.STRING,
            default: undefined,
        },
        /**
         * Multi-line description.
         * It has two lines for a parameter.
         */
        double_double: {
            type: ParameterType.INT,
            default: 42,
        },
        /** Imagine if we had an array. */
        list_of_stimuli: {
            type: ParameterType.IMAGE,
            default: [],
            array: true,
        },
        /** Now let's have a grid. */
        grid: {
            type: ParameterType.COMPLEX,
            default: null,
            nested: {
                /** With an x-coordinate. */
                x_coord: {
                    type: ParameterType.FLOAT,
                },
                /** And a y-coordinate. */
                y_coord: {
                    type: ParameterType.FLOAT,
                }
            }
        }
    }, 
    data: {
        /** Data parameter description. */
        data_param: {
            type: ParameterType.FLOAT,
        },
        /**
         * Multi-line data parameter description.
         * It has two lines for data.
         */
        double_data: {
            type: ParameterType.BOOL,
        }
    }
}