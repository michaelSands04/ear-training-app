import { useState, useEffect } from "react";

const baseNotes = ["C", "D", "E", "F", "G", "A", "B"];

const noteSemitones = {
  C: 0,
  D: 2,
  E: 4,
  F: 5,
  G: 7,
  A: 9,
  B: 11,
};

const allIntervals = [
  { name: "Unison", semitones: 0, difficulty: "easy" },
  { name: "Major 2nd", semitones: 2, difficulty: "easy" },
  { name: "Major 3rd", semitones: 4, difficulty: "easy" },
  { name: "Perfect 4th", semitones: 5, difficulty: "easy" },
  { name: "Perfect 5th", semitones: 7, difficulty: "easy" },

  { name: "Minor 2nd", semitones: 1, difficulty: "medium" },
  { name: "Minor 3rd", semitones: 3, difficulty: "medium" },
  { name: "Octave", semitones: 12, difficulty: "medium" },

  { name: "Tritone", semitones: 6, difficulty: "hard" },
  { name: "Minor 6th", semitones: 8, difficulty: "hard" },
  { name: "Major 6th", semitones: 9, difficulty: "hard" },

  { name: "Minor 7th", semitones: 10, difficulty: "expert" },
  { name: "Major 7th", semitones: 11, difficulty: "expert" },
];

const difficultySettings = {
  easy: {
    label: "Easy",
    octaves: [4],
    allowedIntervalDifficulties: ["easy"],
  },
  medium: {
    label: "Medium",
    octaves: [3, 4, 5],
    allowedIntervalDifficulties: ["easy", "medium"],
  },
  hard: {
    label: "Hard",
    octaves: [2, 3, 4, 5, 6],
    allowedIntervalDifficulties: ["easy", "medium", "hard"],
  },
  expert: {
    label: "Expert",
    octaves: [1, 2, 3, 4, 5, 6, 7],
    allowedIntervalDifficulties: ["easy", "medium", "hard", "expert"],
  },
};

