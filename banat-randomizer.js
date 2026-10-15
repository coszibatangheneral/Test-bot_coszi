"use strict";

/**
 * ECLIPSE Banat Randomizer
 * ------------------------
 * One shared random-selection engine for Banat pools.
 *
 * Responsibilities:
 *   - weighted choices
 *   - shuffle bags / no-repeat rotation
 *   - boundary protection between rotations
 *   - trigger-variant selection
 *
 * It does NOT own human text transformation, timing, typing, or conversation
 * state. Those remain in their existing modules.
 */

const bags = new Map();
const MAX_BAGS = 1000;

function keyFor(scope, pool) {
  return `${String(scope || "global")}::${String(pool || "default")}`;
}

function normalizePool(values) {
  if (!Array.isArray(values)) return [];
  const seen = new Set();
  const output = [];

  for (const value of values) {
    const text = String(value == null ? "" : value).trim();
    if (!text) continue;
    const key = text.toLowerCase().normalize("NFKC").replace(/\s+/g, " ");
    if (seen.has(key)) continue;
    seen.add(key);
    output.push(text);
  }

  return output;
}

function weightedPick(entries, random = Math.random) {
  if (!Array.isArray(entries) || !entries.length) return null;

  const normalized = entries
    .map((entry) => {
      if (entry && typeof entry === "object" && !Array.isArray(entry)) {
        return {
          value: entry.value,
          weight: Math.max(0, Number(entry.weight) || 0),
        };
      }
      return { value: entry, weight: 1 };
    })
    .filter((entry) => entry.value != null && entry.weight > 0);

  if (!normalized.length) return null;

  const total = normalized.reduce((sum, entry) => sum + entry.weight, 0);
  let cursor = random() * total;

  for (const entry of normalized) {
    cursor -= entry.weight;
    if (cursor <= 0) return entry.value;
  }

  return normalized[normalized.length - 1].value;
}

function shuffle(values, random = Math.random) {
  const output = [...values];
  for (let i = output.length - 1; i > 0; i -= 1) {
    const j = Math.floor(random() * (i + 1));
    [output[i], output[j]] = [output[j], output[i]];
  }
  return output;
}

function buildBag(pool, random = Math.random, previous = null) {
  const normalized = normalizePool(pool);
  if (!normalized.length) return [];

  let bag = shuffle(normalized, random);

  // Never let the first item of a fresh rotation equal the item that ended
  // the previous rotation. This closes the most obvious boundary repeat.
  if (previous && bag.length > 1 && bag[0] === previous) {
    const swapIndex = 1 + Math.floor(random() * (bag.length - 1));
    [bag[0], bag[swapIndex]] = [bag[swapIndex], bag[0]];
  }

  return bag;
}

function pickFromBag(scope, poolName, pool, options = {}) {
  const normalized = normalizePool(pool);
  if (!normalized.length) return null;

  const key = keyFor(scope, poolName);
  let state = bags.get(key);

  const samePool =
    state &&
    state.pool.length === normalized.length &&
    state.pool.every((item, index) => item === normalized[index]);

  if (!samePool || !state || !state.remaining.length) {
    state = {
      pool: normalized,
      remaining: buildBag(
        normalized,
        options.random || Math.random,
        state?.last || null
      ),
      last: state?.last || null,
      updatedAt: Date.now(),
    };
  }

  const avoid = new Set(
    Array.isArray(options.avoidValues)
      ? options.avoidValues.map((value) =>
          String(value || "").toLowerCase().normalize("NFKC").replace(/\s+/g, " ").trim()
        )
      : []
  );

  // Keep the full pool as the bag identity while allowing only currently
  // eligible values to be selected. This prevents matching-trigger subsets
  // from resetting the no-repeat rotation.
  const eligible = Array.isArray(options.eligibleValues)
    ? new Set(options.eligibleValues.map((value) =>
        String(value || "").toLowerCase().normalize("NFKC").replace(/\s+/g, " ").trim()
      ))
    : null;

  let selectedIndex = -1;

  // Prefer an unused item that is not in the caller's short-term memory.
  // The bag itself still guarantees that every pool item is consumed once.
  for (let i = 0; i < state.remaining.length; i += 1) {
    const keyValue = String(state.remaining[i] || "")
      .toLowerCase()
      .normalize("NFKC")
      .replace(/\s+/g, " ")
      .trim();

    if ((!eligible || eligible.has(keyValue)) && !avoid.has(keyValue)) {
      selectedIndex = i;
      break;
    }
  }

  // Never bypass an eligibility filter. If the currently matching trigger
  // variants are all temporarily avoided, return null so the caller can
  // fall back to its normal conversational path instead of selecting an
  // unrelated trigger.

  const selected =
    selectedIndex >= 0
      ? state.remaining.splice(selectedIndex, 1)[0]
      : null;

  state.last = selected || state.last;
  state.updatedAt = Date.now();
  bags.set(key, state);

  if (bags.size > MAX_BAGS) {
    const cutoff = Date.now() - 30 * 60 * 1000;
    for (const [bagKey, bagState] of bags) {
      if (bagState.updatedAt < cutoff) bags.delete(bagKey);
    }
  }

  return selected;
}

function pickUnusedWeighted(scope, poolName, entries, options = {}) {
  if (!Array.isArray(entries) || !entries.length) return null;

  const normalized = entries
    .map((entry) => {
      if (entry && typeof entry === "object" && !Array.isArray(entry)) {
        return {
          value: String(entry.value == null ? "" : entry.value).trim(),
          weight: Math.max(0, Number(entry.weight) || 0),
        };
      }
      return {
        value: String(entry == null ? "" : entry).trim(),
        weight: 1,
      };
    })
    .filter((entry) => entry.value && entry.weight > 0);

  if (!normalized.length) return null;

  const values = normalizePool(normalized.map((entry) => entry.value));
  const weightMap = new Map(normalized.map((entry) => [entry.value.toLowerCase(), entry.weight]));
  const random = options.random || Math.random;
  const key = keyFor(scope, poolName);
  let state = bags.get(key);

  const samePool =
    state &&
    state.pool.length === values.length &&
    state.pool.every((item, index) => item === values[index]);

  if (!samePool || !state || !state.remaining.length) {
    state = {
      pool: values,
      remaining: [...values],
      last: state?.last || null,
      updatedAt: Date.now(),
    };
  }

  const avoid = new Set(
    Array.isArray(options.avoidValues)
      ? options.avoidValues.map((value) => String(value || "").toLowerCase().trim())
      : []
  );

  const candidates = state.remaining.filter((value) => !avoid.has(value.toLowerCase()));
  const source = candidates.length ? candidates : state.remaining;
  if (!source.length) return null;

  const selected = weightedPick(
    source.map((value) => ({
      value,
      weight: weightMap.get(value.toLowerCase()) || 1,
    })),
    random
  );

  const index = state.remaining.indexOf(selected);
  if (index >= 0) state.remaining.splice(index, 1);

  state.last = selected || state.last;
  state.updatedAt = Date.now();
  bags.set(key, state);
  return selected || null;
}

function pickTriggerVariant(scope, triggerName, variants, options = {}) {
  return pickFromBag(scope, `trigger:${triggerName}`, variants, options);
}

function clear(scope = null) {
  if (scope == null) {
    bags.clear();
    return;
  }

  const prefix = `${String(scope)}::`;
  for (const key of bags.keys()) {
    if (key.startsWith(prefix)) bags.delete(key);
  }
}

module.exports = {
  weightedPick,
  normalizePool,
  shuffle,
  pickFromBag,
  pickUnusedWeighted,
  pickTriggerVariant,
  clear,
};
