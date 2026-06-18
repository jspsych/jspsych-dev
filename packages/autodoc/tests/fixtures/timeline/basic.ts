import { JsPsych } from "../../utils.js";

/** little configuration nation */
interface StimulusConfig {
    /** some stuff */
    stuff: number;
    /** some things */
    things: boolean;
}

/** bigggg configggg */
interface BigConfig {
    /** big thing */
    big: string;
    /** little thing */
    little: number;
    /** text thing */
    extra: StimulusConfig;
}

/**
 * creates a fixation. Gasp.
 * 
 * @param fixation text to be shown
 * @param duration time to show fixation
 */
function createFixation(fixation: string, duration: number) {

}

/**
 * doohickeyinator
 */
function createStimulus({
    stimuli, duration, reverse
}: { 
    stimuli: string[], 
    duration: Array<number>, 
    reverse: boolean
}) {

}

/**
 * AAAA
 * @param hello HELP ME
 */
function createFeedbackTrial(feedbackMessage: string, canShow: boolean) {

}

/**
 * can you show the creature or not
 */
function canShowCreature(sentiment: string, config?: BigConfig ): boolean {
    return true;
}

function notShown() {

}

/**
 * Generates a really cool and awesome thing
 */
export function createTimeline(jsPsych: JsPsych, config: BigConfig = {
    big: "hello",
    little: -99,
    extra: { stuff: 3, things: true }
}) {

}

export const timelineUnits = {
    createFixation,
    createStimulus,
    createFeedbackTrial
}

export const utils = {
    canShowCreature
}
