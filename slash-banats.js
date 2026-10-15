"use strict";

const ON_REPLIES = Object.freeze([
  "hev abi owns you mga garapata",
  "andito na boss mo, behave kayo mga garapata",
  "sige, bukas na banat, sino unang tatamaan?",
  "ayan na, buhay na naman yung gulo",
  "on na, tigil muna kayo sa pagiging tanga",
  "nandito na ako, wag niyo kong subukan",
  "sige, magsipag-ingay pa kayo para may mapansin ako",
  "ayos, naka-on na, wag kayong iiyak pag napansin ko kayo",
  "andito na yung bangungot niyo, behave",
  "banat is on, balik na kayo sa kalokohan niyo",
  "ayan, gising na. sino may gustong mapansin?",
  "on na mga hayop, wag sabay-sabay",
]);

const OFF_REPLIES = Object.freeze([
  "bounce na ako, di kaya kakunatan ko",
  "yoko na, baduy na",
  "pass na, bumaho na kasi andito na eh, ni tanga",
  "ano ba yan, tukmol squad yan?",
  "patay na banat, balik kayo sa tahimik niyong buhay",
  "off muna, pahinga kayo sa kakulitan",
  "sige, tahimik muna ako. wag kayong masanay",
  "banat off, tigil muna ang kalat",
  "ayan, pinatay niyo na naman yung saya",
  "bounce muna ako, bahala kayo sa buhay niyo",
  "off na. pagbalik ko wag kayong iyakin",
]);

const UNAUTHORIZED_REPLIES = Object.freeze([
  "bawal bobo",
  "tuwad ka muna",
  "wag mong gamitin yang slash na parang iyo yan",
  "slash ka nang slash, kala mo ikaw may-ari",
  "gamit pa slash, walang bot dito para sayo",
  "kunware may bot sa acc ko na to",
  "slash mo pa mukha mo, hindi yan toggle para sayo",
  "hindi ikaw ang may susi dito, garapata",
  "wag kang makialam sa switch, manood ka muna",
  "akala mo admin ka? cute",
  "isang slash lang sapat na, wag kang makulit",
  "hindi porke gumagana yung slash, pwede mo nang paulit-ulit gamitin",
  "hev abi owns you, wag mo na patayin o buhayin, hindi ikaw ang may hawak",
  "tigil slash, wala kang permiso dito",
  "bawal ka dito sa control panel, tambay ka muna",
  "slash nang slash, may ambag ka ba?",
  "hindi ka admin, extra ka lang sa eksena",
  "pindot ka nang pindot, utak mo naka-off",
  "permission denied, balik ka sa pagiging spectator",
  "ang kulit mo, isang minuto ka munang manahimik",
]);

function pick(list) {
  return list[Math.floor(Math.random() * list.length)];
}

function pickSlashBanat(mode = "on") {
  if (String(mode).toLowerCase() === "off") {
    return pick(OFF_REPLIES);
  }

  return pick(ON_REPLIES);
}

const unauthorizedUsed = new Map();
const UNAUTHORIZED_HISTORY_LIMIT = 500;

function pickUnauthorizedSlashBanat(threadId = "global", senderId = "unknown") {
  const key = String(threadId) + ":" + String(senderId);
  let used = unauthorizedUsed.get(key);
  if (!used) used = new Set();

  let candidates = UNAUTHORIZED_REPLIES.filter((line) => !used.has(line));
  if (!candidates.length) {
    used.clear();
    candidates = UNAUTHORIZED_REPLIES.slice();
  }

  const selected = pick(candidates);
  used.add(selected);
  unauthorizedUsed.delete(key);
  unauthorizedUsed.set(key, used);
  while (unauthorizedUsed.size > UNAUTHORIZED_HISTORY_LIMIT) {
    unauthorizedUsed.delete(unauthorizedUsed.keys().next().value);
  }
  return selected;
}

pickSlashBanat.onReplies = ON_REPLIES.slice();
pickSlashBanat.offReplies = OFF_REPLIES.slice();
pickSlashBanat.unauthorizedReplies = UNAUTHORIZED_REPLIES.slice();

module.exports = pickSlashBanat;
module.exports.pickUnauthorizedSlashBanat = pickUnauthorizedSlashBanat;
