[**@jspsych-timelines/hearts-and-flowers**](../README.md)

***

# Variable: timelineUnits

> `const` **timelineUnits**: `object`

Timeline units that can be used to create a hearts and flowers experiment.

## Type declaration

### createGametypeTrial()

> **createGametypeTrial**: (`stimulusName`) => `object`

Trial that announces the demo game type.

#### Parameters

| Parameter | Type | Description |
| ------ | ------ | ------ |
| `stimulusName` | `string` | The name of the stimulus to be demoed. |

#### Returns

`object`

Plugin object displaying the name of the stimulus to be demoed.

##### type

> **type**: *typeof* `HtmlButtonResponsePlugin` = `jsPsychHtmlButtonResponse`

##### stimulus

> **stimulus**: `string`

##### choices

> **choices**: `string`[]

##### data

> **data**: `object`

###### Type declaration

###### data.trial\_type

> **trial\_type**: `string` = `"demo_gametype"`

###### data.stimulus\_name

> **stimulus\_name**: `string` = `stimulusName`

### createTrial()

> **createTrial**: (`jsPsych`, `stimulusInfo`, `instruction`) => `object`

Trial that shows the stimulus and collects the response.

#### Parameters

| Parameter | Type | Default value | Description |
| ------ | ------ | ------ | ------ |
| `jsPsych` | `JsPsych` | `undefined` | The jsPsych object that runs the experiment. |
| `stimulusInfo` | [`IStimulusInfo`](../interfaces/IStimulusInfo.md) | `undefined` | The stimulus information object that describes the name of the stimulus and its source. |
| `instruction` | `boolean` | `false` | Whether to include instruction text teaching participants how to respond or not. |

#### Returns

`object`

Plugin object displaying the stimulus and collecting the response.

##### type

> **type**: *typeof* `HtmlButtonResponsePlugin` = `jsPsychHtmlButtonResponse`

##### stimulus()

> **stimulus**: () => `string`

###### Returns

`string`

##### choices

> **choices**: `string`[]

##### data

> **data**: `object`

###### Type declaration

###### data.trial\_type

> **trial\_type**: `string`

###### data.stimulus\_side()

> **stimulus\_side**: () => `any`

###### Returns

`any`

###### data.target\_side()

> **target\_side**: () => `any`

###### Returns

`any`

###### data.stimulus\_name()

> **stimulus\_name**: () => `any`

###### Returns

`any`

###### data.correct\_response()

> **correct\_response**: () => `"left"` \| `"right"`

###### Returns

`"left"` \| `"right"`

##### on\_finish()

> **on\_finish**: (`data`) => `void`

###### Parameters

| Parameter | Type |
| ------ | ------ |
| `data` | `any` |

###### Returns

`void`

### createFeedbackTrial()

> **createFeedbackTrial**: (`jsPsych`) => `object`

Trial that shows feedback after each demo trial.

#### Parameters

| Parameter | Type | Description |
| ------ | ------ | ------ |
| `jsPsych` | `JsPsych` | The jsPsych object that runs the experiment. |

#### Returns

`object`

jsPsychHtmlKeyboardResponse object displaying feedback after each demo trial that depends on whether the participant answered correctly.

##### plugin

> **plugin**: *typeof* `HtmlKeyboardResponsePlugin` = `jsPsychHtmlKeyboardResponse`

##### stimulus()

> **stimulus**: () => `string`

###### Returns

`string`

##### trial\_duration

> **trial\_duration**: `number` = `1000`

##### data

> **data**: `object`

###### Type declaration

###### data.trial\_type

> **trial\_type**: `string` = `"demo_feedback"`

###### data.correct()

> **correct**: () => `any`

###### Returns

`any`

### createFixationTrial()

> **createFixationTrial**: (`jsPsych`, `fixationDurationFunction`) => `object`

Trial that shows a fixation cross.

#### Parameters

| Parameter | Type | Description |
| ------ | ------ | ------ |
| `jsPsych` | `JsPsych` | The jsPsych object that runs the experiment. |
| `fixationDurationFunction` | () => `number` | The function that returns a random fixation duration from a list of possible durations. |

#### Returns

`object`

Plugin object displaying a fixation cross for a random duration.

