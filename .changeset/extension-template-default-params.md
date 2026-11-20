---
"@jspsych/new-extension": patch
---

TypeScript extension template: default the `on_start`, `on_load` and `on_finish` parameters to `{}`. jsPsych passes `undefined` to these hooks when a trial lists the extension without `params`, so the empty destructuring pattern threw "Cannot destructure 'undefined' as it is undefined." Fixes jspsych/jsPsych#3542.
