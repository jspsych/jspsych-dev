import { JsPsych } from "../../utils.js";

/** object of UI strings used across the task */
export const trial_text = {
  next: "Next",
  count: 3,
};

/** shared config nation */
interface SharedConfig {
  /** whether to show the thing */
  show?: boolean;
  /** the text bag */
  text_object?: typeof trial_text;
}

/**
 * builds the timeline
 * @param jsPsych the active instance
 * @param config tuning knobs
 */
export function createTimeline(
  jsPsych: JsPsych,
  { show = false, text_object = trial_text }: SharedConfig = {},
) {}

/** advanced practice section */
function createPractice({ show, text_object }: SharedConfig = {}) {}

/**
 * standalone widget configured with its own inline options bag
 */
function createWidget({
  label = "ok",
  repeat = 2,
}: {
  /** button label */
  label?: string;
  /** how many times */
  repeat?: number;
}) {}

export const timelineUnits = { createPractice, createWidget };
export const utils = {};