##### type

> **type**: *typeof* `HtmlKeyboardResponsePlugin` = `jsPsychHtmlKeyboardResponse`

##### stimulus

> **stimulus**: `string` = `"<div class='jspsych-hearts-and-flowers-instruction'><h3>+</h3></div>"`

##### trial\_duration()

> **trial\_duration**: () => `number` = `fixationDurationFunction`

###### Returns

`number`

##### save\_trial\_parameters

> **save\_trial\_parameters**: `object`

###### Type declaration

###### save\_trial\_parameters.trial\_duration

> **trial\_duration**: `boolean` = `true`

##### data

> **data**: `object`

###### Type declaration

###### data.trial\_type

> **trial\_type**: `string` = `"fixation"`

### createDemoSubTimeline()

> **createDemoSubTimeline**: (`jsPsych`, `targetSide`, `stimulusInfo`) => `object`

Creates a demo subtimeline.

#### Parameters

| Parameter | Type | Description |
| ------ | ------ | ------ |
| `jsPsych` | `JsPsych` | The jsPsych object that runs the experiment. |
| `targetSide` | keyof IStimulusInfo \| `"both"` | The side of the target stimulus. |
| `stimulusInfo` | [`IStimulusInfo`](../interfaces/IStimulusInfo.md) | The stimulus information object that describes the name of the stimulus and its source. |

#### Returns

`object`

A subtimeline that includes a demo trial with stimulus on the left, a demo trial with stimulus on the right, or both.

##### timeline

> **timeline**: (\{ `type`: *typeof* `HtmlButtonResponsePlugin`; `stimulus`: `string`; `choices`: `string`[]; `data`: \{ `trial_type`: `string`; `stimulus_name`: `string`; \}; \} \| \{ `timeline`: `object`[]; `timeline_variables`: (\{ `target_side`: `"same"`; `stimulus_name`: `string`; `stimulus_src`: `string`; `stimulus_side`: `string`; \} \| \{ `target_side`: `"opposite"`; `stimulus_name`: `string`; `stimulus_src`: `string`; `stimulus_side`: `string`; \})[]; \})[]

### createTrialsSubTimeline()

> **createTrialsSubTimeline**: (`jsPsych`, `options`) => `object`

Creates a subtimeline with a set number of trials.

#### Parameters

| Parameter | Type | Description |
| ------ | ------ | ------ |
| `jsPsych` | `JsPsych` | The jsPsych object that runs the experiment. |
| `options` | `Partial`\<[`CreateTrialsSubTimelineOptions`](../interfaces/CreateTrialsSubTimelineOptions.md)\> | The options object that includes what kinds of trials to include [same|opposte|both], the number of trials, the weights for how often each type of stimulus appears, the weights for how often the stimulus appears on each side, and the stimulus information containing the name and source of each stimulus type. |

#### Returns

`object`

A subtimeline with a set number of trials with the specified options.

##### timeline

> **timeline**: (\{ `type`: *typeof* `HtmlButtonResponsePlugin`; `stimulus`: () => `string`; `choices`: `string`[]; `data`: \{ `trial_type`: `string`; `stimulus_side`: () => `any`; `target_side`: () => `any`; `stimulus_name`: () => `any`; `correct_response`: () => `"left"` \| `"right"`; \}; `on_finish`: (`data`) => `void`; \} \| \{ `type`: *typeof* `HtmlKeyboardResponsePlugin`; `stimulus`: `string`; `trial_duration`: () => `number`; `save_trial_parameters`: \{ `trial_duration`: `boolean`; \}; `data`: \{ `trial_type`: `string`; \}; \})[]

##### timeline\_variables

> **timeline\_variables**: (\{ `target_side`: `"same"`; `stimulus_name`: `string`; `stimulus_src`: `string`; `stimulus_side`: `string`; \} \| \{ `target_side`: `"opposite"`; `stimulus_name`: `string`; `stimulus_src`: `string`; `stimulus_side`: `string`; \})[]

##### sample

> **sample**: `object`

###### Type declaration

###### sample.type

> **type**: `string` = `"with-replacement"`

###### sample.size

> **size**: `number` = `options.n_trials`

###### sample.weights

> **weights**: `number`[]
