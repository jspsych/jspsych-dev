import jsPsychHtmlButtonResponse from '@jspsych/plugin-html-button-response';
import jsPsychHtmlKeyboardResponse from '@jspsych/plugin-html-keyboard-response';
import { JsPsych } from 'jspsych';

/**
 * Interface for the stimulus information object that describes the name and source of the stimulus for both target sides.
 */
interface IStimulusInfo {
    /**
     * The stimulus information object for the same target side.
     * @defaultValue { stimulus_name: "heart", stimulus_src: heartIconSvg, target_side: "same" }
     */
    same: ISameStimulusInfo & {
        target_side: "same";
    };
    /**
     * The stimulus information object for the opposite target side.
     * @defaultValue { stimulus_name: "flower", stimulus_src: flowerIconSvg, target_side: "opposite" }
     */
    opposite: ISameStimulusInfo & {
        target_side: "opposite";
    };
}
interface ISameStimulusInfo {
    stimulus_name: string;
    stimulus_src: string;
}
/**
 * Generates the stimulus HTML for a given trial.
 *
 * @param {"same" | "opposite"} targetSide - The side of the target stimulus [same\|opposite].
 * @param {"left" | "right"} stimulusSide - The side of the stimulus to be displayed [left\|right].
 * @param {IStimulusInfo} stimulusInfo - The stimulus information object that describes the name and source of the stimulus.
 * @param {boolean} [instruction=false] - Whether to include instruction text teaching participants how to respond.
 * @returns {string} HTML string representing the stimulus.
 */
declare function generateStimulus(targetSide: "same" | "opposite", stimulusSide: "left" | "right", stimulusInfo: IStimulusInfo, instruction?: boolean): string;
/**
 * Computes the correct response index.
 *
 * @param {"same" | "opposite"} targetSide - The side of the target stimulus [same\|opposite].
 * @param {"left" | "right"} stimulusSide - The side of the stimulus to be displayed [left\|right].
 * @returns {"left" | "right"} The correct response index.
 */
declare function getCorrectResponse(targetSide: "same" | "opposite", stimulusSide: "left" | "right"): "left" | "right";
/**
 * Trial that announces the demo game type.
 *
 * @param {string} stimulusName - The name of the stimulus to be demoed.
 * @returns {jsPsychHtmlButtonResponse} Plugin object displaying the name of the stimulus to be demoed.
 */
declare function createGametypeTrial(stimulusName: string): {
    type: typeof jsPsychHtmlButtonResponse;
    stimulus: string;
    choices: string[];
    data: {
        trial_type: string;
        stimulus_name: string;
    };
};
/**
 * Trial that shows the stimulus and collects the response.
 *
 * @param {JsPsych} jsPsych - The jsPsych object that runs the experiment.
 * @param {IStimulusInfo} stimulusInfo - The stimulus information object that describes the name of the stimulus and its source.
 * @param {boolean} instruction - Whether to include instruction text teaching participants how to respond or not.
 * @returns {jsPsychHtmlButtonResponse} Plugin object displaying the stimulus and collecting the response.
 */
declare function createTrial(jsPsych: JsPsych, stimulusInfo: IStimulusInfo, instruction?: boolean): {
    type: typeof jsPsychHtmlButtonResponse;
    stimulus: () => string;
    choices: string[];
    data: {
        trial_type: string;
        stimulus_side: () => any;
        target_side: () => any;
        stimulus_name: () => any;
        correct_response: () => "left" | "right";
    };
    on_finish: (data: any) => void;
};
/**
 * Trial that shows feedback after each demo trial.
 *
 * @param {JsPsych} jsPsych - The jsPsych object that runs the experiment.
 * @returns {jsPsychHtmlKeyboardResponse} jsPsychHtmlKeyboardResponse object displaying feedback after each demo trial that depends on whether the participant answered correctly.
 *
 */
declare function createFeedbackTrial(jsPsych: JsPsych): {
    plugin: typeof jsPsychHtmlKeyboardResponse;
    stimulus: () => string;
    trial_duration: number;
    data: {
        trial_type: string;
        correct: () => any;
    };
};
/**
 * Trial that shows a fixation cross.
 *
 * @param {JsPsych} jsPsych - The jsPsych object that runs the experiment.
 * @param {Function} fixationDurationFunction - The function that returns a random fixation duration from a list of possible durations.
 * @returns {jsPsychHtmlKeyboardResponse} Plugin object displaying a fixation cross for a random duration.
 */
