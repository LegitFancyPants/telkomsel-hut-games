export const leaderboardEventEmitter = new (class EventEmitter {
  private listeners: Set<(data: any) => void> = new Set();

  subscribe(fn: (data: any) => void) {
    this.listeners.add(fn);
    return () => this.listeners.delete(fn);
  }

  emit(data: any) {
    this.listeners.forEach((fn) => fn(data));
  }
})();
