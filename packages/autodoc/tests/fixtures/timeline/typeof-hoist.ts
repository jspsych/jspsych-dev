import { JsPsych } from "../../utils.js";

/** the text bag shared across the task */
export const trial_text = {
  /** the go-ahead label */
  next_button: "Next",
  pages: ["a", "b"],
  format: (n: number) => `${n}`,
};

/**
 * shows instructions
 * @param text the strings to render
 */
function createInstructions(text: typeof trial_text = trial_text) {}

/**
 * shows the debrief
 * @param text the strings to render
 */
function createDebrief(text: typeof trial_text = trial_text) {}

/**
 * builds the timeline
 * @param jsPsych the active instance
 * @param config the knobs, including a nested typeof trial_text
 */
export function createTimeline(
  jsPsych: JsPsych,
  { text_object = trial_text }: { text_object?: typeof trial_text } = {},
) {}

export const timelineUnits = { createInstructions, createDebrief };
export const utils = { trial_text };
