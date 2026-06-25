import _globalName_ from ".";

describe("adapter", () => {
  it("pushes data and reads it back via get/getAll", async () => {
    const adapter = new _globalName_();
    await adapter.connect();

    await adapter.push({ ready: true });

    expect(adapter.get(adapter.participantId)).toEqual({ ready: true });
    expect(adapter.getAll()[adapter.participantId]).toEqual({ ready: true });

    await adapter.disconnect();
  });

  it("notifies subscribers on update and stops after unsubscribe", async () => {
    const adapter = new _globalName_();
    await adapter.connect();

    const updates: unknown[] = [];
    const unsubscribe = adapter.subscribe((data) => updates.push(data));

    await adapter.push({ score: 1 });
    expect(updates).toHaveLength(1);

    unsubscribe();
    await adapter.push({ score: 2 });
    expect(updates).toHaveLength(1);

    await adapter.disconnect();
  });
});
