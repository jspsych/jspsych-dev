---
"@jspsych/new-extension": patch
"@jspsych/new-timeline": patch
"@jspsych/new-plugin": patch
---

This patch properly escapes special characters in the user input for injection into the generated files. This patch also removes any string replacement enforcings during user input, processing the input strings in the backend after all prompts have been answered.
