"use strict";

/**
 * ECLIPSE Banat Abbreviation / Texting Dictionary
 * ================================================
 *
 * This is intentionally kept separate from index.js so the Banat
 * humanizer can grow without turning the main bot file into a
 * giant slang dictionary.
 *
 * The pool is matched against words/phrases that actually occur in
 * ECLIPSE's trigger/reply language. Replacements are probabilistic;
 * humanApplyShorthand() chooses at most ONE replacement per message.
 *
 * Categories:
 * - core: very common texting shorthand
 * - casual: informal/internet shorthand
 * - reaction: short reaction phrases
 * - slang: semantic chat-style substitutions (used sparingly)
 *
 * Do not turn every word into shorthand. The humanizer decides when
 * a replacement happens, so normal replies remain normal most of the time.
 */

const BANAT_SHORTHANDS = Object.freeze({
  // ----------------------------------------------------------
  // CORE / VERY COMMON
  // ----------------------------------------------------------

  "you are": ["u r"],
  "you’re": ["ur"],
  "you're": ["ur"],
  "you": ["u"],
  "your": ["ur"],
  "are": ["r"],
  "because": ["bc", "cuz"],
  "though": ["tho"],
  "right now": ["rn"],
  "probably": ["prob", "probs"],
  "something": ["smth"],
  "someone": ["s1"],
  "somebody": ["sb"],
  "about": ["abt"],
  "really": ["rly", "rlly"],
  "just": ["js", "jus"],
  "please": ["pls", "plz"],
  "people": ["ppl"],
  "message": ["msg"],
  "messages": ["msgs"],
  "tomorrow": ["tmr", "tmrw"],
  "tonight": ["tn"],
  "today": ["tdy"],
  "before": ["b4"],
  "without": ["w/o"],
  "with": ["w/"],
  "what": ["wat"],
  "why": ["y"],
  "okay": ["ok", "k"],
  "thanks": ["thx", "ty"],
  "thank you": ["ty"],
  "no problem": ["np"],
  "of course": ["ofc"],
  "never mind": ["nvm"],
  "for real": ["fr"],
  "not gonna lie": ["ngl"],
  "to be honest": ["tbh"],
  "by the way": ["btw"],
  "I don't know": ["idk"],
  "i don't know": ["idk"],
  "I don't care": ["idc"],
  "i don't care": ["idc"],

  // ----------------------------------------------------------
  // COMMON INTERNET / CHAT
  // ----------------------------------------------------------

  "what are you doing": ["wyd"],
  "what do you mean": ["wdym"],
  "what about you": ["wbu"],
  "where are you": ["wya"],
  "where you at": ["wya"],
  "on my way": ["omw"],
  "hit me up": ["hmu"],
  "let me know": ["lmk"],
  "I know, right": ["ikr"],
  "i know, right": ["ikr"],
  "oh my god": ["omg"],
  "shaking my head": ["smh"],
  "I swear to god": ["istg"],
  "i swear to god": ["istg"],
  "on god": ["ong"],
  "if you know you know": ["iykyk"],
  "as soon as possible": ["asap"],
  "for your information": ["fyi"],
  "in my opinion": ["imo"],
  "in my humble opinion": ["imho"],
  "in real life": ["irl"],
  "too long didn't read": ["tldr"],
  "just kidding": ["jk"],
  "just joking": ["jj"],
  "be right back": ["brb"],
  "got to go": ["gtg"],
  "gotta go": ["gtg"],
  "good game": ["gg"],
  "good luck": ["gl"],
  "have fun": ["hf"],
  "welcome back": ["wb"],
  "what's up": ["sup", "wsup"],
  "what is up": ["sup", "wsup"],

  // ----------------------------------------------------------
  // GENERAL CHAT VOCABULARY
  // ----------------------------------------------------------

  "brother": ["bro"],
  "brothers": ["bros"],
  "sister": ["sis"],
  "sisters": ["sisses"],
  "friend": ["fr"],
  "friends": ["frs"],
  "favorite": ["fav"],
  "information": ["info"],
  "conversation": ["convo"],
  "conversations": ["convos"],
  "argument": ["arg"],
  "arguments": ["args"],
  "opinion": ["op"],
  "opinions": ["ops"],
  "question": ["q"],
  "questions": ["qs"],
  "reply": ["rply"],
  "replies": ["rplys"],
  "picture": ["pic"],
  "pictures": ["pics"],
  "video": ["vid"],
  "videos": ["vids"],
  "notification": ["notif"],
  "notifications": ["notifs"],
  "common sense": ["cs"],
  "confidence": ["conf"],
  "attention": ["attn"],
  "problem": ["prob"],
  "problems": ["probs"],
  "favorite notification": ["fav notif"],
  "little": ["lil"],
  "nothing": ["nthn"],
  "anything": ["anythn"],
  "everything": ["evrythn"],
  "everyone": ["evryone", "every1"],
  "everybody": ["every1"],
  "anyone": ["any1"],

  // ----------------------------------------------------------
  // FILIPINO / TAGLISH BANAT VOCABULARY
  //
  // Level 1 = very natural chat shorthand.
  // Level 2 = occasional shorthand; the humanizer should keep these rare.
  // Level 3 words are intentionally omitted when shortening would look forced.
  // ----------------------------------------------------------

  // Level 1 — very natural
  "hindi": ["di"],
  "bakit": ["bkt"],
  "parang": ["prang"],
  "talaga": ["tlga"],
  "para": ["pra"],
  "kapag": ["kpg"],
  "walang": ["wlang"],
  "lang": ["lng"],
  "ikaw": ["u"],

  // Level 2 — occasional / context-dependent
  "ganyan": ["gnyan"],
  "kailangan": ["kylngn"],
  "muna": ["mna"],
  "tuloy": ["tly"],
  "gusto": ["gsto"],
  "bang": ["bng"],
  "maintindihan": ["mntindihan"],
  "nakakatuwa": ["nkakatuwa"],
  "makulit": ["mkulit"],
  "magsalita": ["mgsalita"],
  "sinasabi": ["snbbi"],
  "saglit": ["sglit"],
  "sobrang": ["sbrng"],
  "marami": ["mrmi"],
  "ganun": ["gnun"],
  "ganoon": ["gnoon"],
  "ngayon": ["ngyn"],
  "mamaya": ["mmya"],
  "bago": ["bgo"],
  "ulit": ["ult"],
  "siguro": ["sguro"],
  "kasi": ["ksi"],
  "naman": ["nmn"],
  "rin": ["rn"],
  "din": ["dn"],
  "dahil": ["dhl"],
  "pero": ["pro"],
  "saan": ["san"],
  "anong": ["anong"],
  "itong": ["itng"],
  "iyon": ["yn"],
  "iyonang": ["ynang"],
  "maganda": ["mgnda"],
  "magaling": ["mglng"],
  "tama": ["tm"],
  "mali": ["mli"],
  "sagot": ["sgot"],
  "tanong": ["tnong"],
  "point": ["pt"],

  // ----------------------------------------------------------
  // REACTION / SHORT CHAT PHRASES
  // ----------------------------------------------------------

  "I know": ["ik"],
  "i know": ["ik"],
  "I think": ["imo", "i think"],
  "I swear": ["istg"],
  "no way": ["naw", "no way"],
  "laughing": ["lol", "lmao"],
  "laugh": ["lol", "lmao"],
  "hahaha": ["haha", "lol", "lmao"],
  "hahahaha": ["haha", "lol", "lmao"],

  // ----------------------------------------------------------
  // LIGHT SLANG / INTERNET-NATIVE VARIANTS
  //
  // These are intentionally mixed into the same low-rate pool.
  // They are not meant to fire on every occurrence.
  // ----------------------------------------------------------

  "laughing at you": ["lmao at u"],
  "laughing at this": ["lmao at this"],
  "that is funny": ["thats funny lol"],
  "that's funny": ["thats funny lol"],
  "very funny": ["funny asl"],
  "what the fuck": ["wtf"],
  "what the hell": ["wth"],
  "shut up": ["stfu"],
  "be quiet": ["stfu"],
  "I can't": ["i cant 😭"],
  "i can't": ["i cant 😭"],
  "I am dead": ["im dead 😭"],
  "i am dead": ["im dead 😭"],
  "I am crying": ["im crying 😭"],
  "i am crying": ["im crying 😭"],

  // ----------------------------------------------------------
  // NUMBER / LETTER SHORTCUTS
  //
  // Kept intentionally small because these can look dated if
  // overused.
  // ----------------------------------------------------------

  "for you": ["4u"],
  "for me": ["4me"],
  "to you": ["2u"],
  "see you": ["c u"],
  "see ya": ["cya"],
  "later": ["l8r"],

  // ----------------------------------------------------------
  // EVERYDAY CHAT / NATURAL CASUALIZATION
  // ----------------------------------------------------------

  "I am": ["im", "i'm"],
  "i am": ["im", "i'm"],
  "I will": ["ill", "i'll"],
  "i will": ["ill", "i'll"],
  "I have": ["ive", "i've"],
  "i have": ["ive", "i've"],
  "I want to": ["wanna"],
  "i want to": ["wanna"],
  "I am going to": ["im gonna"],
  "i am going to": ["im gonna"],
  "going to": ["gonna"],
  "got to": ["gotta"],
  "kind of": ["kinda"],
  "sort of": ["sorta"],
  "let me": ["lemme"],
  "give me": ["gimme"],
  "come on": ["cmon"],
  "alright": ["aight", "alr"],
  "all right": ["alr", "aight"],
  "good morning": ["gm"],
  "good night": ["gn"],
  "see you later": ["c u l8r"],
  "talk to you later": ["ttyl"],
  "take care": ["tc"],
  "thank you so much": ["tysm"],
  "congratulations": ["congrats"],
  "definitely": ["def", "deff"],
  "especially": ["esp"],
  "actually": ["acc"],
  "you know": ["yk"],
  "you know what": ["yk what"],
  "for real": ["fr", "frfr"],
  "right": ["rite"],
  "probably not": ["prob not"],
  "I guess": ["ig"],
  "i guess": ["ig"],
  "love you": ["ly"],
  "miss you": ["miss u"],

  // ----------------------------------------------------------
  // CONTEXTUAL / CURRENT CHAT PHRASES
  //
  // These are selected by the existing humanizer at low probability.
  // They expand expressive range without forcing slang into every reply.
  // ----------------------------------------------------------

  "no because": ["no bc"],
  "wait a minute": ["wait a sec", "wait"],
  "hold on": ["hol up", "wait"],
  "be serious": ["be so fr", "b fr"],
  "are you serious": ["u srs", "fr?"],
  "that makes sense": ["that makes sense", "makes sense"],
  "that does not make sense": ["that makes no sense"],
  "i understand": ["i get it", "i get u"],
  "i understand you": ["i get u"],
  "i see what you mean": ["i see what u mean"],
  "i agree": ["fr", "i agree"],
  "i disagree": ["nah", "idk abt that"],
  "you are right": ["ur right", "u right"],
  "you are wrong": ["ur wrong", "u wrong"],
  "that is crazy": ["thats crazy", "nah thats crazy"],
  "that is wild": ["thats wild", "wild"],
  "that is insane": ["thats insane", "insane"],
  "no way": ["no way", "ain't no way"],
  "there is no way": ["ain't no way"],
  "i am weak": ["im weak 😭", "im crying 😭"],
  "i am crying": ["im crying 😭"],
  "you are cooked": ["ur cooked", "u cooked"],
  "we are cooked": ["we're cooked", "we cooked"],
  "it is over": ["its over", "we're cooked"],
  "here we go again": ["here we go again 😭", "not again"],
  "again": ["again 😭", "na naman"],
  "right about that": ["real for that", "fr on that"],
  "that was funny": ["that was funny ngl", "okay that got me"],
  "you got me": ["u got me", "okay u got me"],
  "i cannot even": ["i cant even", "i can't 😭"],
  "i do not know": ["idk"],
  "i do not care": ["idc"],
  "not gonna lie": ["ngl"],
  "to be honest": ["tbh"],
  "for real for real": ["frfr"],
  "at this point": ["atp"],
  "in this economy": ["in this economy 😭"],
  "my brother": ["bro", "my guy"],
  "my guy": ["bro", "my guy"],
  "good point": ["fair point", "valid"],
  "fair enough": ["fair", "valid"],
  "that is valid": ["thats valid", "valid"],
  "what happened": ["what happened", "what happened 😭"],
  "what happened here": ["what happened here 😭", "bro what happened"],
  "why would you do that": ["why would u do that 😭"],
  "what are you on": ["what are u on", "bro what are u on"],
  "what is going on": ["whats going on", "what is happening"],
  "i am listening": ["im listening"],
  "go on": ["go on", "continue"],
  "tell me more": ["tell me more", "go on"],
  "leave me alone": ["leave me be", "pls 😭"],
  "i am done": ["im done 😭", "im done"],
  "we are done": ["we're done 😭", "its over"],
  "that is enough": ["aight thats enough", "okay enough"],

});

module.exports = {
  BANAT_SHORTHANDS,
};
