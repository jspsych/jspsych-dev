import { GroupSessionData, MultiplayerAdapter, Unsubscribe } from "jspsych";

/**
 * **{packageName}**
 *
 * {description}
 *
 * A jsPsych multiplayer adapter implements the `MultiplayerAdapter` interface so it can be passed
 * to `jsPsych.multiplayer.connect(new {camelCaseName}Adapter(...))`. The adapter is responsible only
 * for network I/O against a specific backend; all higher-level behavior (subscribe replay,
 * `wait()` fast-path, subscription tracking) lives in jsPsych's `MultiplayerAPI`, so it stays
 * consistent across backends.
 *
 * The methods below are stubs — replace the `TODO`s with real calls to your backend.
 *
 * @author {author}
 * @see {@link {documentationUrl}}
 */
class AdapterNameAdapter implements MultiplayerAdapter {
  /** Stable identifier for this participant within the group session namespace. */
  readonly participantId: string;

  /** Local mirror of the shared group session, keyed by participantId. */
  private session: GroupSessionData = {};

  /** Callbacks registered via subscribe(), notified on every future update. */
  private listeners = new Set<(data: GroupSessionData) => void>();

  constructor() {
    // TODO: derive a unique, stable participant id from your backend (e.g. a worker id, an auth
    // uid, or a generated id persisted for the session). It must be the same across reconnects.
    this.participantId = "TODO-participant-id";
  }

  /** Open the communication channel and establish group membership. */
  async connect(): Promise<void> {
    // TODO: connect to your backend, join the group, seed `this.session` with the current state,
    // and wire backend "session changed" events to `this.emit()` so subscribers are notified.
  }

  /** Write this participant's data into the shared group session. */
  async push(data: Record<string, unknown>): Promise<void> {
    // TODO: persist `data` under `this.participantId` on the backend, handling any
    // optimistic-concurrency / version conflicts. The lines below only update the local mirror.
    this.session = { ...this.session, [this.participantId]: data };
    this.emit();
  }

  /** Read the full current group session (all participants). */
  getAll(): GroupSessionData {
    return this.session;
  }

  /** Read one participant's data. Returns undefined if they haven't pushed yet. */
  get(participantId: string): Record<string, unknown> | undefined {
    return this.session[participantId];
  }

  /**
   * Register a callback to fire on every future group session update. Returns an unsubscribe
   * function — call it to stop receiving updates.
   *
   * This must be future-only: `MultiplayerAPI.subscribe()` already replays the current state to
   * new subscribers, so the adapter must NOT replay on registration.
   */
  subscribe(callback: (data: GroupSessionData) => void): Unsubscribe {
    this.listeners.add(callback);
    return () => {
      this.listeners.delete(callback);
    };
  }

  /** Close the channel cleanly. */
  async disconnect(): Promise<void> {
    this.listeners.clear();
    // TODO: tear down the backend connection.
  }

  /** Notify every subscriber with the latest session state. */
  private emit(): void {
    for (const listener of this.listeners) {
      listener(this.session);
    }
  }
}

export default AdapterNameAdapter;
