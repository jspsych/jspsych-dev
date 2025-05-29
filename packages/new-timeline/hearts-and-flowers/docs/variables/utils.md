## generateStimulus()

> **generateStimulus**: (`targetSide`, `stimulusSide`, `stimulusInfo`, `instruction`?) => `string`

Generates the stimulus HTML for a given trial.

### Parameters

| Parameter | Type | Default value | Description |
| ------ | ------ | ------ | ------ |
| `targetSide` | `"same"` \| `"opposite"` | `undefined` | The side of the target stimulus [same\|opposite]. |
| `stimulusSide` | `"left"` \| `"right"` | `undefined` | The side of the stimulus to be displayed [left\|right]. |
| `stimulusInfo` | [`StimulusInfo`](../interfaces/StimulusInfo.md) | `undefined` | The stimulus information object that describes the name and source of the stimulus. |
| `instruction`? | `boolean` | `false` | Whether to include instruction text teaching participants how to respond. |

### Returns

`string`

HTML string representing the stimulus.

---

### Interface: StimulusInfo

Interface for the stimulus information object that describes the name and source of the stimulus for both target sides.

#### Properties

| Property | Type | Default value | Description |
| ------ | ------ | ------ | ------ |
| <a id="same"></a> `same` | `SameStimulusInfo` & `object` | `{ stimulus_name: "heart", stimulus_src: heartIconSvg, target_side: "same" }` | The stimulus information object for the same target side. |
| <a id="opposite"></a> `opposite` | `SameStimulusInfo` & `object` | `{ stimulus_name: "flower", stimulus_src: flowerIconSvg, target_side: "opposite" }` | The stimulus information object for the opposite target side. |

***

## getCorrectResponse()

> **getCorrectResponse**: (`targetSide`, `stimulusSide`) => `"left"` \| `"right"`

Computes the correct response index.

### Parameters

| Parameter | Type | Description |
| ------ | ------ | ------ |
| `targetSide` | `"same"` \| `"opposite"` | The side of the target stimulus [same\|opposite]. |
| `stimulusSide` | `"left"` \| `"right"` | The side of the stimulus to be displayed [left\|right]. |

### Returns

`"left"` \| `"right"`

The correct response index.

***