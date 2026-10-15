"use strict";

/**
 * ECLIPSE Human Delay
 * -------------------
 * Pure timing math only.
 *
 * Restores the richer Banat timing model:
 *   - configurable hesitation
 *   - chill / normal / rushed conversation modes
 *   - momentum
 *   - incoming-message length
 *   - word complexity
 *   - emoji timing
 *   - punctuation / ellipsis weighting
 *   - burst pauses
 *
 * No Messenger API, queues, or timers live here.
 */

const DEFAULT_MAX_DELAY_MS = 6500;

function clamp(value, min, max) {
  return Math.max(min, Math.min(max, value));
}

function seededJitter(random, min, max) {
  return min + random() * (max - min);
}

function countWords(text) {
  return String(text || "").trim().split(/\s+/).filter(Boolean).length;
}

function countSentences(text) {
  return Math.max(1, String(text || "").split(/[.!?]+/).filter(Boolean).length);
}

function punctuationPauseMs(text) {
  const value = String(text || "");
  return (value.match(/,/g) || []).length * 42 +
    (value.match(/[;:]/g) || []).length * 58 +
    (value.match(/[!?]/g) || []).length * 82 +
    (value.match(/\.\.\./g) || []).length * 150;
}

function countEmoji(text) {
  return (String(text || "").match(/[\u{1F300}-\u{1FAFF}]/gu) || []).length;
}

function wordComplexity(word) {
  const clean = String(word || "").replace(/[^A-Za-z0-9']/g, "");
  if (!clean) return 0;

  let score = clean.length >= 7 ? 1 : 0;
  if (/[^aeiou]{4,}/i.test(clean)) score += 0.5;
  if (/\d/.test(clean)) score += 0.25;

  return score;
}

function complexityScore(text) {
  const words = String(text || "").trim().split(/\s+/).filter(Boolean);
  if (!words.length) return 0;

  return words.reduce((sum, word) => sum + wordComplexity(word), 0) / words.length;
}

function normalizeMode(context = {}) {
  if (context.mode === "chill" || context.mode === "rushed") {
    return context.mode;
  }
  return "normal";
}

function responseHesitationMs(text, context = {}, options = {}) {
  const random = typeof options.random === "function"
    ? options.random
    : Math.random;

  const value = String(text || "").trim();
  const words = countWords(value);
  const recent = Math.min(8, Math.max(0, Number(context.recentMessages) || 0));
  const incomingWords = Math.max(
    0,
    Number.isFinite(Number(context.incomingWords))
      ? Number(context.incomingWords)
      : countWords(context.incomingText || "")
  );

  const hesitationRate = clamp(
    Number.isFinite(Number(options.hesitationRate))
      ? Number(options.hesitationRate)
      : 0.11,
    0,
    0.35
  );

  let delay = 220 + Math.min(900, words * 35);

  const mode = normalizeMode(context);
  if (mode === "chill") delay += 120;
  if (mode === "rushed") delay -= 90;

  if (incomingWords >= 18) delay += 90;
  if (incomingWords >= 35) delay += 60;

  if (recent >= 3) delay += 40;
  if (recent >= 5) delay -= 70;

  if (
    value.length > 12 &&
    random() < hesitationRate
  ) {
    delay += seededJitter(random, 120, 600);
  }

  const momentum = Math.max(0, Number(context.momentum) || 0);
  delay -= Math.min(120, momentum * 12);

  delay += (countSentences(value) - 1) * seededJitter(random, 25, 100);
  delay += seededJitter(random, -130, 130);

  return Math.round(
    clamp(delay, 120, options.max || 2200)
  );
}

function typingCadenceMs(text, context = {}, options = {}) {
  const random = typeof options.random === "function"
    ? options.random
    : Math.random;

  const value = String(text || "").trim();
  if (!value) return 350;

  const words = value.split(/\s+/).filter(Boolean);
  const complexity = complexityScore(value);
  const emojiCount = countEmoji(value);

  const minCps = Math.max(3.5, Number(options.minCps) || 5.5);
  const maxCps = Math.max(minCps, Number(options.maxCps) || 10.5);
  const cps = seededJitter(random, minCps, maxCps);

  let delay = (value.length / cps) * 1000;

  // More complex words take a little longer to type.
  delay += complexity * words.length * 55;

  // Natural pauses around punctuation.
  delay += (value.match(/,/g) || []).length * 45;
  delay += punctuationPauseMs(value);
  delay += (value.match(/[!?]/g) || []).length * 75;
  delay += (value.match(/[;:]/g) || []).length * 55;
  delay += (value.match(/\./g) || []).length * 55;
  delay += (value.match(/\.\.\./g) || []).length * 120;

  // Emoji are not typed like normal letters and add small selection/placement time.
  delay += Math.min(6, emojiCount) * 12;

  const mode = normalizeMode(context);
  if (mode === "chill") delay *= 1.12;
  if (mode === "rushed") delay *= 0.78;

  const momentum = Math.max(0, Number(context.momentum) || 0);
  if (momentum >= 4) delay *= 0.88;
  else if (momentum >= 3) delay *= 0.94;

  // Recent incoming activity can make the response feel quicker.
  const incomingWords = Math.max(
    0,
    Number(context.incomingWords) || countWords(context.incomingText || "")
  );
  if (incomingWords >= 30) delay *= 0.96;

  delay += seededJitter(
    random,
    -Math.min(900, 180 + delay * 0.28),
    Math.min(900, 180 + delay * 0.28)
  );

  return Math.round(
    clamp(delay, 350, options.max || DEFAULT_MAX_DELAY_MS)
  );
}

function typingBurstsMs(text, context = {}, options = {}) {
  const random = typeof options.random === "function"
    ? options.random
    : Math.random;

  const words = countWords(text);
  if (words < 4) {
    return pickBurst(random, [0, 0, 70, 110, 160]);
  }

  let chance = 0.24;
  const mode = normalizeMode(context);

  if (mode === "chill") chance += 0.08;
  if (mode === "rushed") chance -= 0.06;

  const momentum = Math.max(0, Number(context.momentum) || 0);
  if (momentum >= 5) chance -= 0.05;

  if (random() >= clamp(chance, 0, 1)) return 0;

  return pickBurst(random, [80, 110, 140, 180, 220, 260, 320]);
}

function pickBurst(random, values) {
  return values[Math.floor(random() * values.length)] || 0;
}

function calculateHumanDelay(text, context = {}, options = {}) {
  const reaction = responseHesitationMs(text, context, options);
  const typing = typingCadenceMs(text, context, options) +
    typingBurstsMs(text, context, options);

  const maxTypingMs = Number(options.maxTypingMs) || DEFAULT_MAX_DELAY_MS;
  const typingClamped = clamp(typing, 350, maxTypingMs);

  return {
    reactionMs: reaction,
    typingMs: typingClamped,
    totalMs: reaction + typingClamped,
    profile: {
      mode: normalizeMode(context),
      momentum: Math.max(0, Number(context.momentum) || 0),
      incomingWords: Math.max(
        0,
        Number(context.incomingWords) ||
          countWords(context.incomingText || "")
      ),
      wordComplexity: complexityScore(text),
      emojiCount: countEmoji(text),
    },
  };
}

module.exports = {
  clamp,
  countWords,
  countEmoji,
  wordComplexity,
  complexityScore,
  responseHesitationMs,
  typingCadenceMs,
  typingBurstsMs,
  countSentences,
  punctuationPauseMs,
  calculateHumanDelay,
};
