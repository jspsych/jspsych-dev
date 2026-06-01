import { ParameterType, JsPsychExtension } from "../../utils.js";

interface InitializeParameters {

}

interface OnStartParameters {

}

interface OnLoadParameters {

}

interface OnFinishParameters {

}

/** A test jsPsych extension. */
class TestExtension implements JsPsychExtension {
    static info = {
        name: "test-extension",
        version: "1.0.0",
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
            },
            /** Now let's have a grid. */
            grid: {
                type: ParameterType.COMPLEX,
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
        }
    }
}