declare function createFixationTrial(jsPsych: JsPsych, fixationDurationFunction: () => number): {
    type: typeof jsPsychHtmlKeyboardResponse;
    stimulus: string;
    trial_duration: () => number;
    save_trial_parameters: {
        trial_duration: boolean;
    };
    data: {
        trial_type: string;
    };
};
/**
 * Creates a demo subtimeline.
 *
 * @param {JsPsych} jsPsych - The jsPsych object that runs the experiment.
 * @param {"same" | "opposite" | "both"} targetSide - The side of the target stimulus.
 * @param {IStimulusInfo} stimulusInfo - The stimulus information object that describes the name of the stimulus and its source.
 * @returns {timeline object} A subtimeline that includes a demo trial with stimulus on the left, a demo trial with stimulus on the right, or both.
 */
declare function createDemoSubTimeline(jsPsych: JsPsych, targetSide: keyof IStimulusInfo | "both", stimulusInfo: IStimulusInfo): {
    timeline: ({
        type: typeof jsPsychHtmlButtonResponse;
        stimulus: string;
        choices: string[];
        data: {
            trial_type: string;
            stimulus_name: string;
        };
    } | {
        timeline: {
            timeline: ({
                type: typeof jsPsychHtmlButtonResponse;
                stimulus: () => string;
                choices: string[];
                data: {
                    trial_type: string;
                    stimulus_side: () => any;
                    target_side: () => any;
                    stimulus_name: () => any;
                    correct_response: () => "left" | "right";
                };
                on_finish: (data: any) => void;
            } | {
                plugin: typeof jsPsychHtmlKeyboardResponse;
                stimulus: () => string;
                trial_duration: number;
                data: {
                    trial_type: string;
                    correct: () => any;
                };
            })[];
            loop_function: () => boolean;
        }[];
        timeline_variables: ({
            stimulus_side: string;
            stimulus_name: string;
            stimulus_src: string;
            target_side: "same";
        } | {
            stimulus_side: string;
            stimulus_name: string;
            stimulus_src: string;
            target_side: "opposite";
        })[];
    })[];
};
/**
 * Creates a subtimeline with a set number of trials.
 *
 * @param {JsPsych} jsPsych - The jsPsych object that runs the experiment.
 * @param {CreateTrialsSubTimelineOptions} options - The options object that includes what kinds of trials to
 * include [same|opposte|both], the number of trials, the weights for how often
 * each type of stimulus appears, the weights for how often the stimulus appears on
 * each side, and the stimulus information containing the name and source of each
 * stimulus type.
 *
 * @returns {timeline object} A subtimeline with a set number of trials with the specified options.
 */
declare function createTrialsSubTimeline(jsPsych: JsPsych, options?: Partial<CreateTrialsSubTimelineOptions>): {
    timeline: ({
        type: typeof jsPsychHtmlButtonResponse;
        stimulus: () => string;
        choices: string[];
        data: {
            trial_type: string;
            stimulus_side: () => any;
            target_side: () => any;
            stimulus_name: () => any;
            correct_response: () => "left" | "right";
        };
        on_finish: (data: any) => void;
    } | {
        type: typeof jsPsychHtmlKeyboardResponse;
        stimulus: string;
        trial_duration: () => number;
        save_trial_parameters: {
            trial_duration: boolean;
        };
        data: {
            trial_type: string;
        };
    })[];
    timeline_variables: ({
        stimulus_side: string;
        stimulus_name: string;
        stimulus_src: string;
        target_side: "same";
    } | {
        stimulus_side: string;
        stimulus_name: string;
        stimulus_src: string;
        target_side: "opposite";
    })[];
    sample: {
        type: string;
        size: number;
        weights: number[];
    };
};
/**
 * Interface for the options parameter in {@link createTrialsSubTimeline}.
 */
