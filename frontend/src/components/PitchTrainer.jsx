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
    const random = notes[Math.floor(Math.random() * notes.length)];
    setCurrentNote(random);
    setResult("");
    setAnswered(false);
    setHasPlayed(true);
  };

  const replayNote = () => {
    if (!currentNote) return;
  
    const frequency = noteFrequencies[currentNote];
    playTone(frequency);
  };
  
  // accuracy
  const accuracy =
  attempts > 0 ? ((score / attempts) * 100).toFixed(1) : 0;

  //  check answer
  const checkAnswer = (note) => {
  if (!hasPlayed) {
    setResult("⚠️ Play a note first!");
    return;
  }

  if (answered) return;

  setAnswered(true);
  setAttempts(attempts + 1); // ✅ count attempt

  if (note === currentNote) {
    setResult("✅ Correct!");
    setScore(score + 1);
  } else {
    setResult(`❌ Wrong! It was ${currentNote}`);
  }
};

  return (
    <div>
      <h2>Pitch Trainer</h2>

      <button onClick={generateNote}>New Note</button>
      <button onClick={replayNote}>Play Note</button>

      <div style={{ marginTop: "10px" }}>
        {notes.map((note) => (
          <button
            key={note}
            onClick={() => checkAnswer(note)}
            style={{ margin: "5px" }}
          >
            {note}
          </button>
        ))}
      </div>

      <p>{result}</p>
      <p>Score: {score}</p>
      <p>Attempts: {attempts}</p>
      <p>Accuracy: {accuracy}%</p>
    </div>
  );
}

export default PitchTrainer;