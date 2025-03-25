[**@jspsych-timelines/hearts-and-flowers**](../README.md)

***

# Variable: utils

> `const` **utils**: `object`

Utility functions that can be used to create a hearts and flowers experiment.

## Type declaration

### generateStimulus()

> **generateStimulus**: (`targetSide`, `stimulusSide`, `stimulusInfo`, `instruction`?) => `string`

Generates the stimulus HTML for a given trial.

#### Parameters

| Parameter | Type | Default value | Description |
| ------ | ------ | ------ | ------ |
| `targetSide` | `"same"` \| `"opposite"` | `undefined` | The side of the target stimulus [same\|opposite]. |
| `stimulusSide` | `"left"` \| `"right"` | `undefined` | The side of the stimulus to be displayed [left\|right]. |
| `stimulusInfo` | [`IStimulusInfo`](../interfaces/IStimulusInfo.md) | `undefined` | The stimulus information object that describes the name and source of the stimulus. |
| `instruction`? | `boolean` | `false` | Whether to include instruction text teaching participants how to respond. |

#### Returns

`string`

HTML string representing the stimulus.

### getCorrectResponse()

> **getCorrectResponse**: (`targetSide`, `stimulusSide`) => `"left"` \| `"right"`

Computes the correct response index.

#### Parameters

| Parameter | Type | Description |
| ------ | ------ | ------ |
| `targetSide` | `"same"` \| `"opposite"` | The side of the target stimulus [same\|opposite]. |
| `stimulusSide` | `"left"` \| `"right"` | The side of the stimulus to be displayed [left\|right]. |

#### Returns

`"left"` \| `"right"`

The correct response index.
