/* Original Web Audio compositions: no sampled game music or sound effects. */
(()=>{
// Each bar has eight eighth-note slots. A dash sustains the previous note.
const scores = {
  // Circuit Atlas: hook, lift, and a half-time break before the loop comes back.
  map: { bpm: 138, chords: [
    [35,38,42,45], [31,35,38,42], [38,42,45,49], [33,37,40,47],
    [35,38,42,45], [31,35,38,42], [40,43,47,50], [30,34,37,40],
    [31,35,38,42], [33,37,40,47], [35,38,42,45], [30,38,42,45],
    [40,43,47,50], [31,35,38,42], [35,38,42,45], [30,34,37,40],
    [38,42,45,49], [33,37,40,47], [35,38,42,45], [31,35,38,42],
    [40,43,47,50], [31,35,38,42], [30,35,37,40], [30,34,37,40],
  ], lead: [
    '71 - 74 78 . 76 74 .', '71 . 74 76 79 - 78 74',
    '69 - 74 78 . 76 74 .', '73 76 - 81 . 76 73 .',
    '71 - 74 78 . 76 74 .', '71 . 74 76 79 - 81 83',
    '79 - 76 74 . 76 79 .', '78 - 76 73 70 - . .',
    '83 - 79 86 . 83 81 79', '81 - . 85 88 - 85 81',
    '78 - 81 83 . 86 85 83', '81 - 78 . 74 78 - .',
    '79 - 83 86 . 83 79 76', '78 - 79 83 90 - 86 83',
    '81 78 . 74 78 83 - .', '85 - 81 . 78 76 73 70',
    '74 - - . 69 - 66 .', '73 - - . 76 - 73 .',
    '71 - 74 78 . 76 74 .', '79 - - . 78 74 71 .',
    '76 - 79 . 83 - 79 .', '78 - 83 . 86 - 83 .',
    '85 - . 83 81 - 78 .', '76 73 . 70 78 - 76 74',
  ] },

  // CPU: an ascending boot-up riff and a steady running pulse.
  0: { bpm: 122,
    chords: [[36,40,43],[36,40,43],[41,45,48],[43,47,50],[36,40,43],[40,43,47],[41,45,48],[43,47,50]],
    lead: [
      '60 64 67 - . 72 71 67', '64 - 67 72 - 76 - .',
      '65 69 72 - . 74 72 69', '67 - 71 74 - 71 67 .',
      '60 64 67 - . 72 74 76', '79 - 76 71 - 67 - .',
      '69 72 77 - 76 72 69 .', '67 - 74 . 71 - . .',
    ] },
  // Control Unit: short commands answered by longer phrases.
  1: { bpm: 112,
    chords: [[38,41,45],[38,41,45],[46,50,53],[45,49,52],[38,41,45],[41,45,48],[43,46,50],[45,49,52]],
    lead: [
      '74 . 74 69 . 77 - .', '. 76 74 - . 69 - .',
      '70 . 74 77 . 74 - .', '. 73 76 - . 69 - .',
      '74 . 74 69 . 81 - .', '79 . 77 76 - 72 - .',
      '74 . 70 67 . 70 74 .', '76 - 73 . 69 - . .',
    ] },
  // Registers: interlocking, glassy patterns that leave space between phrases.
  2: { bpm: 106,
    chords: [[40,43,47],[48,52,55],[43,47,50],[45,48,52],[40,43,47],[48,52,55],[43,47,50],[47,51,54]],
    lead: [
      '76 79 83 - . 79 76 .', '. 84 83 79 - . 76 .',
      '74 79 83 - . 81 79 .', '. 76 72 69 - . . .',
      '76 79 83 - . 86 83 .', '. 84 88 84 - . 79 .',
      '79 83 86 - 83 81 79 .', '. 78 75 71 - . . .',
    ] },
  // ALU: a heavier syncopated groove and a rising second half.
  3: { bpm: 136,
    chords: [[33,36,40],[33,36,40],[41,45,48],[40,44,47],[33,36,40],[36,40,43],[38,41,45],[40,44,47]],
    lead: [
      '57 . 60 64 . 67 - 64', '60 . 57 . 64 67 69 .',
      '65 . 69 72 . 69 - 65', '64 . 68 71 . 68 64 .',
      '57 . 60 64 . 69 - 72', '67 . 72 76 . 74 72 .',
      '69 . 72 77 . 76 72 .', '68 71 76 . 71 - . .',
    ] },
  // Cache: fast offbeat pickups with a bright, skipping lead.
  4: { bpm: 148,
    chords: [[41,45,48],[48,52,55],[38,41,45],[46,50,53],[41,45,48],[45,48,52],[46,50,53],[48,52,55]],
    lead: [
      '77 . 81 84 81 . 77 81', '79 - . 76 79 84 - .',
      '81 . 77 74 77 . 81 84', '82 - 77 . 74 - . .',
      '77 . 81 84 88 . 84 81', '84 - . 81 76 81 - .',
      '82 . 86 89 86 . 82 77', '79 84 88 86 84 - . .',
    ] },
  // Clock: a quiet tick-tock under a minor-key finale.
  5: { bpm: 128,
    chords: [[38,41,45],[46,50,53],[43,46,50],[45,49,52],[38,41,45],[41,45,48],[46,50,53],[45,49,52]],
    lead: [
      '74 - 69 . 77 - 76 .', '74 77 82 - 81 - . .',
      '79 - 74 . 82 - 81 .', '76 73 81 - 76 - . .',
      '74 - 77 . 81 - 86 .', '84 81 77 - 76 - . .',
      '77 - 82 . 86 - 84 .', '81 76 73 - 69 - . .',
    ] },
  // The boss gets a separate battle theme with a chromatic bass ostinato.
  boss: { bpm: 174, wave: 'sawtooth', bass: '00300210', harmony: '21202120', kick: 'k.kkk.k.', drumGain: 1.12, battle: true,
    chords: [
      [33,36,40], [34,38,41], [33,36,40], [28,32,35],
      [33,36,40], [29,33,36], [26,29,33], [28,32,35],
      [33,36,40], [34,38,41], [31,35,38], [28,32,35],
      [29,33,36], [26,29,33], [34,38,41], [28,32,35],
    ], lead: [
      '69 . 69 72 76 - 75 72', '70 74 77 . 82 - 81 77',
      '69 . 69 72 76 - 81 79', '76 80 83 . 80 - 76 .',
      '69 72 . 76 81 - 79 76', '77 81 84 . 89 - 88 84',
      '86 - 81 84 86 . 81 77', '80 83 88 . 83 80 76 .',
      '81 84 . 88 93 - 91 88', '82 86 89 . 94 - 93 89',
      '83 - 86 91 86 . 83 79', '80 83 . 88 92 - 88 83',
      '89 - 84 . 81 84 89 .', '86 - 81 . 77 81 86 .',
      '82 86 89 94 . 89 86 82', '88 83 80 76 . 80 83 80',
    ] },

};
const levelMixes = {
    0: { bass: '0..20..3', harmony: '.1.2.0.2', kick: 'k..k.k..', drumGain: 1, wave: 'square', reprise: [
      '72 - 76 79 . 81 79 76',
      '76 79 83 - 86 - 83 .',
      '77 - 81 84 . 81 77 76',
      '74 79 83 - 86 83 79 .',
      '72 - - . 67 - 64 .',
      '71 - - . 67 64 59 .',
      '72 77 81 - 84 81 77 .',
      '79 - 74 . 71 74 79 .',
    ] },
    1: { bass: '0.20..2.', harmony: '.2..1.2.', kick: 'k...k..k', drumGain: 0.8, wave: 'triangle', reprise: [
      '81 . 81 77 . 84 - .',
      '. 81 77 - 74 . 77 .',
      '82 . 81 77 . 86 - .',
      '85 - 81 . 76 81 85 .',
      '77 - - . 74 - 69 .',
      '72 - - . 69 72 . .',
      '74 . 77 79 . 82 - .',
      '81 76 . 73 76 - 73 .',
    ] },
    2: { bass: '0...2.3.', harmony: '012.210.', kick: 'k.......', drumGain: 0.57, wave: 'sine', reprise: [
      '83 86 88 - . 86 83 .',
      '84 88 91 - . 88 84 .',
      '83 . 79 86 - 83 79 .',
      '81 - 84 88 . 84 81 .',
      '79 - - . 76 - 71 .',
      '76 - - . 72 - . .',
      '79 83 86 - 91 86 83 .',
      '78 - 75 . 71 75 78 .',
    ] },
    3: { bass: '0.00.203', harmony: '..1.2..1', kick: 'k..kk.k.', drumGain: 1.03, wave: 'sawtooth', reprise: [
      '69 . 72 76 . 79 - 76',
      '72 . 69 76 . 79 81 .',
      '77 . 81 84 . 81 - 77',
      '76 80 . 83 88 - 83 .',
      '64 - - . 60 - 57 .',
      '67 - - . 64 - 60 .',
      '77 . 81 86 . 84 81 .',
      '80 83 88 . 83 - 76 .',
    ] },
    4: { bass: '0.2301.2', harmony: '.2.1..2.', kick: 'k..kk..k', drumGain: 0.83, wave: 'triangle', reprise: [
      '81 . 84 89 88 . 84 81',
      '84 - . 79 84 88 - .',
      '81 . 84 86 89 . 86 81',
      '82 - 86 . 89 86 82 .',
      '81 - - . 77 - 72 .',
      '76 - - . 81 84 - .',
      '82 . 86 89 94 . 89 86',
      '88 86 84 . 79 - 76 .',
    ] },
    5: { bass: '0.2.0.23', harmony: '.2.1.2.1', kick: 'k....k..', drumGain: 0.68, wave: 'square', reprise: [
      '86 - 81 . 89 - 88 .',
      '86 89 94 - 93 - . .',
      '91 - 86 . 94 - 93 .',
      '88 85 93 - 88 - . .',
      '77 - - . 74 - 69 .',
      '76 - - . 81 - . .',
      '82 - 86 . 89 - 86 .',
      '88 85 81 . 76 - 73 .',
    ] },
};
for (const [level, {reprise, ...mix}] of Object.entries(levelMixes)) {
  const score = scores[level];
  Object.assign(score, mix);
  score.lead.push(...reprise);
  score.chords = [...score.chords, ...score.chords];
}
for (const score of Object.values(scores)) {
  score.lead = score.lead.flatMap(bar => bar.split(' '));
}
const tracks = { home: { bpm: 78, wave: 'triangle', bass: [45,41,48,43],
  melody: [69,0,72,0,76,0,72,71,67,0,71,0,74,0,71,0] }, ...scores };

let lastVoice=-1,voiceIndex=0;
let audio,master,musicBus,timer,enabled=true,scene='home',beat=0,nextBeat=0;const button=document.getElementById('music');
function tone(midi,duration,type,volume,offset=0,bus=master,endMidi=null,sustain=0){if(!audio||!enabled||document.hidden)return;const o=audio.createOscillator(),g=audio.createGain(),t=audio.currentTime+offset;o.type=type;o.frequency.value=440*2**((midi-69)/12);if(endMidi!==null){o.frequency.setValueAtTime(o.frequency.value,t);o.frequency.exponentialRampToValueAtTime(440*2**((endMidi-69)/12),t+duration*.65);}g.gain.setValueAtTime(.0001,t);g.gain.linearRampToValueAtTime(volume,t+.008);if(sustain>0)g.gain.exponentialRampToValueAtTime(volume*sustain,t+duration*.68);g.gain.exponentialRampToValueAtTime(.0001,t+duration);o.connect(g);g.connect(bus);o.start(t);o.stop(t+duration+.02);}
function makeBus(){if(!audio)return;if(musicBus){musicBus.gain.cancelScheduledValues(audio.currentTime);musicBus.gain.setTargetAtTime(0,audio.currentTime,.04);}musicBus=audio.createGain();musicBus.gain.value=1;musicBus.connect(master);}
function setScene(value){const key=String(value);if(!Object.hasOwn(tracks,key))return;if(scene===key)return;scene=key;beat=0;nextBeat=audio?.currentTime??0;makeBus();}
let drumNoise;
function percussion(duration, frequency, filterType, volume, offset) {
  if (!drumNoise) {
    drumNoise = audio.createBuffer(1, Math.ceil(audio.sampleRate * .16), audio.sampleRate);
    const samples = drumNoise.getChannelData(0);
    for (let i = 0; i < samples.length; i++) samples[i] = Math.random() * 2 - 1;
  }
  const time = audio.currentTime + offset;
  const source = audio.createBufferSource();
  const filter = audio.createBiquadFilter();
  const envelope = audio.createGain();
  source.buffer = drumNoise;
  filter.type = filterType;
  filter.frequency.value = frequency;
  envelope.gain.setValueAtTime(volume, time);
  envelope.gain.exponentialRampToValueAtTime(.0001, time + duration);
  source.connect(filter);
  filter.connect(envelope);
  envelope.connect(musicBus);
  source.start(time);
  source.stop(time + duration);
}

function playScoreSlot(track, step, offset) {
  const index = beat % track.lead.length;
  const bar = Math.floor(index / 8);
  const slot = index % 8;
  const chord = track.chords[bar];
  const mapTrack = track === scores.map;
  const breakdown = mapTrack ? bar >= 16 && bar < 20 : !track.battle && bar >= 12 && bar < 14;
  const lift = bar >= 8 && bar < 16 && !breakdown;
  const drumGain = track.drumGain ?? 1;
  const turnaround = bar % 8 === 7;
  const note = Number(track.lead[index]);

  if (note) {
    let length = 1;
    while (track.lead[index + length] === '-') length++;
    tone(note, step * (length - .08), 'triangle', .082, offset, musicBus, null, .48);
    tone(note, step * .55, track.wave ?? 'square', breakdown ? .008 : .016, offset, musicBus);
    if (lift && length > 1) tone(note - 12, step * (length - .18), 'sine', .034, offset, musicBus, null, .42);
    if (slot === 0 || slot === 3) tone(note, step * .46, 'triangle', .018, offset + step * 1.5, musicBus);
    if (track.battle && slot % 2 === 1) tone(note - 12, step * .78, 'square', .017, offset, musicBus);
  }

  const bassPattern = breakdown ? '0...2...' : turnaround ? '0.20.321' : (track.bass ?? '0.20.230');
  const bass = Number(bassPattern[slot]);
  if (Number.isInteger(bass)) {
    const low = bass === 3 ? chord[0] + 12 : chord[bass];
    tone(low, step * (breakdown ? 2.1 : .83), 'triangle', .085, offset, musicBus, null, .42);
    if (!breakdown) tone(low + 12, step * .46, 'square', track.battle ? .03 : .012, offset, musicBus);
    if (track.battle && slot % 2 === 0) tone(low, step * .33, 'sawtooth', .024, offset + step * .5, musicBus);
  }

  // Sustained chords give the hook room while the arpeggio keeps moving.
  if (slot === 0 || (lift && slot === 4)) {
    const duration = step * (lift ? 3.9 : 7.8);
    for (const pitch of chord.slice(1)) {
      tone(pitch + 12, duration, 'triangle', .016, offset, musicBus, null, .45);
    }
  }
  const arpeggio = Number((lift ? (mapTrack ? '.213.312' : '.210.012') : (track.harmony ?? '.1.2.3.2'))[slot]);
  if (Number.isInteger(arpeggio)) tone(chord[arpeggio] + 24, step * .63, 'sine', .026, offset, musicBus);

  const kicks = breakdown ? 'k.......' : turnaround ? 'k..kk..k' : (track.kick ?? 'k..k.k..');
  if (kicks[slot] === 'k') tone(42, .14, 'sine', .15 * drumGain, offset, musicBus, 24);
  if ((breakdown ? slot === 4 : slot === 2 || slot === 6) || (turnaround && slot === 7)) {
    percussion(.12, 1750, 'bandpass', .093 * drumGain, offset);
    tone(49, .072, 'triangle', .042 * drumGain, offset, musicBus, 36);
  }
  if (slot % 2 === 1) percussion(.047, 5300, 'highpass', (breakdown ? .024 : .035) * drumGain, offset);
  if ((lift && slot === 7) || (track.battle && slot % 2 === 1)) percussion(.032, 6300, 'highpass', .023, offset + step * .5);
}

function playSlot(track, step, offset) {
  if (!track.melody) {
    playScoreSlot(track, step, offset);
    return;
  }
  const note = track.melody[beat % track.melody.length];
  if (note) tone(note, .16, track.wave, .023, offset, musicBus);
  if (beat % 4 === 0) tone(track.bass[Math.floor(beat / 16) % 4], .32, 'triangle', .055, offset, musicBus);
}

function pulse() {
  if (!audio || !enabled || document.hidden || audio.state === 'suspended') return;
  const track = tracks[scene];
  const step = 60 / track.bpm / (track.melody ? 4 : 2);
  const now = audio.currentTime;
  // Recover from a paused tab without playing a burst of missed notes.
  if (nextBeat < now - step) nextBeat = now;
  while (nextBeat < now + .05) {
    playSlot(track, step, Math.max(0, nextBeat - now));
    nextBeat += step;
    beat++;
  }
}
function start(){try{if(!audio){audio=new (window.AudioContext||window.webkitAudioContext)();master=audio.createGain();master.gain.value=enabled?.7:0;master.connect(audio.destination);makeBus();}audio.resume().catch(()=>{});timer??=setInterval(pulse,20);}catch{button.title='Audio unavailable';}}
function effect(kind){if(['click','navigate','jump'].includes(kind)){tone(kind==='jump'?79:kind==='navigate'?77:88,.045,'square',.013);return;}const notes={stuck:[84,79,75,70,65,60],portal:[60,64,67,72,76,79,84,91],arrival:[72,79,84,88,91],correct:[79,84,88],wrong:[67,63,58],splat:[56,45,38,30],clear:[72,76,79,84,88,91]}[kind]||[84];notes.forEach((m,i)=>tone(m,.11,'square',.025,i*.075));}
button.addEventListener('click',()=>{enabled=!enabled;button.title=enabled?'Mute sound':'Unmute sound';button.setAttribute('aria-pressed',String(enabled));if(enabled)start();if(master)master.gain.setTargetAtTime(enabled?.7:0,audio.currentTime,.025);});
document.getElementById('home').addEventListener('pointerdown',start,{once:true});
function voice(){if(!audio||audio.currentTime-lastVoice<.024)return;lastVoice=audio.currentTime;tone([71,72,71,74][voiceIndex++%4],.032,'square',.011);}
// Capture handles dynamic buttons too; native keyboard activation also emits click.
document.addEventListener('click',e=>{const control=e.target.closest?.('button, summary, a, input, select, #opening-art, #description, #feedback, #map-canvas');if(!control||control.disabled||control.closest?.('[inert]'))return;start();effect('click');},true);
window.cpuAudio={start,setScene,effect,voice,cue:()=>effect('correct')};
})();