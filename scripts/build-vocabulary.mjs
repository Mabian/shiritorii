/**
 * Builds the game's vocabulary from JMdict.
 *
 * Source: https://github.com/scriptin/jmdict-simplified (JMdict by EDRDG, CC BY-SA 4.0).
 * Run manually with `pnpm run build:vocabulary`; the generated file is committed so that neither
 * the app build nor CI ever downloads anything.
 */
import { execFileSync } from 'node:child_process';
import { mkdtempSync, readFileSync, readdirSync, mkdirSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

const RELEASE_API = 'https://api.github.com/repos/scriptin/jmdict-simplified/releases/latest';
const ASSET_PATTERN = /^jmdict-eng-common-.*\.json\.tgz$/;
const OUTPUT_DIR = new URL('../public/vocabulary/', import.meta.url);

// Readings may only consist of hiragana, katakana and the prolonged sound mark.
const KANA_ONLY = /^[ぁ-ゖァ-ヶー]+$/;
// Kana forms that exist only to help searching, or that are outdated.
const IGNORED_KANA_TAGS = ['sk', 'ok'];
// Senses nobody should be expected to know.
const IGNORED_SENSE_TAGS = ['arch', 'obs'];

const MIN_READINGS = 10_000;
const REQUIRED_READINGS = ['しんぶん', 'さくら', 'てれび'];

/** Katakana block shifted onto the hiragana block; everything else is left alone. */
function toHiragana(kana) {
  let hiragana = '';
  for (const char of kana) {
    const code = char.codePointAt(0);
    hiragana += code >= 0x30a1 && code <= 0x30f6 ? String.fromCodePoint(code - 0x60) : char;
  }
  return hiragana;
}

async function downloadDictionary() {
  const release = await (await fetch(RELEASE_API)).json();
  const asset = release.assets.find((candidate) => ASSET_PATTERN.test(candidate.name));
  if (asset === undefined) {
    throw new Error(`No asset matching ${ASSET_PATTERN} in release ${release.tag_name}`);
  }

  console.log(`Downloading ${asset.name} (${(asset.size / 1024 / 1024).toFixed(1)} MB)`);
  const directory = mkdtempSync(join(tmpdir(), 'jmdict-'));
  const archive = join(directory, asset.name);
  writeFileSync(
    archive,
    Buffer.from(await (await fetch(asset.browser_download_url)).arrayBuffer()),
  );
  execFileSync('tar', ['-xzf', archive, '-C', directory]);

  const extracted = readdirSync(directory).find((name) => name.endsWith('.json'));
  return JSON.parse(readFileSync(join(directory, extracted), 'utf8'));
}

/** The first sense that makes the word a standalone noun, or undefined if there is none. */
function findNounSense(word) {
  return word.sense.find(
    (sense) =>
      sense.partOfSpeech.includes('n') &&
      !sense.misc.some((tag) => IGNORED_SENSE_TAGS.includes(tag)),
  );
}

function buildWords(dictionary) {
  const words = new Map();
  let entryCount = 0;

  for (const word of dictionary.words) {
    const sense = findNounSense(word);
    if (sense === undefined) {
      continue;
    }

    const kanji = pickKanji(word);
    const gloss = sense.gloss
      .slice(0, 2)
      .map((entry) => entry.text)
      .join('; ');
    const tags = [...sense.misc, ...sense.field];

    for (const kanaForm of word.kana) {
      if (!kanaForm.common || kanaForm.tags.some((tag) => IGNORED_KANA_TAGS.includes(tag))) {
        continue;
      }
      if (!KANA_ONLY.test(kanaForm.text)) {
        continue;
      }

      const reading = toHiragana(kanaForm.text);
      const entry = {
        ...(kanji === undefined ? {} : { kanji }),
        // Katakana words would otherwise only ever be shown in their normalised hiragana form.
        ...(kanaForm.text === reading ? {} : { kana: kanaForm.text }),
        meaning: gloss,
        tags,
      };

      const existing = words.get(reading) ?? [];
      if (
        existing.some((other) => other.kanji === entry.kanji && other.meaning === entry.meaning)
      ) {
        continue;
      }

      existing.push(entry);
      words.set(reading, existing);
      entryCount += 1;
    }
  }

  return { words, entryCount };
}

function pickKanji(word) {
  const kanji = word.kanji.find((candidate) => candidate.common) ?? word.kanji[0];
  return kanji?.text;
}

const dictionary = await downloadDictionary();
const { words, entryCount } = buildWords(dictionary);

for (const reading of REQUIRED_READINGS) {
  if (!words.has(reading)) {
    throw new Error(`Sanity check failed: ${reading} is missing from the vocabulary`);
  }
}
if (words.size < MIN_READINGS) {
  throw new Error(`Sanity check failed: only ${words.size} readings, expected ${MIN_READINGS}+`);
}

const output = {
  source: 'JMdict (EDRDG), CC BY-SA 4.0',
  version: dictionary.version,
  date: dictionary.dictDate,
  tagDescriptions: dictionary.tags,
  words: Object.fromEntries([...words].sort(([a], [b]) => a.localeCompare(b, 'ja'))),
};

mkdirSync(OUTPUT_DIR, { recursive: true });
const target = new URL('jmdict-common-nouns.json', OUTPUT_DIR);
writeFileSync(target, JSON.stringify(output));

const sizeMb = (readFileSync(target).byteLength / 1024 / 1024).toFixed(2);
console.log(`Wrote ${words.size} readings, ${entryCount} entries, ${sizeMb} MB`);
