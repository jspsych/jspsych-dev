---
"@jspsych/new-plugin": patch
"@jspsych/new-extension": patch
"@jspsych/new-timeline": patch
---

Fix `getGitHttpsUrl` so the `.git` suffix is stripped at any path boundary, not only at the end of the string. Previously, when a repo's `origin` fetch URL ended in `.git`, the suggested README/docs default in stand-alone mode kept `.git` in the middle of the URL (e.g. `https://github.com/user/repo.git/tree/main/...`), producing a broken link. Also resolve the git repo root once per run in `getCwdInfo` instead of spawning `git` an extra time.
