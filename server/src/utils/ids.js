import crypto from 'crypto';

// Human-readable, sortable-ish business numbers with enough entropy that
// batch inserts (Model.create([...])) can never collide within a millisecond.
export function makeNumber(prefix) {
  return (
    prefix +
    '-' +
    Date.now().toString(36).toUpperCase() +
    crypto.randomBytes(4).toString('hex').toUpperCase()
  );
}
