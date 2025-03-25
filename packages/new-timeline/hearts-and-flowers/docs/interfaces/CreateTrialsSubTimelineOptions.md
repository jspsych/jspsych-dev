# Interface: CreateTrialsSubTimelineOptions

Interface for the options parameter in [createTrialsSubTimeline](../variables/timelineUnits.md#createtrialssubtimeline).

## Properties

| Property | Type | Default value | Description |
| ------ | ------ | ------ | ------ |
| <a id="target_side"></a> `target_side` | `"same"` \| `"opposite"` \| `"both"` | `"both"` | The side of the target stimulus [same\|opposite\|both]. |
| <a id="n_trials"></a> `n_trials` | `number` | `20` | The number of trials to include in the experiment. |
| <a id="target_side_weights"></a> `target_side_weights` | \[`number`, `number`\] | `[1, 1]` | The weights for how often each type of stimulus appears, defined by their target side [same, opposite]. |
| <a id="side_weights"></a> `side_weights` | \[`number`, `number`\] | `[1, 1]` | The weights for how often the stimulus appears on each side [left, right]. |
| <a id="fixation_duration_function"></a> `fixation_duration_function` | () => `number` | `() => jsPsych.randomization.sampleWithReplacement([100, 200, 500, 1000], 1)[0]` | The function that returns a random fixation duration from a list of possible durations. |
| <a id="stimulus_info"></a> `stimulus_info` | [`StimulusInfo`](#StimulusInfo) | `{ same_side_stimulus_name: "heart", same_side_stimulus_src: heartIconSvg, opposite_side_stimulus_name: "flower", opposite_side_stimulus_src: flowerIconSvg }` | The stimulus information object that describes the name and source of the stimulus. |

---

# Interface: StimulusInfo

Interface for the stimulus information object that describes the name and source of the stimulus for both target sides.

## Properties

| Property | Type | Default value | Description |
| ------ | ------ | ------ | ------ |
| <a id="same"></a> `same` | `SameStimulusInfo` & `object` | `{ stimulus_name: "heart", stimulus_src: heartIconSvg, target_side: "same" }` | The stimulus information object for the same target side. |
| <a id="opposite"></a> `opposite` | `SameStimulusInfo` & `object` | `{ stimulus_name: "flower", stimulus_src: flowerIconSvg, target_side: "opposite" }` | The stimulus information object for the opposite target side. |