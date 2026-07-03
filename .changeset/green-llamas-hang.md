---
"@jspsych/new-multiplayer-adapter": minor
"@jspsych/new-extension": minor
"@jspsych/new-timeline": minor
"@jspsych/new-plugin": minor
---

Fix incorrect/broken documentation links generated in README files for new packages.

- Documentation link now points to `docs/<package-name>.md` instead of `README.md`
- Fixed GitHub URL format: use `/blob/main/` instead of `/tree/main/`
- Fixed URL generation when running from a git repository root with a remote: previously the remote URL was ignored and the link was broken; now the full GitHub URL is used
- Renamed `--readme-path` CLI flag to `--documentation-path` and updated the interactive prompt text to reflect its actual purpose (the URL/path to the documentation file, not the README)
