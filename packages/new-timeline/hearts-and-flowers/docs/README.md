**@jspsych-timelines/hearts-and-flowers**

***

# @jspsych-timelines/hearts-and-flowers

## Variables

### timelineUnits

> `const` **timelineUnits**: `object`

#### Type declaration

| Name | Type |
| ------ | ------ |
| <a id="createdemosubtimeline"></a> `createDemoSubTimeline` | (`jsPsych`, `targetSide`, `stimulusInfo`) => (\{ `choices`: `string`[]; `data`: \{ `stimulus_name`: `string`; `trial_type`: `string`; \}; `stimulus`: `string`; `type`: *typeof* `HtmlButtonResponsePlugin`; \} \| \{ `timeline`: `object`[]; `timeline_variables`: (\{ `stimulus_name`: `string`; `stimulus_side`: `string`; `stimulus_src`: `string`; `target_side`: `"same"`; \} \| \{ `stimulus_name`: `string`; `stimulus_side`: `string`; `stimulus_src`: `string`; `target_side`: `"opposite"`; \})[]; \})[] |
| <a id="createfeedbacktrial"></a> `createFeedbackTrial` | (`jsPsych`) => `object` |
| <a id="createfixationtrial"></a> `createFixationTrial` | (`jsPsych`, `fixationDurationFunction`) => `object` |
| <a id="creategametypetrial"></a> `createGametypeTrial` | (`stimulusName`) => `object` |
| <a id="createtrial"></a> `createTrial` | (`jsPsych`, `stimulusInfo`, `instruction`) => `object` |
| <a id="createtrialssubtimeline"></a> `createTrialsSubTimeline` | (`jsPsych`, `options`) => `object` |

***

### utils

> `const` **utils**: `object`

#### Type declaration

| Name | Type |
| ------ | ------ |
| <a id="generatestimulus"></a> `generateStimulus` | (`targetSide`, `stimulusSide`, `stimulusInfo`, `instruction`) => `string` |
| <a id="getcorrectresponse"></a> `getCorrectResponse` | (`targetSide`, `stimulusSide`) => `"left"` \| `"right"` |

## Functions

### createTimeline()

> **createTimeline**(`jsPsych`, `options`): `object`

Creates the main timeline.

#### Parameters

| Parameter | Type | Description |
| ------ | ------ | ------ |
| `jsPsych` | `JsPsych` | The jsPsych object that runs the experiment. |
| `options` | `Partial`\<\{ `demo`: `boolean`; `end_instruction_text`: `string`; `fixation_duration_function`: () => `number`; `n_trials`: `number`; `side_weights`: \[`number`, `number`\]; `start_instruction_text`: `string`; `stimulus_options`: `Partial`\<\{ `opposite_side_stimulus_name`: `string`; `opposite_side_stimulus_src`: `string`; `same_side_stimulus_name`: `string`; `same_side_stimulus_src`: `string`; \}\>; `target_side_weights`: \[`number`, `number`\]; \}\> | The options object that includes the number of trials, the weights for how often each type of stimulus appears, the weights for how often the stimulus appears on each side, the stimulus information containing the name and source of each stimulus type, whether to include a demo section or not, and the instruction text at the beginning and end of the experiment. |

#### Returns

`object`

The main timeline object.

| Name | Type | Default value |
| ------ | ------ | ------ |
| `timeline` | `any`[] | heartsAndFlowersTimeline |
