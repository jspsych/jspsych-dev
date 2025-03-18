[**@jspsych-timelines/hearts-and-flowers**](../README.md)

***

# Variable: timelineUnits

> `const` **timelineUnits**: `object`

## Type declaration

| Name | Type |
| ------ | ------ |
| <a id="creategametypetrial"></a> `createGametypeTrial` | (`stimulusName`) => `object` |
| <a id="createtrial"></a> `createTrial` | (`jsPsych`, `stimulusInfo`, `instruction`) => `object` |
| <a id="createfeedbacktrial"></a> `createFeedbackTrial` | (`jsPsych`) => `object` |
| <a id="createfixationtrial"></a> `createFixationTrial` | (`jsPsych`, `fixationDurationFunction`) => `object` |
| <a id="createdemosubtimeline"></a> `createDemoSubTimeline` | (`jsPsych`, `targetSide`, `stimulusInfo`) => (\{ `type`: *typeof* `HtmlButtonResponsePlugin`; `stimulus`: `string`; `choices`: `string`[]; `data`: \{ `trial_type`: `string`; `stimulus_name`: `string`; \}; \} \| \{ `timeline`: `object`[]; `timeline_variables`: (\{ `stimulus_name`: `string`; `stimulus_src`: `string`; `target_side`: `"same"`; `stimulus_side`: `string`; \} \| \{ `stimulus_name`: `string`; `stimulus_src`: `string`; `target_side`: `"opposite"`; `stimulus_side`: `string`; \})[]; \})[] |
| <a id="createtrialssubtimeline"></a> `createTrialsSubTimeline` | (`jsPsych`, `options`) => `object` |
