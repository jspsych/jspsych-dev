---
"@jspsych/new-extension": patch
"@jspsych/new-timeline": patch
"@jspsych/new-plugin": patch
---

This patch fixes the getGitHttpsUrl(await getRemoteGitUrl()) call in cli.js of the new-plugin, new-extension and new-timeline packages so that this line does not crash from calling getGitHttpsUrl() on a promise.
