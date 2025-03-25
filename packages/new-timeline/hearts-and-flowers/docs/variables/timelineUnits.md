## createGametypeTrial()

> **createGametypeTrial**: (`stimulusName`) => `object`

Trial that announces the demo game type.

### Parameters

| Parameter | Type | Description |
| ------ | ------ | ------ |
| `stimulusName` | `string` | The name of the stimulus to be demoed. |

### Returns

`object`

Plugin object displaying the name of the stimulus to be demoed.

***

## createTrial()

> **createTrial**: (`jsPsych`, `stimulusInfo`, `instruction`) => `object`

Trial that shows the stimulus and collects the response.

### Parameters

| Parameter | Type | Default value | Description |
| ------ | ------ | ------ | ------ |
| `jsPsych` | `JsPsych` | `undefined` | The jsPsych object that runs the experiment. |
| `stimulusInfo` | [`StimulusInfo`](../interfaces/StimulusInfo.md) | `undefined` | The stimulus information object that describes the name of the stimulus and its source. |
| `instruction` | `boolean` | `false` | Whether to include instruction text teaching participants how to respond or not. |

### Returns

`object`

Plugin object displaying the stimulus and collecting the response.

---

### Interface: StimulusInfo

Interface for the stimulus information object that describes the name and source of the stimulus for both target sides.

#### Properties

| Property | Type | Default value | Description |
| ------ | ------ | ------ | ------ |
| <a id="same"></a> `same` | `SameStimulusInfo` & `object` | `{ stimulus_name: "heart", stimulus_src: heartIconSvg, target_side: "same" }` | The stimulus information object for the same target side. |
| <a id="opposite"></a> `opposite` | `SameStimulusInfo` & `object` | `{ stimulus_name: "flower", stimulus_src: flowerIconSvg, target_side: "opposite" }` | The stimulus information object for the opposite target side. |

***

## createFeedbackTrial()

> **createFeedbackTrial**: (`jsPsych`) => `object`

Trial that shows feedback after each demo trial.

### Parameters

| Parameter | Type | Description |
| ------ | ------ | ------ |
| `jsPsych` | `JsPsych` | The jsPsych object that runs the experiment. |

### Returns

`object`

jsPsychHtmlKeyboardResponse object displaying feedback after each demo trial that depends on whether the participant answered correctly.

***

## createFixationTrial()

> **createFixationTrial**: (`jsPsych`, `fixationDurationFunction`) => `object`

Trial that shows a fixation cross.

### Parameters

| Parameter | Type | Description |
| ------ | ------ | ------ |
| `jsPsych` | `JsPsych` | The jsPsych object that runs the experiment. |
| `fixationDurationFunction` | () => `number` | The function that returns a random fixation duration from a list of possible durations. |

### Returns

`object`

Plugin object displaying a fixation cross for a random duration.

***

## createDemoSubTimeline()

> **createDemoSubTimeline**: (`jsPsych`, `targetSide`, `stimulusInfo`) => `object`

Creates a demo subtimeline.

### Parameters

| Parameter | Type | Description |
| ------ | ------ | ------ |
| `jsPsych` | `JsPsych` | The jsPsych object that runs the experiment. |
| `targetSide` | keyof StimulusInfo \| `"both"` | The side of the target stimulus. |
| `stimulusInfo` | [`StimulusInfo`](../interfaces/StimulusInfo.md) | The stimulus information object that describes the name of the stimulus and its source. |

### Returns

`object`

A subtimeline that includes a demo trial with stimulus on the left, a demo trial with stimulus on the right, or both.

---

### Interface: StimulusInfo

Interface for the stimulus information object that describes the name and source of the stimulus for both target sides.

#### Properties

| Property | Type | Default value | Description |
| ------ | ------ | ------ | ------ |
| <a id="same"></a> `same` | `SameStimulusInfo` & `object` | `{ stimulus_name: "heart", stimulus_src: heartIconSvg, target_side: "same" }` | The stimulus information object for the same target side. |
| <a id="opposite"></a> `opposite` | `SameStimulusInfo` & `object` | `{ stimulus_name: "flower", stimulus_src: flowerIconSvg, target_side: "opposite" }` | The stimulus information object for the opposite target side. |

***

## createTrialsSubTimeline()

> **createTrialsSubTimeline**: (`jsPsych`, `options`) => `object`

Creates a subtimeline with a set number of trials.

### Parameters

| Parameter | Type | Description |
| ------ | ------ | ------ |
| `jsPsych` | `JsPsych` | The jsPsych object that runs the experiment. |
| `options` | `Partial`\<[`CreateTrialsSubTimelineOptions`](../interfaces/CreateTrialsSubTimelineOptions.md)\> | The options object that includes what kinds of trials to include [same|opposte|both], the number of trials, the weights for how often each type of stimulus appears, the weights for how often the stimulus appears on each side, and the stimulus information containing the name and source of each stimulus type. |

### Returns

`object`

A subtimeline with a set number of trials with the specified options.

---

### Interface: CreateTrialsSubTimelineOptions

Interface for the options parameter in [createTrialsSubTimeline](../variables/timelineUnits.md#createtrialssubtimeline).

#### Properties

| Property | Type | Default value | Description |
| ------ | ------ | ------ | ------ |
| <a id="target_side"></a> `target_side` | `"same"` \| `"opposite"` \| `"both"` | `"both"` | The side of the target stimulus [same\|opposite\|both]. |
| <a id="n_trials"></a> `n_trials` | `number` | `20` | The number of trials to include in the experiment. |
| <a id="target_side_weights"></a> `target_side_weights` | \[`number`, `number`\] | `[1, 1]` | The weights for how often each type of stimulus appears, defined by their target side [same, opposite]. |
| <a id="side_weights"></a> `side_weights` | \[`number`, `number`\] | `[1, 1]` | The weights for how often the stimulus appears on each side [left, right]. |
| <a id="fixation_duration_function"></a> `fixation_duration_function` | () => `number` | `() => jsPsych.randomization.sampleWithReplacement([100, 200, 500, 1000], 1)[0]` | The function that returns a random fixation duration from a list of possible durations. |
| <a id="stimulus_info"></a> `stimulus_info` | [`StimulusInfo`](#StimulusInfo) | `{ same_side_stimulus_name: "heart", same_side_stimulus_src: heartIconSvg, opposite_side_stimulus_name: "flower", opposite_side_stimulus_src: flowerIconSvg }` | The stimulus information object that describes the name and source of the stimulus. |

---

### Interface: StimulusInfo

Interface for the stimulus information object that describes the name and source of the stimulus for both target sides.

#### Properties

| Property | Type | Default value | Description |
| ------ | ------ | ------ | ------ |
| <a id="same"></a> `same` | `SameStimulusInfo` & `object` | `{ stimulus_name: "heart", stimulus_src: heartIconSvg, target_side: "same" }` | The stimulus information object for the same target side. |
| <a id="opposite"></a> `opposite` | `SameStimulusInfo` & `object` | `{ stimulus_name: "flower", stimulus_src: flowerIconSvg, target_side: "opposite" }` | The stimulus information object for the opposite target side. |

***