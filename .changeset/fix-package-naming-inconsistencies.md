---
"@jspsych/new-plugin": patch
"@jspsych/new-extension": patch
"@jspsych/new-timeline": patch
---

Fix inconsistent IIFE package naming and redundant plugin global name prefix. Plugins now generate global names as `jsPsych{PackageName}` instead of `jsPsychPlugin{PackageName}`. All templates and CLI-generated comments now consistently reference `index.browser.js` instead of `index.global.js`.
