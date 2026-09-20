# Shiritorii

A browser game of shiritori named shiritorii (pun intended).

Nothing runs on a server. The dictionary is a static file, the game lives entirely in the browser.

## How to play

Shiritori is a Japanese word chaining game. The opponent opens with a word, and every answer has to begin
with the kana the previous word ended on.

You type in **romaji** and it turns into kana as you go, the way a Japanese input method works:
`sakura` becomes さくら, `kya` becomes きゃ, `kitte` becomes きって. Capitals give katakana, so
`TEREBI` becomes テレビ. It is all matched on the hiragana reading, so you don't have to write katakana.

An answer counts when it

- starts with the kana the previous word links from
- is a **noun**
- does **not** end in ん
- has not been played yet in this run

The last two are the heart of the game. Japanese has no word starting with ん, so ending on it
would leave the next player with nothing.

### Linking is not always the last character

A few characters carry no sound of their own, so the chain skips or normalises them. These are the
usual house rules, and without them eight endings would have no possible continuation at all.

| Word     | Links on | Why                                 |
| -------- | -------- | ----------------------------------- |
| こーひー | ひ       | the long mark ー is skipped         |
| きって   | て       | the small っ is skipped             |
| きんぎょ | よ       | small kana link on their large form |
| はなぢ   | じ       | ぢ and づ link on じ and ず         |

## Where this differs from the real game

**A rule break does not end the game.** In real shiritori, playing a word that ends in ん loses on
the spot. Here the word is shown struck through with a note saying what was wrong, and you simply
answer again. It costs 5 points and breaks your combo, and the clock keeps running while you think
of something better. That is the whole penalty.

**The clock is your real opponent.** In Challenge mode you are racing time rather than trying to
corner the other player. The opponent never stalls you on purpose, and running it dry takes real
effort.

**The opponent plays fair, you do not have to.** It only ever draws from the words JMdict marks as
common, so it will not answer you with an obscure technical term. You may use any noun in the
dictionary, all 175,000 of them.

**Nouns only is enforced by the dictionary.** The word list contains nothing but nouns, so a verb
or an adjective comes back as "not a noun in the dictionary" rather than as a separate rule.

**There is a skip button.** Once per run, for 10 seconds off the clock, you can make the opponent
pick a different word. No such thing exists in the real game.

## The two modes

**Practice** has no clock and no score. It runs until you give up, or until the opponent has no word
left, which counts as your win.

**Challenge** adds the time economy and the scoring:

| Rule                      | Value                                                                            |
| ------------------------- | -------------------------------------------------------------------------------- |
| Starting time             | 30 seconds                                                                       |
| Ceiling                   | 40 seconds                                                                       |
| Correct answer            | +5 seconds                                                                       |
| The clock runs            | only while it is your turn                                                       |
| Base points               | 10 per correct answer                                                            |
| Combo                     | from the second correct answer in a row: ×2, then ×3, ×4, and up with no ceiling |
| Wrong answer              | 5 points off, combo back to zero                                                 |
| Answering on a full clock | every second that no longer fits pays 3 points, so up to 15                      |
| Skip                      | once per run, 10 seconds, needs more than 10 on the clock                        |

The running total stays hidden. During the game you only see what each answer earned, and the final
score when time is up. Lose, and the end screen shows one word you could have played.

## Running it

```bash
pnpm install
pnpm start      # dev server on http://localhost:4200/
pnpm test       # unit tests, Vitest
pnpm build      # production build into dist/
```

There are no end-to-end tests and no e2e runner in this project.

## Vocabulary data

`public/vocabulary/jmdict-nouns.json` holds the word list the game checks against: every standalone
noun of [JMdict](https://www.edrdg.org/wiki/index.php/JMdict-EDICT_Dictionary_Project), each with one
short English gloss and its JMdict sense tags, keyed by hiragana reading. Entries JMdict marks as
common carry `common: true`; the opponent only ever plays those, while the player may use anything.

The file is committed, so neither the app build nor CI downloads anything. To refresh it from the
latest [jmdict-simplified](https://github.com/scriptin/jmdict-simplified) release:

```bash
pnpm run build:vocabulary
```

Two known limits of the data. JMdict lists homophones in entry order rather than by how common they
are, so せんせい may be glossed as 先制 "head start" instead of 先生 "teacher". And its `common`
marker misses plenty of everyday vocabulary, which is why the game ships every noun rather than only
the common ones.

## How it is built

Angular 22 with standalone components, signals throughout and no zone.js. No UI kit and no CSS
library, the styling is hand-written SCSS. The romaji to kana conversion and the chain rules under
`src/app/kana/` are plain TypeScript with no Angular dependency, covered by unit tests.

Japanese typography is M PLUS Rounded 1c, self-hosted through `@fontsource` rather than a CDN.

## Licences

JMdict is the property of the Electronic Dictionary Research and Development Group and is used under
[CC BY-SA 4.0](https://creativecommons.org/licenses/by-sa/4.0/). The word list derived from it is
available under the same licence, see `public/vocabulary/LICENSE.txt`.

M PLUS Rounded 1c is licensed under the SIL Open Font License 1.1.
