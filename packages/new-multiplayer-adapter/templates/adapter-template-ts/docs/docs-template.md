# {packageName}

{description}

## Overview

A multiplayer adapter implements the `MultiplayerAdapter` interface from jsPsych and is responsible
only for the network I/O against a specific backend. All higher-level behavior (subscribe replay,
`wait()` fast-path, subscription tracking) lives in jsPsych's `MultiplayerAPI`, so an adapter only
needs to implement: `connect`, `push`, `getAll`, `get`, `subscribe`, and `disconnect`, plus expose a
stable `participantId`.

## Usage

```js
import { initJsPsych } from "jspsych";
import {globalName} from "{npmPackageName}";

const jsPsych = initJsPsych();

// Connect the adapter before running the timeline.
await jsPsych.multiplayer.connect(new {globalName}(/* backend-specific options */));

await jsPsych.run(timeline);
```

## Constructor Options

Document any options your adapter's constructor accepts here.

Option | Type | Default Value | Description
-------|------|---------------|------------
       |      |               |

## Interface methods

Method | Description
-------|------------
`connect()` | Open the communication channel and establish group membership.
`push(data)` | Write this participant's data into the shared group session.
`getAll()` | Read the full current group session (all participants).
`get(participantId)` | Read one participant's data, or `undefined` if they haven't pushed yet.
`subscribe(callback)` | Register a callback fired on every future group session update; returns an unsubscribe function.
`disconnect()` | Close the channel cleanly.

## Install
