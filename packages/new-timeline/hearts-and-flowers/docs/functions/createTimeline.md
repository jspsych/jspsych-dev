[**@jspsych-timelines/hearts-and-flowers**](../README.md)

***

# Function: createTimeline()

> **createTimeline**(`jsPsych`, `options`): `object`

Creates the main timeline.

## Parameters

| Parameter | Type | Description |
| ------ | ------ | ------ |
| `jsPsych` | `JsPsych` | The jsPsych object that runs the experiment. |
| `options` | `Partial`\<[`CreateTimelineOptions`](../interfaces/CreateTimelineOptions.md)\> | The options object that includes the number of trials, the weights for how often each type of stimulus appears, the weights for how often the stimulus appears on each side, the stimulus information containing the name and source of each stimulus type, whether to include a demo section or not, and the instruction text at the beginning and end of the experiment. |

## Returns

`object`

The main timeline object.

| Name | Type | Default value |
| ------ | ------ | ------ |
| `timeline` | `any`[] | heartsAndFlowersTimeline |