function PitchTrainer() {
  const [currentNote, setCurrentNote] = useState("");
  const [currentPitch, setCurrentPitch] = useState(null);
  const [result, setResult] = useState("");
  const [score, setScore] = useState(0);
  const [hasPlayed, setHasPlayed] = useState(false);
  const [answered, setAnswered] = useState(false);
  const [attempts, setAttempts] = useState(0);
  const [mistakes, setMistakes] = useState({});
  const [mode, setMode] = useState("note");
  const [currentInterval, setCurrentInterval] = useState(null);
  const [rootPitch, setRootPitch] = useState(null);
  const [intervalMistakes, setIntervalMistakes] = useState({});
  const [difficulty, setDifficulty] = useState("easy");
  const [recentAnswers, setRecentAnswers] = useState([]);
  const [feedbackMessage, setFeedbackMessage] = useState(
    "Complete a few exercises and I’ll personalise your practice."
  );

  // Load saved data from browser storage
  useEffect(() => {
    const savedScore = localStorage.getItem("score");
    const savedAttempts = localStorage.getItem("attempts");
    const savedMistakes = localStorage.getItem("mistakes");
    const savedIntervalMistakes = localStorage.getItem("intervalMistakes");
    const savedDifficulty = localStorage.getItem("difficulty");

    if (savedScore) setScore(Number(savedScore));
    if (savedAttempts) setAttempts(Number(savedAttempts));
    if (savedMistakes) setMistakes(JSON.parse(savedMistakes));
    if (savedIntervalMistakes) {
      setIntervalMistakes(JSON.parse(savedIntervalMistakes));
    }
    if (savedDifficulty) setDifficulty(savedDifficulty);
  }, []);

  // Save progress to browser storage
  useEffect(() => {
    localStorage.setItem("score", score);
    localStorage.setItem("attempts", attempts);
    localStorage.setItem("mistakes", JSON.stringify(mistakes));
    localStorage.setItem("intervalMistakes", JSON.stringify(intervalMistakes));
    localStorage.setItem("difficulty", difficulty);
  }, [score, attempts, mistakes, intervalMistakes, difficulty]);

  const accuracy = attempts > 0 ? ((score / attempts) * 100).toFixed(1) : 0;

  // Converts notes such as C4, A5, B2 into frequencies using A4 = 440Hz
  const getFrequency = (note, octave) => {
    const midiNumber = (octave + 1) * 12 + noteSemitones[note];
    return 440 * Math.pow(2, (midiNumber - 69) / 12);
  };

  // Calculates second interval tone based on semitone distance
  const getFrequencyFromSemitone = (rootFreq, semitones) => {
    return rootFreq * Math.pow(2, semitones / 12);
  };

  const getAvailableIntervals = () => {
    const allowed = difficultySettings[difficulty].allowedIntervalDifficulties;

    return allIntervals.filter((interval) =>
      allowed.includes(interval.difficulty)
    );
  };

  const createRandomPitch = (preferredNote = null) => {
    const octaves = difficultySettings[difficulty].octaves;

    const note =
      preferredNote || baseNotes[Math.floor(Math.random() * baseNotes.length)];

    const octave = octaves[Math.floor(Math.random() * octaves.length)];

    const frequency = getFrequency(note, octave);

    return {
      note,
      octave,
      label: `${note}${octave}`,
      frequency,
    };
  };

  const getCurrentNoteAnswers = () => {
    if (mode !== "note") return baseNotes;
  
    // If a note has been generated, show notes in that same octave
    if (currentPitch) {
      return baseNotes.map((note) => `${note}${currentPitch.octave}`);
    }
  
    // Before an exercise starts, show the default notes for the current difficulty
    const defaultOctave = difficultySettings[difficulty].octaves[0];
    return baseNotes.map((note) => `${note}${defaultOctave}`);
  };

  const playTone = (frequency) => {
    const audioContext = new (window.AudioContext ||
      window.webkitAudioContext)();

    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();

    oscillator.type = "sine";
    oscillator.frequency.setValueAtTime(frequency, audioContext.currentTime);

    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);

    // Smooth fade in/out to stop harsh clicking sounds
    gainNode.gain.setValueAtTime(0, audioContext.currentTime);
    gainNode.gain.linearRampToValueAtTime(0.5, audioContext.currentTime + 0.05);
    gainNode.gain.linearRampToValueAtTime(0, audioContext.currentTime + 1);

    oscillator.start();
    oscillator.stop(audioContext.currentTime + 1);
  };

  const generateNote = () => {
    if (mode === "interval") {
      generateInterval();
      return;
    }

    const weightedNotes = Object.entries(mistakes).flatMap(([note, count]) =>
      Array(count).fill(note)
    );

    let pitchToPlay;

    if (weightedNotes.length > 0 && Math.random() < 0.7) {
      const weakPitchLabel =
        weightedNotes[Math.floor(Math.random() * weightedNotes.length)];
    
      // Extract the note name from labels like "C4", "B5", "A3"
      const weakNote = weakPitchLabel[0];
    
      pitchToPlay = createRandomPitch(weakNote);
    } else {
      pitchToPlay = createRandomPitch();
    }

    setCurrentPitch(pitchToPlay);
    setCurrentNote(pitchToPlay.note);
    setResult("");
    setAnswered(false);
    setHasPlayed(true);

    playTone(pitchToPlay.frequency);
  };

  const generateInterval = () => {
    const availableIntervals = getAvailableIntervals();

    const interval =
      availableIntervals[Math.floor(Math.random() * availableIntervals.length)];

    const root = createRandomPitch();

    const secondFreq = getFrequencyFromSemitone(
      root.frequency,
      interval.semitones
    );

    setRootPitch(root);
    setCurrentInterval(interval);
    setResult("");
    setAnswered(false);
    setHasPlayed(true);

    playTone(root.frequency);
    setTimeout(() => playTone(secondFreq), 1000);
  };



  const generateAdaptiveFeedback = (updatedRecentAnswers) => {
    const recentMistakes = updatedRecentAnswers.filter((entry) => !entry.correct);
  
    if (recentMistakes.length < 3) {
      return "Keep going — I’ll personalise your practice as more results come in.";
    }
  
    const noteMistakes = recentMistakes.filter((entry) => entry.mode === "note");
    const intervalMistakes = recentMistakes.filter(
      (entry) => entry.mode === "interval"
    );
  
    if (noteMistakes.length >= 3) {
      const noteCounts = {};
  
      noteMistakes.forEach((entry) => {
        const noteName = entry.target[0];
        noteCounts[noteName] = (noteCounts[noteName] || 0) + 1;
      });
  
      const weakestNote = Object.entries(noteCounts).sort(
        (a, b) => b[1] - a[1]
      )[0];
  
      if (weakestNote) {
        return `You seem to be finding ${weakestNote[0]} notes difficult. I’ll prioritise these in upcoming exercises.`;
      }
    }
  
    if (intervalMistakes.length >= 2) {
      const intervalCounts = {};
  
      intervalMistakes.forEach((entry) => {
        intervalCounts[entry.target] = (intervalCounts[entry.target] || 0) + 1;
      });
  
      const weakestInterval = Object.entries(intervalCounts).sort(
        (a, b) => b[1] - a[1]
      )[0];
  
      if (weakestInterval) {
        return `You seem to be finding ${weakestInterval[0]} intervals difficult. I’ll include more of these for targeted practice.`;
      }
    }
  
    return "Good progress — I’m continuing to adjust your exercises based on your answers.";
  };

  const replayNote = () => {
    if (mode === "note") {
      if (!currentPitch) return;

      playTone(currentPitch.frequency);
    } else {
      if (!currentInterval || !rootPitch) return;

      const secondFreq = getFrequencyFromSemitone(
        rootPitch.frequency,
        currentInterval.semitones
      );

      playTone(rootPitch.frequency);
      setTimeout(() => playTone(secondFreq), 1000);
    }
  };

  const checkAnswer = (answer) => {
    if (!hasPlayed) {
      setResult("⚠️ Play an exercise first!");
      return;
    }
  
    if (answered) return;
  
    setAnswered(true);
    setAttempts(attempts + 1);
  
    let isCorrect = false;
    let target = "";
    let attemptData = {};
  
    if (mode === "interval") {
      target = currentInterval.name;
      isCorrect = answer === currentInterval.name;
  
      attemptData = {
        mode: "interval",
        target: currentInterval.name,
        root: rootPitch ? rootPitch.label : null,
        answer: answer,
        correct: isCorrect,
        difficulty: difficulty,
        timestamp: Date.now(),
      };
  
      if (isCorrect) {
        setResult("✅ Correct!");
        setScore(score + 1);
      } else {
        setResult(`❌ Wrong! It was ${currentInterval.name}`);
  
        setIntervalMistakes((prev) => ({
          ...prev,
          [currentInterval.name]: (prev[currentInterval.name] || 0) + 1,
        }));
      }
    } else {
      target = currentPitch.label;
      isCorrect = answer === currentPitch.label;
  
      attemptData = {
        mode: "note",
        target: currentPitch.label,
        note: currentPitch.note,
        octave: currentPitch.octave,
        answer: answer,
        correct: isCorrect,
        difficulty: difficulty,
        timestamp: Date.now(),
      };
  
      if (isCorrect) {
        setResult("✅ Correct!");
        setScore(score + 1);
      } else {
        setResult(`❌ Wrong! It was ${currentPitch.label}`);
  
        setMistakes((prev) => ({
          ...prev,
          [currentPitch.label]: (prev[currentPitch.label] || 0) + 1,
        }));
      }
    }
  
    const updatedRecentAnswers = [...recentAnswers, attemptData].slice(-20);
    setRecentAnswers(updatedRecentAnswers);
  
    const newFeedback = generateAdaptiveFeedback(updatedRecentAnswers);
    setFeedbackMessage(newFeedback);
  };

  const resetProgress = () => {
    setScore(0);
    setAttempts(0);
    setMistakes({});
    setIntervalMistakes({});
    setResult("");
    setAnswered(false);
    setHasPlayed(false);
    setCurrentNote("");
    setCurrentPitch(null);
    setCurrentInterval(null);
    setRootPitch(null);

    localStorage.removeItem("score");
    localStorage.removeItem("attempts");
    localStorage.removeItem("mistakes");
    localStorage.removeItem("intervalMistakes");
  };

  return (
    <div style={{ maxWidth: "500px", margin: "auto", textAlign: "center" }}>
      <h2>Pitch Trainer</h2>

      <div style={{ marginBottom: "10px" }}>
        <button onClick={() => setMode("note")}>Note Mode</button>
        <button onClick={() => setMode("interval")}>Interval Mode</button>
      </div>

      <div style={{ marginBottom: "10px" }}>
        <button onClick={() => setDifficulty("easy")}>Easy</button>
        <button onClick={() => setDifficulty("medium")}>Medium</button>
        <button onClick={() => setDifficulty("hard")}>Hard</button>
        <button onClick={() => setDifficulty("expert")}>Expert</button>
      </div>

      <p>Mode: {mode === "note" ? "Note Recognition" : "Interval Training"}</p>
      <p>Difficulty: {difficultySettings[difficulty].label}</p>
      
      {mode === "interval" && rootPitch && (
      <p>Reference Note / First Note: {rootPitch.label}</p>
      )}

      <button onClick={generateNote}>New Note</button>
      <button onClick={replayNote}>Replay</button>

      <div style={{ marginTop: "10px", padding: "10px 15px" }}>
          {(mode === "note"
            ? getCurrentNoteAnswers()
            : getAvailableIntervals().map((interval) => interval.name)
          ).map((item) => (
          <button
            key={item}
            onClick={() => checkAnswer(item)}
            style={{ margin: "5px", padding: "10px 15px" }}
            disabled={answered}
          >
            {item}
          </button>
        ))}
      </div>

      <p>{result}</p>

      <div style={{ marginTop: "20px" }}>
        <h3>Personalised Feedback</h3>
        <p>{feedbackMessage}</p>
        <h3>Stats</h3>
        <p>Score: {score}</p>
        <p>Attempts: {attempts}</p>
        <p>Accuracy: {accuracy}%</p>

        <h3>Weak Note Areas</h3>
        {Object.keys(mistakes).length === 0 ? (
          <p>No weak note areas yet.</p>
        ) : (
          <ul>
            {Object.entries(mistakes).map(([note, count]) => (
              <li key={note}>
                {note}: {count} mistake{count > 1 ? "s" : ""}
              </li>
            ))}
          </ul>
        )}

        <h3>Weak Interval Areas</h3>
        {Object.keys(intervalMistakes).length === 0 ? (
          <p>No weak interval areas yet.</p>
        ) : (
          <ul>
            {Object.entries(intervalMistakes).map(([interval, count]) => (
              <li key={interval}>
                {interval}: {count} mistake{count > 1 ? "s" : ""}
              </li>
            ))}
          </ul>
        )}

        <button onClick={resetProgress} style={{ marginTop: "10px" }}>
          Reset Progress
        </button>
      </div>
    </div>
  );
}

export default PitchTrainer;