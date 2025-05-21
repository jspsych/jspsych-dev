# Interface: StimulusInfo

Interface for the stimulus information object that describes the name and source of the stimulus for both target sides.

## Properties

| Property | Type | Default value | Description |
| ------ | ------ | ------ | ------ |
| <a id="same"></a> `same` | `SameStimulusInfo` & `object` | `{ stimulus_name: "heart", stimulus_src: heartIconSvg, target_side: "same" }` | The stimulus information object for the same target side. |
| <a id="opposite"></a> `opposite` | `SameStimulusInfo` & `object` | `{ stimulus_name: "flower", stimulus_src: flowerIconSvg, target_side: "opposite" }` | The stimulus information object for the opposite target side. |