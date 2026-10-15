"use strict";

/**
 * ECLIPSE social response decision layer.
 *
 * This decides HOW a Banat reply should feel before the existing
 * humanization/timing pipeline runs. It does not generate text and does
 * not duplicate the human mimic, delay, or memory modules.
 */

const REACTION_WORDS = new Set([
  "lol", "lmao", "lmfao", "haha", "hahaha", "fr", "real", "damn",
  "wtf", "bro", "bruh", "nah", "😭", "💀", "🤣"
]);

function normalize(text) {
  return String(text || "")
    .toLowerCase()
    .replace(/https?:\/\/\S+/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

function countWords(text) {
  return normalize(text).split(" ").filter(Boolean).length;
}

function incomingEnergy(text) {
  const value = String(text || "");
  let score = 0;

  if (/[!?]{2,}/.test(value)) score += 1;
  if (/\b(?:HAHA+|LMAO+|LMFAO+)\b/i.test(value)) score += 1;
  if (/[😭💀🤣]/u.test(value)) score += 1;
  if (/\b(?:bro|bruh|wtf|nah)\b/i.test(value)) score += 1;
  if (value === value.toUpperCase() && /[A-Z]/.test(value)) score += 1;

  return Math.min(5, score);
}

function isQuestion(text) {
  const value = normalize(text);
  return /\?|\b(?:why|what|how|who|where|when|bakit|ano|paano|sino|saan|kelan)\b/i.test(value);
}

function isReaction(text) {
  const value = normalize(text);
  const words = value.split(" ").filter(Boolean);
  return (
    words.length <= 3 &&
    words.length > 0 &&
    (words.every((word) => REACTION_WORDS.has(word)) ||
      /^[!?😭💀🤣.]+$/u.test(value))
  );
}

function chooseSocialResponse(incomingText, candidateText = "", context = {}) {
  const incoming = String(incomingText || "").trim();
  const candidate = String(candidateText || "").trim();
  const words = countWords(incoming);
  const energy = incomingEnergy(incoming);
  const question = isQuestion(incoming);
  const reaction = isReaction(incoming);
  const momentum = Number(context.momentum || 1);

  let type = "tease";
  let reason = "banat-style conversational reply";

  if (reaction) {
    type = "reaction";
    reason = "very short / reaction-like incoming";
  } else if (question) {
    type = "answer";
    reason = "incoming message contains a question";
  } else if (momentum >= 4 && words <= 8) {
    type = "short";
    reason = "fast exchange with a short incoming message";
  } else if (energy >= 3) {
    type = "react";
    reason = "high-energy incoming message";
  } else if (/\b(?:agree|tama|true|real|same|exactly|oo|yes|yep|yup)\b/i.test(incoming)) {
    type = "agree";
    reason = "incoming message signals agreement";
  } else if (/\b(?:idk|i don't know|di ko alam|wala|nothing|nvm|never mind)\b/i.test(incoming)) {
    type = "deflect";
    reason = "incoming message gives little actionable content";
  } else if (candidate && /\?\s*$/.test(candidate)) {
    type = "ask";
    reason = "candidate naturally turns the exchange back to the user";
  } else if (context.recentMessages >= 3 && words >= 12) {
    type = "callback";
    reason = "active conversation with enough context for a callback";
  }

  return {
    type,
    reason,
    energy,
    momentum,
    incomingWords: words,
  };
}

function socialTimingMultiplier(decision) {
  switch (decision?.type) {
    case "reaction":
      return 0.55;
    case "react":
      return 0.75;
    case "short":
      return 0.72;
    case "answer":
      return 1.05;
    case "ask":
      return 1.02;
    case "callback":
      return 1.08;
    case "deflect":
      return 0.82;
    case "agree":
      return 0.78;
    default:
      return 1;
  }
}

module.exports = {
  chooseSocialResponse,
  socialTimingMultiplier,
};
