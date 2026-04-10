import { useState } from "react";

const notes = ["C", "D", "E", "F", "G", "A", "B"];

const noteFrequencies = {
  C: 261.63,
  D: 293.66,
  E: 329.63,
  F: 349.23,
  G: 392.0,
  A: 440.0,
  B: 493.88,
};





function PitchTrainer() {
  // ALL state at the top
  const [currentNote, setCurrentNote] = useState("");
  const [result, setResult] = useState("");
  const [score, setScore] = useState(0);
  const [hasPlayed, setHasPlayed] = useState(false);
  const [answered, setAnswered] = useState(false);
  const [attempts, setAttempts] = useState(0);
  const [mistakes, setMistakes] = useState({});
  

  //  tone generator
  const playTone = (frequency) => {
    const audioContext = new (window.AudioContext || window.webkitAudioContext)();

    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();

    oscillator.type = "sine";
    oscillator.frequency.setValueAtTime(frequency, audioContext.currentTime);

    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);

    // smooth sound
    gainNode.gain.setValueAtTime(0, audioContext.currentTime);
    gainNode.gain.linearRampToValueAtTime(0.5, audioContext.currentTime + 0.05);
    gainNode.gain.linearRampToValueAtTime(0, audioContext.currentTime + 1);

    oscillator.start();
    oscillator.stop(audioContext.currentTime + 1);
  };

  // generate + play note
  const generateNote = () => {
    let noteToPlay;
  
    const mistakeKeys = Object.keys(mistakes);
  
    if (mistakeKeys.length > 0 && Math.random() < 0.6) {
      // 60% chance: pick a weak note
      noteToPlay =
        mistakeKeys[Math.floor(Math.random() * mistakeKeys.length)];
    } else {
      // otherwise random
      noteToPlay = notes[Math.floor(Math.random() * notes.length)];
    }
  
    setCurrentNote(noteToPlay);
    setResult("");
    setAnswered(false);
    setHasPlayed(true);
  
    playTone(noteFrequencies[noteToPlay]);
  };

  const replayNote = () => {
    if (!currentNote) return;
  
    const frequency = noteFrequencies[currentNote];
    playTone(frequency);
  };
  
  // accuracy
  const accuracy =
  attempts > 0 ? ((score / attempts) * 100).toFixed(1) : 0;

  // check answer
const checkAnswer = (note) => {
  if (!hasPlayed) {
    setResult("⚠️ Play a note first!");
    return;
  }

  if (answered) return;

  setAnswered(true);
  setAttempts(attempts + 1); // track attempt

  if (note === currentNote) {
    setResult("✅ Correct!");
    setScore(score + 1);
  } else {
    setResult(`❌ Wrong! It was ${currentNote}`);

    //  track mistakes
    setMistakes((prev) => ({
      ...prev,
      [currentNote]: (prev[currentNote] || 0) + 1,
    }));
  }
};
return (
  <div style={{ maxWidth: "400px", margin: "auto", textAlign: "center" }}>
    <h2>Pitch Trainer</h2>

    <button onClick={generateNote}>New Note</button>
    <button onClick={replayNote}>Play Note</button>

    <div style={{ marginTop: "5px", padding: "10px 15px" }}>
      {notes.map((note) => (
        <button
          key={note}
          onClick={() => checkAnswer(note)}
          style={{ margin: "5px", padding: "10px 15px" }}
          disabled={answered}
        >
          {note}
        </button>
      ))}
    </div>

    <p>{result}</p>

    {/* ✅ STATS + FEEDBACK PANEL */}
    <div style={{ marginTop: "20px" }}>
      <h3>Stats</h3>
      <p>Score: {score}</p>
      <p>Attempts: {attempts}</p>
      <p>Accuracy: {accuracy}%</p>

      <h3>Weak Areas</h3>
      <ul>
        {Object.entries(mistakes).map(([note, count]) => (
          <li key={note}>
            {note}: {count} mistakes
          </li>
        ))}
      </ul>
    </div>
  </div>
);
}

export default PitchTrainer;