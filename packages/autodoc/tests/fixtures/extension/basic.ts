import { ParameterType, JsPsychExtension } from "../../utils.js";

interface InitializeParameters {
  /** 
   * Single-line description.
   * @default 0
   */
  single: number;
  /**
   * Multi-line description. It has two lines for a parameter.
   * Woo.
   * 
   * @default "hello hello"
   */
  double_double: string;
  /**
   * List of stimuli.
   * 
   * @default ["stim1.png", "stim2.png"]
   */
  list_of_stimuli: string[];
}

interface OnStartParameters {
  /**
   * Let's try an object. 
   * 
   * @default { nested_param: 42 }
   */
  nested_object: { nested_param: number };
}

interface OnLoadParameters {
  /**
   * Maybe a grid.
   */
  grid: {
    /**
     * The x coordinate.
     * @default 3
     */
    x: number;
    /**
     * The y coordinate.
     * @default 3
     */
    y: number;
  };
}

interface OnFinishParameters {
  /** 
   * And a boolean grid.
   * 
   * @default [[true, false], [false, true]]
   */
  boolean_param: boolean[][];
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
          },
        },
      },
    },
  };

  // initialize is a lifecycle method and must be excluded from the docs
  initialize(_params: InitializeParameters): Promise<void> {
    return Promise.resolve();
  }

  // on_start is a lifecycle method and must be excluded from the docs
  on_start(_params: OnStartParameters): void {}

  /**
   * Averages a list of samples.
   * @param samples the raw samples
   * @returns the mean value
   */
  static average(samples: number[]): number {
    return 0;
  }

  /** Clears the collected samples. */
  clear(): void {}

  /** internal helper, should not be documented */
  private tick(): void {}
}
