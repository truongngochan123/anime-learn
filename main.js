const subtitleDiv = document.getElementById("subtitle");
const dictDiv = document.getElementById("dict-content");
const video = document.getElementById("video");

let subtitles = [];
let tokenizer;

function parseSRT(text) {
  return text.trim().split("\n\n").map(b => {
    const l = b.split("\n");
    return {
      time: toSec(l[1].split(" --> ")[0]),
      text: l[2]
    };
  });
}

function toSec(t) {
  const [h, m, s] = t.replace(",", ".").split(":");
  return h * 3600 + m * 60 + parseFloat(s);
}

fetch("sub.srt")
  .then(r => r.text())
  .then(t => subtitles = parseSRT(t));

kuromoji.builder({
  dicPath: "https://truongngochan123.github.io/anime-learn/dict/"
}).build((err, tk) => tokenizer = tk);

video.ontimeupdate = () => {
  const t = video.currentTime;
  const sub = subtitles.find(s => t >= s.time && t < s.time + 3);
  if (sub && tokenizer) render(sub.text);
};

function render(text) {
  const tokens = tokenizer.tokenize(text);
  subtitleDiv.innerHTML = tokens.map(t =>
    `<span class="word" onclick="lookup('${t.surface_form}')">${t.surface_form}</span>`
  ).join("");
}

function lookup(word) {
  fetch(`https://jisho.org/api/v1/search/words?keyword=${word}`)
    .then(r => r.json())
    .then(d => {
      if (!d.data.length) return;
      const w = d.data[0];
      dictDiv.innerHTML = `
        <b>${w.japanese[0].word || word}</b><br>
        ${w.japanese[0].reading}<br>
        ${w.senses[0].english_definitions.join(", ")}
      `;
    });
}
