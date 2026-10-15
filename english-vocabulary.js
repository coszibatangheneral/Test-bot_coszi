"use strict";

/**
 * Vocabulary hook used by human-mimic.js.
 *
 * The standalone bot does not currently ship a word-list snapshot, so this
 * deliberately fails open: accept alphabetic typo candidates and preserve
 * the existing humanizer behavior until a real dictionary is added.
 */
function isLikelyEnglishWord(word) {
  return typeof word === "string" && /^[A-Za-z']+$/.test(word);
}

module.exports = { isLikelyEnglishWord };
