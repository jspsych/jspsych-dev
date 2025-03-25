[**@jspsych-timelines/hearts-and-flowers**](../README.md)

***

# Function: createTimeline()

> **createTimeline**(`jsPsych`, `options`): `object`

This timeline shows a sequence of hearts and flowers trials. In each trial,
participants are shown a stimulus on one side of the screen. There are only
two types of stimuli, and participants are taught and expected to respond to
one type by pressing the button on the same side as it (traditionally a
heart), and to the other by pressing the button on the opposite side
(traditionally a flower), as quickly as possible.

## Parameters

| Parameter | Type | Description |
| ------ | ------ | ------ |
| `jsPsych` | `JsPsych` | The jsPsych object that runs the experiment. |
| `options` | `Partial`\<[`CreateTimelineOptions`](../interfaces/CreateTimelineOptions.md)\> | The options object that includes the number of trials, the weights for how often each type of stimulus appears, the weights for how often the stimulus appears on each side, the stimulus information containing the name and source of each stimulus type, whether to include a demo section or not, and the instruction text at the beginning and end of the experiment. |

## Returns

`object`

The main timeline object.

### timeline

> **timeline**: `any`[] = `heartsAndFlowersTimeline`