interface CreateTrialsSubTimelineOptions {
    /**
     * The side of the target stimulus [same\|opposite\|both].
     * @defaultValue "both"
     */
    target_side: "same" | "opposite" | "both";
    /**
     * The number of trials to include in the experiment.
     * @defaultValue 20
     */
    n_trials: number;
    /**
     * The weights for how often each type of stimulus appears, defined by their target side [same, opposite].
     * @defaultValue [1, 1]
     */
    target_side_weights: [same_weight: number, opposite_weight: number];
    /**
     * The weights for how often the stimulus appears on each side [left, right].
     * @defaultValue [1, 1]
     */
    side_weights: [left_weight: number, right_weight: number];
    /**
     * The function that returns a random fixation duration from a list of possible durations.
     * @defaultValue () => jsPsych.randomization.sampleWithReplacement([100, 200, 500, 1000], 1)[0]
     * @returns {number} A function that returns a random fixation duration from a list of possible durations.
     */
    fixation_duration_function: () => number;
    /**
     * The stimulus information object that describes the name and source of the stimulus.
     * @defaultValue { same_side_stimulus_name: "heart", same_side_stimulus_src: heartIconSvg, opposite_side_stimulus_name: "flower", opposite_side_stimulus_src: flowerIconSvg }
     */
    stimulus_info: IStimulusInfo;
}
/**
 * This timeline shows a sequence of hearts and flowers trials. In each trial,
 * participants are shown a stimulus on one side of the screen. There are only
 * two types of stimuli, and participants are taught and expected to respond to
 * one type by pressing the button on the same side as it (traditionally a
 * heart), and to the other by pressing the button on the opposite side
 * (traditionally a flower), as quickly as possible.
 *
 * @param {JsPsych} jsPsych - The jsPsych object that runs the experiment.
 * @param {CreateTimelineOptions} options - The options object that includes the number of trials, the weights
 * for how often each type of stimulus appears, the weights for how often the stimulus
 * appears on each side, the stimulus information containing the name and source
 * of each stimulus type, whether to include a demo section or not, and the instruction
 * text at the beginning and end of the experiment.
 * @returns {timeline object} The main timeline object.
 */
declare function createTimeline(jsPsych: JsPsych, options?: Partial<CreateTimelineOptions>): {
    timeline: any[];
};
declare const timelineUnits: {
    createGametypeTrial: typeof createGametypeTrial;
    createTrial: typeof createTrial;
    createFeedbackTrial: typeof createFeedbackTrial;
    createFixationTrial: typeof createFixationTrial;
    createDemoSubTimeline: typeof createDemoSubTimeline;
    createTrialsSubTimeline: typeof createTrialsSubTimeline;
};
declare const utils: {
    generateStimulus: typeof generateStimulus;
    getCorrectResponse: typeof getCorrectResponse;
};
/**
 * Define and export the interface for the `options` parameter in {@link createTimeline}.
 */
interface CreateTimelineOptions {
    /**
     * The number of trials to include in the experiment.
     * @defaultValue 20
     */
    n_trials: number;
    /**
     * The weights for how often the stimulus appears on each side [left, right].
     * @defaultValue [1, 1]
     */
    side_weights: [left_weight: number, right_weight: number];
    /**
     * The weights for how often each type of stimulus appears, defined by their target side [same, opposite].
     * @defaultValue [1, 1]
     */
    target_side_weights: [same_weight: number, opposite_weight: number];
    /**
     * The function that returns a random fixation duration from a list of possible durations.
     * @defaultValue () => jsPsych.randomization.sampleWithReplacement([100, 200, 500, 1000], 1)[0]
     * @returns {number} A function that returns a random fixation duration from a list of possible durations.
     */
    fixation_duration_function: () => number;
    /**
     * The options object that includes the name and source of each stimulus type.
     * @defaultValue { same_side_stimulus_name: "heart", same_side_stimulus_src: heartIconSvg, opposite_side_stimulus_name: "flower", opposite_side_stimulus_src: flowerIconSvg }
     */
    stimulus_options: Partial<StimulusOptions>;
    /**
     * Whether to include a demo section or not.
     * @defaultValue true
     */
    demo: boolean;
    /**
     * The instruction text at the beginning of the experiment.
     * @defaultValue "Time to play!"
     */
    start_instruction_text: string;
    /**
     * The instruction text at the end of the experiment.
     * @defaultValue "Great job! You're all done."
     */
    end_instruction_text: string;
}
/**
 * Define and export the interface for the `stimulus_options` property in {@link CreateTimelineOptions}.
 */
interface StimulusOptions {
    /**
     * The name of the stimulus to be displayed when the target side is the same side.
     * @defaultValue "heart"
     */
    same_side_stimulus_name: string;
    /**
     * The source of the stimulus to be displayed when the target side is the same side.
     * @defaultValue heartIconSvg
     */
    same_side_stimulus_src: string;
    /**
     * The name of the stimulus to be displayed when the target side is the opposite side.
     * @defaultValue "flower"
     */
    opposite_side_stimulus_name: string;
    /**
     * The source of the stimulus to be displayed when the target side is the opposite side.
     * @defaultValue flowerIconSvg
     */
    opposite_side_stimulus_src: string;
}

export { CreateTimelineOptions, CreateTrialsSubTimelineOptions, ISameStimulusInfo, IStimulusInfo, StimulusOptions, createTimeline, timelineUnits, utils };
