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
    octaves: [4, 5],
    allowedIntervalDifficulties: ["easy", "medium"],
  },
  hard: {
    label: "Hard",
    octaves: [3, 4, 5,],
    allowedIntervalDifficulties: ["easy", "medium", "hard"],
  },
  expert: {
    label: "Expert",
    octaves: [2, 3, 4, 5,],
    allowedIntervalDifficulties: ["easy", "medium", "hard", "expert"],
  },
};


const helperCharacters = [
  {
    levelRequired: 1,
    name: "Melody",
    emoji: "🌿🎧",
    description: "Your first music helper.",
  },
  {
    levelRequired: 2,
    name: "Bongo",
    emoji: "🐸🥁",
    description: "Keeps the beat while you practise.",
  },
  {
    levelRequired: 3,
    name: "Pip",
    emoji: "🐱🎵",
    description: "Helps you spot tricky notes.",
  },
  {
    levelRequired: 5,
    name: "Nova",
    emoji: "🚀🎶",
    description: "Explores harder sounds with you.",
  },
  {
    levelRequired: 8,
    name: "Draco",
    emoji: "🐉🎼",
    description: "A master helper for advanced practice.",
  },
];

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
  const [feedbackMessage, setFeedbackMessage] = useState("Complete a few exercises and I'll personalise your practice.");
  const [lastGeneratedNotes, setLastGeneratedNotes] = useState([]);
  const [lastGeneratedIntervals, setLastGeneratedIntervals] = useState([]);
  const [uiMode, setUiMode] = useState(null);
  const [xp, setXp] = useState(0);
  const [level, setLevel] = useState(1);
  const [streak, setStreak] = useState(0);
  const [bestStreak, setBestStreak] = useState(0);

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

  const hasRecentlyRepeatedTooMuch = (note) => {
    const recent = lastGeneratedNotes.slice(-3);
    const repeatCount = recent.filter((item) => item === note).length;
  
    return repeatCount >= 2;
  };


  const getRecentWeakNotes = () => {
    const recentNoteMistakes = recentAnswers
      .filter((entry) => entry.mode === "note" && !entry.correct)
      .slice(-10);
  
    const noteCounts = {};
  
    recentNoteMistakes.forEach((entry) => {
      noteCounts[entry.note] = (noteCounts[entry.note] || 0) + 1;
    });
  
    return Object.entries(noteCounts).flatMap(([note, count]) =>
      Array(count).fill(note)
    );
  };




  const generateNote = () => {
    if (mode === "interval") {
      generateInterval();
      return;
    }
  
    const recentWeakNotes = getRecentWeakNotes();
  
    const allTimeWeightedNotes = Object.entries(mistakes).flatMap(
      ([pitchLabel, count]) => {
        const noteName = pitchLabel[0];
        return Array(count).fill(noteName);
      }
    );
  
    let pitchToPlay;
    let selectedNote = null;
  
    // 55% chance to use recent weak notes
    if (recentWeakNotes.length > 0 && Math.random() < 0.55) {
      const shuffledWeakNotes = [...recentWeakNotes].sort(
        () => Math.random() - 0.5
      );
  
      selectedNote = shuffledWeakNotes.find(
        (note) => !hasRecentlyRepeatedTooMuch(note)
      );
    }
  
    // 25% chance to use all-time weak notes
    if (!selectedNote && allTimeWeightedNotes.length > 0 && Math.random() < 0.25) {
      const shuffledAllTimeNotes = [...allTimeWeightedNotes].sort(
        () => Math.random() - 0.5
      );
  
      selectedNote = shuffledAllTimeNotes.find(
        (note) => !hasRecentlyRepeatedTooMuch(note)
      );
    }
  
    // fallback to random note
    if (!selectedNote) {
      const availableNotes = baseNotes.filter(
        (note) => !hasRecentlyRepeatedTooMuch(note)
      );
  
      const notePool = availableNotes.length > 0 ? availableNotes : baseNotes;
  
      selectedNote = notePool[Math.floor(Math.random() * notePool.length)];
    }
  
    pitchToPlay = createRandomPitch(selectedNote);
  
    setLastGeneratedNotes((prev) => [...prev, selectedNote].slice(-5));
  
    setCurrentPitch(pitchToPlay);
    setCurrentNote(pitchToPlay.note);
    setResult("");
    setAnswered(false);
    setHasPlayed(true);
  
    playTone(pitchToPlay.frequency);
  };

  const hasRecentlyRepeatedIntervalTooMuch = (intervalName) => {
    const recent = lastGeneratedIntervals.slice(-3);
    const repeatCount = recent.filter((item) => item === intervalName).length;
  
    return repeatCount >= 2;
  };

  const getRecentWeakIntervals = () => {
    const recentIntervalMistakes = recentAnswers
      .filter((entry) => entry.mode === "interval" && !entry.correct)
      .slice(-10);
  
    const intervalCounts = {};
  
    recentIntervalMistakes.forEach((entry) => {
      intervalCounts[entry.target] = (intervalCounts[entry.target] || 0) + 1;
    });
  
    return Object.entries(intervalCounts).flatMap(([intervalName, count]) =>
      Array(count).fill(intervalName)
    );
  };



  const generateInterval = () => {
    const availableIntervals = getAvailableIntervals();
    const recentWeakIntervals = getRecentWeakIntervals();
  
    let selectedIntervalName = null;
    let interval = null;
  
    if (recentWeakIntervals.length > 0 && Math.random() < 0.55) {
      const shuffledWeakIntervals = [...recentWeakIntervals].sort(
        () => Math.random() - 0.5
      );
  
      selectedIntervalName = shuffledWeakIntervals.find(
        (intervalName) => !hasRecentlyRepeatedIntervalTooMuch(intervalName)
      );
    }
  
    if (!selectedIntervalName) {
      const availableIntervalNames = availableIntervals
        .map((item) => item.name)
        .filter(
          (intervalName) => !hasRecentlyRepeatedIntervalTooMuch(intervalName)
        );
  
      const intervalPool =
        availableIntervalNames.length > 0
          ? availableIntervalNames
          : availableIntervals.map((item) => item.name);
  
      selectedIntervalName =
        intervalPool[Math.floor(Math.random() * intervalPool.length)];
    }
  
    interval =
      availableIntervals.find((item) => item.name === selectedIntervalName) ||
      availableIntervals[Math.floor(Math.random() * availableIntervals.length)];
  
    const maxAllowedOctave = Math.max(...difficultySettings[difficulty].octaves);
    const maxAllowedMidi = (maxAllowedOctave + 1) * 12 + 11; // B of max octave
  
    let root = null;
    let attempts = 0;
  
    do {
      const candidateRoot = createRandomPitch();
  
      const rootMidi =
        (candidateRoot.octave + 1) * 12 + noteSemitones[candidateRoot.note];
  
      const secondMidi = rootMidi + interval.semitones;
  
      if (secondMidi <= maxAllowedMidi) {
        root = candidateRoot;
        break;
      }
  
      attempts++;
    } while (attempts < 30);
  
    // fallback if it somehow fails after 30 attempts
    if (!root) {
      root = createRandomPitch();
    }
  
    const secondFreq = getFrequencyFromSemitone(
      root.frequency,
      interval.semitones
    );
  
    setRootPitch(root);
    setCurrentInterval(interval);
    setResult("");
    setAnswered(false);
    setHasPlayed(true);
  
    setLastGeneratedIntervals((prev) => [...prev, interval.name].slice(-5));
  
    playTone(root.frequency);
    setTimeout(() => playTone(secondFreq), 1000);
  };



  const generateAdaptiveFeedback = (answers, activeMode) => {
    const recentMistakes = answers.filter((entry) => !entry.correct);
  
    if (answers.length < 3) {
      return "Complete a few more exercises and I’ll start personalising your practice.";
    }
  
    if (recentMistakes.length === 0 && answers.length >= 5) {
      return "Your recent answers are strong. You may be ready to increase the difficulty.";
    }
  
    const noteMistakes = recentMistakes.filter((entry) => entry.mode === "note");
  
    const intervalMistakesOnly = recentMistakes.filter(
      (entry) => entry.mode === "interval"
    );
  
    const getWeakestNoteFeedback = () => {
      if (noteMistakes.length < 2) return null;
  
      const noteCounts = {};
  
      noteMistakes.forEach((entry) => {
        noteCounts[entry.note] = (noteCounts[entry.note] || 0) + 1;
      });
  
      const weakestNote = Object.entries(noteCounts).sort(
        (a, b) => b[1] - a[1]
      )[0];
  
      if (!weakestNote) return null;
  
      return `You seem to be finding ${weakestNote[0]} notes difficult. I’ll include more of these while still mixing in other practice.`;
    };
  
    const getWeakestIntervalFeedback = () => {
      if (intervalMistakesOnly.length < 2) return null;
  
      const intervalCounts = {};
  
      intervalMistakesOnly.forEach((entry) => {
        intervalCounts[entry.target] = (intervalCounts[entry.target] || 0) + 1;
      });
  
      const weakestInterval = Object.entries(intervalCounts).sort(
        (a, b) => b[1] - a[1]
      )[0];
  
      if (!weakestInterval) return null;
  
      return `You seem to be finding ${weakestInterval[0]} intervals difficult. I’ll include more of these while still mixing in other practice.`;
    };
  
    // Important bit: prioritise feedback based on the current mode
    if (activeMode === "interval") {
      const intervalFeedback = getWeakestIntervalFeedback();
      if (intervalFeedback) return intervalFeedback;
  
      const noteFeedback = getWeakestNoteFeedback();
      if (noteFeedback) return noteFeedback;
    }
  
    if (activeMode === "note") {
      const noteFeedback = getWeakestNoteFeedback();
      if (noteFeedback) return noteFeedback;
  
      const intervalFeedback = getWeakestIntervalFeedback();
      if (intervalFeedback) return intervalFeedback;
    }
  
    const recentCorrect = answers.filter((entry) => entry.correct).length;
    const recentAccuracy = (recentCorrect / answers.length) * 100;
  
    if (recentAccuracy >= 80 && answers.length >= 5) {
      return "Your recent accuracy is strong. You may be ready for a harder difficulty.";
    }
  
    if (recentAccuracy < 50 && answers.length >= 5) {
      return "Your recent accuracy has dropped. I’ll keep focusing on your weaker areas for now.";
    }
  
    return "Good progress. I’m continuing to adjust your exercises based on your answers.";
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



  const isChildMode = uiMode === "child";

  const getResultMessage = () => {
    if (!result) return "";
  
    if (!isChildMode) return result;
  
    if (result.includes("Correct")) {
      return "🌟 Brilliant! You got it right!";
    }
  
    if (result.includes("Wrong")) {
      return result.replace("❌ Wrong!", "😊 Oops, not quite!");
    }
  
    if (result.includes("Play")) {
      return "🎵 Press New Sound first!";
    }
  
    return result;
  };
  
  const getFeedbackMessage = () => {
    if (!isChildMode) return feedbackMessage;
  
    if (feedbackMessage.includes("difficult")) {
      return feedbackMessage
        .replace("You seem to be finding", "Looks like")
        .replace("difficult", "is a little tricky today")
        .replace(
          "I’ll include more of these for targeted practice.",
          "Let’s practise it a little more together!"
        );
    }
  
    return "Keep going! Your helper is watching what feels tricky and will help you practise it 🎵";
  };
  
  const helperCharacter =
  helperCharacters
    .filter((helper) => level >= helper.levelRequired)
    .sort((a, b) => b.levelRequired - a.levelRequired)[0] ||
  helperCharacters[0];

const nextHelper = helperCharacters.find(
  (helper) => helper.levelRequired > level
);
  
  const styles = {
    page: {
      minHeight: "100vh",
      width: "100%",
      margin: 0,
      padding: "24px",
      boxSizing: "border-box",
      overflowX: "hidden",
      background: isChildMode
        ? "linear-gradient(135deg, #dfffd6 0%, #f7fff4 45%, #c8f7b8 100%)"
        : "linear-gradient(135deg, #e5e7eb 0%, #f8fafc 50%, #dbeafe 100%)",
      fontFamily: "Inter, Arial, sans-serif",
      color: "#14351f",
    },
  
    shell: {
      width: "100%",
      maxWidth: "1120px",
      margin: "0 auto",
      background: "#ffffff",
      borderRadius: "32px",
      padding: "28px",
      boxSizing: "border-box",
      boxShadow: "0 18px 45px rgba(34, 94, 45, 0.18)",
    },

    header: {
      textAlign: "center",
      marginBottom: "28px",
    },
  
    title: {
      fontSize: isChildMode ? "44px" : "38px",
      margin: "0 0 8px",
      color: isChildMode ? "#14532d" : "#111827",
    },
  
    subtitle: {
      color: "#64748b",
      fontSize: "18px",
      margin: 0,
    },
  
    
    layout: {
      display: "grid",
      gridTemplateColumns: "minmax(0, 1fr) 300px",
      gap: "20px",
      alignItems: "start",
      width: "100%",
      boxSizing: "border-box",
    },
  
    card: {
      background: isChildMode ? "#f8fff3" : "#f9fafb",
      border: "1px solid #d9f5ce",
      borderRadius: "24px",
      padding: "24px",
      marginBottom: "20px",
      boxShadow: "0 6px 18px rgba(0,0,0,0.06)",
    },
  
    sideCard: {
      background: "#ffffff",
      border: "1px solid #d9f5ce",
      borderRadius: "24px",
      padding: "22px",
      marginBottom: "20px",
      boxShadow: "0 8px 20px rgba(34, 94, 45, 0.12)",
      overflowWrap: "break-word",
      boxSizing: "border-box",
    },
  
    primaryButton: {
      margin: "7px",
      padding: isChildMode ? "15px 24px" : "12px 18px",
      fontSize: isChildMode ? "18px" : "15px",
      borderRadius: "16px",
      border: "none",
      cursor: "pointer",
      background: "linear-gradient(135deg, #22c55e, #15803d)",
      color: "white",
      fontWeight: "700",
      boxShadow: "0 6px 12px rgba(34, 197, 94, 0.28)",
    },
  
    secondaryButton: {
      margin: "7px",
      padding: isChildMode ? "13px 22px" : "10px 16px",
      fontSize: isChildMode ? "17px" : "15px",
      borderRadius: "16px",
      border: "1px solid #bbf7d0",
      cursor: "pointer",
      background: "#ffffff",
      color: "#14532d",
      fontWeight: "700",
    },
  
    answerButton: {
      margin: "8px",
      padding: isChildMode ? "18px 24px" : "15px 22px",
      fontSize: isChildMode ? "21px" : "18px",
      borderRadius: "18px",
      border: "1px solid #bbf7d0",
      cursor: "pointer",
      background: "#ffffff",
      color: "#14532d",
      fontWeight: "800",
      minWidth: "80px",
      boxShadow: "0 5px 12px rgba(0,0,0,0.08)",
    },
  
    statRow: {
      display: "flex",
      justifyContent: "space-between",
      padding: "10px 0",
      borderBottom: "1px solid #ecfdf5",
      fontSize: "17px",
    },
  };


  const calculateLevel = (newXp) => {
    return Math.floor(newXp / 100) + 1;
  };
  
  const addXp = (amount) => {
    setXp((prevXp) => {
      const newXp = prevXp + amount;
      setLevel(calculateLevel(newXp));
      return newXp;
    });
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
    let attemptData = {};
  
    if (mode === "interval") {
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
  
        const newStreak = streak + 1;
        setStreak(newStreak);
  
        if (newStreak > bestStreak) {
          setBestStreak(newStreak);
        }
  
        if (newStreak > 0 && newStreak % 3 === 0) {
          addXp(15);
        } else {
          addXp(10);
        }
      } else {
        setResult(`⚠️ Not Quite, It was ${currentInterval.name}`);
  
        setStreak(0);
        addXp(2);
  
        setIntervalMistakes((prev) => ({
          ...prev,
          [currentInterval.name]: (prev[currentInterval.name] || 0) + 1,
        }));
      }
    } else {
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
  
        const newStreak = streak + 1;
        setStreak(newStreak);
  
        if (newStreak > bestStreak) {
          setBestStreak(newStreak);
        }
  
        if (newStreak > 0 && newStreak % 3 === 0) {
          addXp(15);
        } else {
          addXp(10);
        }
      } else {
        setResult(`⚠️ Not Quite, It was ${currentPitch.label}`);
  
        setStreak(0);
        addXp(2);
  
        setMistakes((prev) => ({
          ...prev,
          [currentPitch.label]: (prev[currentPitch.label] || 0) + 1,
        }));
      }
    }
  
    const updatedRecentAnswers = [...recentAnswers, attemptData].slice(-20);
    setRecentAnswers(updatedRecentAnswers);
  
    const newFeedback = generateAdaptiveFeedback(updatedRecentAnswers, mode);
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
    setXp(0);
    setLevel(1);
    setStreak(0);
    setBestStreak(0);

    localStorage.removeItem("score");
    localStorage.removeItem("attempts");
    localStorage.removeItem("mistakes");
    localStorage.removeItem("intervalMistakes");
  };

  const getModeButtonStyle = (buttonMode) => {
    const isActive = mode === buttonMode;
  
    return {
      ...styles.secondaryButton,
      background: isActive
        ? "linear-gradient(135deg, #22c55e, #15803d)"
        : "#ffffff",
      color: isActive ? "white" : "#14532d",
      border: isActive ? "none" : "1px solid #bbf7d0",
      boxShadow: isActive
        ? "0 6px 14px rgba(34, 197, 94, 0.35)"
        : "none",
    };
  };
  
  const getDifficultyButtonStyle = (buttonDifficulty) => {
    const isActive = difficulty === buttonDifficulty;
  
    const adultColours = {
      easy: "#22c55e",
      medium: "#2563eb",
      hard: "#ea580c",
      expert: "#7c3aed",
    };
  
    const childColours = {
      easy: "#4ade80",
      medium: "#60a5fa",
      hard: "#fb923c",
      expert: "#a78bfa",
    };
  
    const colours = isChildMode ? childColours : adultColours;
  
    return {
      ...styles.secondaryButton,
      background: isActive ? colours[buttonDifficulty] : "#ffffff",
      color: isActive ? "white" : "#14532d",
      border: isActive ? "none" : "1px solid #bbf7d0",
      boxShadow: isActive
        ? `0 6px 14px ${colours[buttonDifficulty]}66`
        : "none",
      transform: isActive ? "scale(1.03)" : "scale(1)",
    };
  };

  if (!uiMode) {
    return (
      <div
        style={{
          maxWidth: "600px",
          margin: "auto",
          textAlign: "center",
          marginTop: "100px",
          padding: "30px",
        }}
      >
        <h1>Adaptive Ear Training</h1>
  
        <p>Select your learning mode</p>
  
        <div style={{ marginTop: "30px" }}>
          <button
            onClick={() => setUiMode("adult")}
            style={{
              padding: "20px 40px",
              margin: "10px",
              fontSize: "18px",
              cursor: "pointer",
            }}
          >
            Adult Mode
          </button>
  
          <button
            onClick={() => setUiMode("child")}
            style={{
              padding: "20px 40px",
              margin: "10px",
              fontSize: "18px",
              cursor: "pointer",
            }}
          >
            Child Mode
          </button>
        </div>
      </div>
    );
  }

  return (
    <div style={styles.page}>
      <div style={styles.shell}>
        <div style={styles.header}>
          <h1 style={styles.title}>
            {isChildMode ? "🎵 Ear Training Adventure" : "Ear Training App"}
          </h1>
          <p style={styles.subtitle}>
            {isChildMode
              ? "Listen carefully, choose your answer, and keep practising!"
              : "Adaptive pitch and interval training with personalised feedback."}
          </p>
  
          <button onClick={() => setUiMode(null)} style={styles.secondaryButton}>
            Change UI Mode
          </button>
        </div>
  
        <div style={styles.layout}>
          <main>
            <div style={styles.card}>
              <h2>{isChildMode ? "Choose your game mode" : "Training Mode"}</h2>
              <button
                onClick={() => setMode("note")}
                style={getModeButtonStyle("note")}
              >
                🎵 Note Mode
              </button>

<button
  onClick={() => setMode("interval")}
  style={getModeButtonStyle("interval")}
>
  📊 Interval Mode
</button>
            </div>
  
            <div style={styles.card}>
              <h2>{isChildMode ? "Choose your challenge" : "Difficulty"}</h2>
              <button onClick={() => setDifficulty("easy")} style={getDifficultyButtonStyle("easy")}>⭐ Easy</button>
              <button onClick={() => setDifficulty("medium")} style={getDifficultyButtonStyle("medium")}>📈 Medium</button>
              <button onClick={() => setDifficulty("hard")} style={getDifficultyButtonStyle("hard")}>⛰️ Hard</button>
              <button onClick={() => setDifficulty("expert")} style={getDifficultyButtonStyle("expert")}>👑 Expert</button>
              <p>Current: <strong>{difficultySettings[difficulty].label}</strong></p>
            </div>
  
            <div style={styles.card}>
              <p>
                <strong>Mode:</strong>{" "}
                {mode === "note" ? "Note Recognition" : "Interval Training"}
              </p>
  
              {mode === "interval" && rootPitch && (
                <p>
                  <strong>Reference Note:</strong> {rootPitch.label}
                </p>
              )}
  
              <button onClick={generateNote} style={styles.primaryButton}>
                {isChildMode ? "🎵 New Sound" : "New Exercise"}
              </button>
  
              <button onClick={replayNote} style={styles.secondaryButton}>
                🔁 Replay
              </button>
  
              <div style={{ marginTop: "20px" }}>
                {(mode === "note"
                  ? getCurrentNoteAnswers()
                  : getAvailableIntervals().map((interval) => interval.name)
                ).map((item) => (
                  <button
                    key={item}
                    onClick={() => checkAnswer(item)}
                    style={styles.answerButton}
                    disabled={answered}
                  >
                    {item}
                  </button>
                ))}
              </div>
  
              <h2>{getResultMessage()}</h2>
            </div>
          </main>
  
          <aside>
          <div style={styles.sideCard}>
            <h2>🏆 {isChildMode ? "Your Progress" : "Progress"}</h2>

            <div style={styles.statRow}>
              <span>⭐ Score</span>
             <strong>{score}</strong>
           </div>

           <div style={styles.statRow}>
             <span>🎯 Attempts</span>
             <strong>{attempts}</strong>
            </div>

           <div style={styles.statRow}>
              <span>📈 Accuracy</span>
              <strong>{accuracy}%</strong>
            </div>

            <div style={styles.statRow}>
             <span>✨ Experience</span>
             <strong>{xp}</strong>
           </div>

            <div style={styles.statRow}>
             <span>🏅 Level</span>
             <strong>{level}</strong>
            </div>

            <div style={styles.statRow}>
             <span>🔥 Streak</span>
             <strong>{streak}</strong>
           </div>

           <div style={styles.statRow}>
              <span>🏆 Best Streak</span>
              <strong>{bestStreak}</strong>
            </div>

            <div style={{ marginTop: "16px", textAlign: "left" }}>
             <p style={{ marginBottom: "6px" }}>
               Experience to next level: {xp % 100}/100
             </p>

             <div
                style={{
                 width: "100%",
                  height: "14px",
                  backgroundColor: "#dcfce7",
                 borderRadius: "999px",
                 overflow: "hidden",
               }}
             >
                <div
                  style={{
                    width: `${xp % 100}%`,
                   height: "100%",
                    background: "linear-gradient(135deg, #22c55e, #15803d)",
                 }}
                />
             </div>
           </div>
          </div>
  
          <div style={styles.sideCard}>
          <h2>
           {isChildMode
             ? `${helperCharacter.emoji} ${helperCharacter.name} Says`
              : "Personalised Feedback"}
          </h2>

         {isChildMode && (
           <p style={{ fontSize: "14px", color: "#64748b", marginBottom: "10px" }}>
              {helperCharacter.description}
           </p>
        )}

         <p style={{ lineHeight: "1.5", fontSize: "15px" }}>
            {getFeedbackMessage()}
          </p>

          {isChildMode && nextHelper && (
           <div
             style={{
               marginTop: "14px",
               padding: "12px",
               borderRadius: "14px",
               backgroundColor: "#ecfdf5",
               border: "1px solid #bbf7d0",
             }}
           >
             <strong>Next helper:</strong>
             <p style={{ margin: "6px 0 0" }}>
               {nextHelper.emoji} {nextHelper.name} unlocks at Level{" "}
               {nextHelper.levelRequired}
             </p>
           </div>
         )}

         {isChildMode && !nextHelper && (
            <div
              style={{
              marginTop: "14px",
              padding: "12px",
              borderRadius: "14px",
              backgroundColor: "#ecfdf5",
              border: "1px solid #bbf7d0",
            }}
          >
            <strong>All helpers unlocked!</strong>
            <p style={{ margin: "6px 0 0" }}>You have collected every helper 🎉</p>
          </div>
        )}
      </div>

      {isChildMode && (
  <div style={styles.sideCard}>
    <h2>Helper Collection</h2>

    {helperCharacters.map((helper) => {
      const unlocked = level >= helper.levelRequired;

      return (
        <div
          key={helper.name}
          style={{
            padding: "10px",
            marginBottom: "8px",
            borderRadius: "12px",
            backgroundColor: unlocked ? "#dcfce7" : "#f1f5f9",
            opacity: unlocked ? 1 : 0.55,
          }}
        >
          <strong>
            {helper.emoji} {helper.name}
          </strong>
          <p style={{ margin: "4px 0 0", fontSize: "14px" }}>
            {unlocked
              ? "Unlocked!"
              : `Unlocks at Level ${helper.levelRequired}`}
          </p>
        </div>
      );
    })}
  </div>
)}
  
            {!isChildMode && (
              <div style={styles.sideCard}>
                <h2>Weak Areas</h2>
  
                <h3>Notes</h3>
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
  
                <h3>Intervals</h3>
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
              </div>
            )}
  
            <button onClick={resetProgress} style={styles.secondaryButton}>
              Reset Progress
            </button>
          </aside>
        </div>
      </div>
    </div>
  );
}

export default PitchTrainer;