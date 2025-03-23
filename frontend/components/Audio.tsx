import * as Soundfont from "soundfont-player";

const ac = new ((window as any).AudioContext || (window as any).webkitAudioContext)();

let piano: Soundfont.Player;
Soundfont.instrument(ac, "acoustic_grand_piano").then((instrument) => {
  piano = instrument;
});

const noteMap: Record<string, string> = {
  'C5': 'C5', 'B5': 'B5', 'A5': 'A5', 'G4': 'G4', 'F4': 'F4',
  'E4': 'E4', 'D4': 'D4', 'C4': 'C4', 'B4': 'B4', 'A4': 'A4',
  'G3': 'G3', 'F3': 'F3', 'E3': 'E3', 'D3': 'D3', 'C3': 'C3',
  'A5S': 'Bb5', 'G4S': 'Ab4', 'F4S': 'Gb4', 'D4S': 'Eb4', 'C4S': 'Db4',
  'A4S': 'Bb4', 'G3S': 'Ab4', 'F3S': 'Gb3', 'D3S': 'Eb3', 'C3S': 'Db3'
};

export function handleKeyDown(noteName: string) {
  const mappedNote = noteMap[noteName];
  if (mappedNote && piano) {
    piano.play(mappedNote, ac.currentTime);
  }
}
