## Function: createTimeline()

> **createTimeline**(`jsPsych`, `options`): `object`

This timeline shows a sequence of hearts and flowers trials. In each trial,
participants are shown a stimulus on one side of the screen. There are only
two types of stimuli, and participants are taught and expected to respond to
one type by pressing the button on the same side as it (traditionally a
heart), and to the other by pressing the button on the opposite side
(traditionally a flower), as quickly as possible.

### Parameters

| Parameter | Type | Description |
| ------ | ------ | ------ |
| `jsPsych` | `JsPsych` | The jsPsych object that runs the experiment. |
| `options` | `Partial`\<[`CreateTimelineOptions`](../interfaces/CreateTimelineOptions.md)\> | The options object that includes the number of trials, the weights for how often each type of stimulus appears, the weights for how often the stimulus appears on each side, the stimulus information containing the name and source of each stimulus type, whether to include a demo section or not, and the instruction text at the beginning and end of the experiment. |

### Returns

`object`

The main timeline object.

---

### Interface: CreateTimelineOptions

Define and export the interface for the `options` parameter in [createTimeline](../functions/createTimeline.md).

#### Properties

| Property | Type | Default value | Description |
| ------ | ------ | ------ | ------ |
| <a id="n_trials"></a> `n_trials` | `number` | `20` | The number of trials to include in the experiment. |
| <a id="side_weights"></a> `side_weights` | \[`number`, `number`\] | `[1, 1]` | The weights for how often the stimulus appears on each side [left, right]. |
| <a id="target_side_weights"></a> `target_side_weights` | \[`number`, `number`\] | `[1, 1]` | The weights for how often each type of stimulus appears, defined by their target side [same, opposite]. |
| <a id="fixation_duration_function"></a> `fixation_duration_function` | () => `number` | `() => jsPsych.randomization.sampleWithReplacement([100, 200, 500, 1000], 1)[0]` | The function that returns a random fixation duration from a list of possible durations. |
| <a id="stimulus_options"></a> `stimulus_options` | `Partial`\<[`StimulusOptions`](#StimulusOptions)\> | `{ same_side_stimulus_name: "heart", same_side_stimulus_src: heartIconSvg, opposite_side_stimulus_name: "flower", opposite_side_stimulus_src: flowerIconSvg }` | The options object that includes the name and source of each stimulus type. |
| <a id="demo"></a> `demo` | `boolean` | `true` | Whether to include a demo section or not. |
| <a id="start_instruction_text"></a> `start_instruction_text` | `string` | `"Time to play!"` | The instruction text at the beginning of the experiment. |
| <a id="end_instruction_text"></a> `end_instruction_text` | `string` | `"Great job! You're all done."` | The instruction text at the end of the experiment. |

---

### Interface: StimulusOptions

Define and export the interface for the `stimulus_options` property in [CreateTimelineOptions](CreateTimelineOptions.md).

#### Properties

| Property | Type | Default value | Description |
| ------ | ------ | ------ | ------ |
| <a id="same_side_stimulus_name"></a> `same_side_stimulus_name` | `string` | `"heart"` | The name of the stimulus to be displayed when the target side is the same side. |
| <a id="same_side_stimulus_src"></a> `same_side_stimulus_src` | `string` | `heartIconSvg` | The source of the stimulus to be displayed when the target side is the same side. |
| <a id="opposite_side_stimulus_name"></a> `opposite_side_stimulus_name` | `string` | `"flower"` | The name of the stimulus to be displayed when the target side is the opposite side. |
| <a id="opposite_side_stimulus_src"></a> `opposite_side_stimulus_src` | `string` | `flowerIconSvg` | The source of the stimulus to be displayed when the target side is the opposite side. |