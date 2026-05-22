import { useState, useEffect } from "react";
import "./PitchTrainer.css";

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

const defaultCustomIntervals = allIntervals
  .filter((interval) => interval.difficulty === "easy")
  .map((interval) => interval.name);

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
    octaves: [3, 4, 5],
    allowedIntervalDifficulties: ["easy", "medium", "hard"],
  },
  expert: {
    label: "Expert",
    octaves: [2, 3, 4, 5],
    allowedIntervalDifficulties: ["easy", "medium", "hard", "expert"],
  },
  custom: {
    label: "Custom",
    octaves: [],
    allowedIntervalDifficulties: ["easy", "medium", "hard", "expert"],
  },
};

const accountName = "localAccount";

const defaultProfiles = [];


const adultAvatarOptions = [
  {
    levelRequired: 1,
    name: "Starter",
    emoji: "🎧",
    description: "Default training avatar.",
  },
  {
    levelRequired: 2,
    name: "Robot",
    emoji: "🤖",
    description: "A focused practice bot.",
  },
  {
    levelRequired: 3,
    name: "Wizard",
    emoji: "🧙",
    description: "A calm guide for sharper listening.",
  },
  {
    levelRequired: 4,
    name: "Vampire",
    emoji: "🧛",
    description: "Practises at night. Naturally dramatic.",
  },
  {
    levelRequired: 5,
    name: "King",
    emoji: "👑",
    description: "For royal-level ear training.",
  },
  {
    levelRequired: 7,
    name: "Astronaut",
    emoji: "🧑‍🚀",
    description: "Explores advanced practice.",
  },
];

const childAvatarOptions = [
  {
    levelRequired: 1,
    name: "Frog",
    emoji: "🐸",
    description: "A cheerful starter friend.",
  },
  {
    levelRequired: 2,
    name: "Cat",
    emoji: "🐱",
    description: "Listens carefully to every sound.",
  },
  {
    levelRequired: 3,
    name: "Dog",
    emoji: "🐶",
    description: "Encourages you to keep trying.",
  },
  {
    levelRequired: 4,
    name: "Owl",
    emoji: "🦉",
    description: "A wise helper for tricky notes.",
  },
  {
    levelRequired: 5,
    name: "Fox",
    emoji: "🦊",
    description: "Quick and clever with intervals.",
  },
  {
    levelRequired: 7,
    name: "Dragon",
    emoji: "🐉",
    description: "A powerful practice companion.",
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
  const [progressLoaded, setProgressLoaded] = useState(false);
  const [profiles, setProfiles] = useState(defaultProfiles);
  const [selectedProfile, setSelectedProfile] = useState(null);
  const [newProfileName, setNewProfileName] = useState("");
  const [newProfileAvatar, setNewProfileAvatar] = useState("🎧");
  const [profilesLoaded, setProfilesLoaded] = useState(false);
  const [customOctaves, setCustomOctaves] = useState([4]);
  const [customIntervals, setCustomIntervals] = useState(defaultCustomIntervals);
  const [sessionActive, setSessionActive] = useState(false);
  const [sessionStartTime, setSessionStartTime] = useState(null);
  const [sessionAttempts, setSessionAttempts] = useState([]);
  const [lastSessionSummary, setLastSessionSummary] = useState(null);
  const [lessonScreen, setLessonScreen] = useState("setup");

  
  
  // Load saved data from browser storage
  useEffect(() => {
    if (!selectedProfile) return;
  
    const key = (name) => `${accountName}_${selectedProfile}_${name}`;
  
    const savedScore = localStorage.getItem(key("score"));
    const savedAttempts = localStorage.getItem(key("attempts"));
    const savedMistakes = localStorage.getItem(key("mistakes"));
    const savedIntervalMistakes = localStorage.getItem(key("intervalMistakes"));
    const savedDifficulty = localStorage.getItem(key("difficulty"));
    const savedXp = localStorage.getItem(key("xp"));
    const savedLevel = localStorage.getItem(key("level"));
    const savedStreak = localStorage.getItem(key("streak"));
    const savedBestStreak = localStorage.getItem(key("bestStreak"));
    const savedRecentAnswers = localStorage.getItem(key("recentAnswers"));
    const savedFeedbackMessage = localStorage.getItem(key("feedbackMessage"));
    const savedCustomOctaves = localStorage.getItem(key("customOctaves"));
    const savedCustomIntervals = localStorage.getItem(key("customIntervals"));
  
    if (savedScore) setScore(Number(savedScore));
    if (savedAttempts) setAttempts(Number(savedAttempts));
    if (savedMistakes) setMistakes(JSON.parse(savedMistakes));
    if (savedIntervalMistakes) {
      setIntervalMistakes(JSON.parse(savedIntervalMistakes));
    }
    if (savedDifficulty) setDifficulty(savedDifficulty);
    if (savedXp) setXp(Number(savedXp));
    if (savedLevel) setLevel(Number(savedLevel));
    if (savedStreak) setStreak(Number(savedStreak));
    if (savedBestStreak) setBestStreak(Number(savedBestStreak));
    if (savedRecentAnswers) setRecentAnswers(JSON.parse(savedRecentAnswers));
    if (savedFeedbackMessage) setFeedbackMessage(savedFeedbackMessage);
    if (savedCustomOctaves) setCustomOctaves(JSON.parse(savedCustomOctaves));
    if (savedCustomIntervals) {
      setCustomIntervals(JSON.parse(savedCustomIntervals));
    }
  
    setProgressLoaded(true);
  }, [selectedProfile]);

  // Save progress to browser storage
  useEffect(() => {
    if (!selectedProfile || !progressLoaded) return;
  
    const key = (name) => `${accountName}_${selectedProfile}_${name}`;
  
    localStorage.setItem(key("score"), score);
    localStorage.setItem(key("attempts"), attempts);
    localStorage.setItem(key("mistakes"), JSON.stringify(mistakes));
    localStorage.setItem(
      key("intervalMistakes"),
      JSON.stringify(intervalMistakes)
    );
    localStorage.setItem(key("difficulty"), difficulty);
    localStorage.setItem(key("xp"), xp);
    localStorage.setItem(key("level"), level);
    localStorage.setItem(key("streak"), streak);
    localStorage.setItem(key("bestStreak"), bestStreak);
    localStorage.setItem(key("recentAnswers"), JSON.stringify(recentAnswers));
    localStorage.setItem(key("feedbackMessage"), feedbackMessage);
    localStorage.setItem(key("customOctaves"), JSON.stringify(customOctaves));
    localStorage.setItem(key("customIntervals"), JSON.stringify(customIntervals));
  }, [
    selectedProfile,
    progressLoaded,
    score,
    attempts,
    mistakes,
    intervalMistakes,
    difficulty,
    xp,
    level,
    streak,
    bestStreak,
    recentAnswers,
    feedbackMessage,
    customOctaves,
    customIntervals,
  ]);

  useEffect(() => {
    const savedProfiles = localStorage.getItem(`${accountName}_profiles`);
  
    if (savedProfiles !== null) {
      setProfiles(JSON.parse(savedProfiles));
    } else {
      setProfiles(defaultProfiles);
    }
  
    setProfilesLoaded(true);
  }, []);
  
  useEffect(() => {
    if (!profilesLoaded) return;
  
    localStorage.setItem(`${accountName}_profiles`, JSON.stringify(profiles));
  }, [profiles, profilesLoaded]);

  useEffect(() => {
    if (uiMode === "child") {
      setNewProfileAvatar(childAvatarOptions[0].emoji);
    }
  
    if (uiMode === "adult") {
      setNewProfileAvatar(adultAvatarOptions[0].emoji);
    }
  }, [uiMode]);


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
    if (difficulty === "custom") {
      return allIntervals.filter((interval) =>
        customIntervals.includes(interval.name)
      );
    }
  
    const allowedDifficulties =
      difficultySettings[difficulty].allowedIntervalDifficulties;
  
    return allIntervals.filter((interval) =>
      allowedDifficulties.includes(interval.difficulty)
    );
  };

  

  // allows me to have custom octaves 
  const getActiveOctaves = () => {
    if (difficulty === "custom") {
      return customOctaves.length > 0 ? customOctaves : [4];
    }
  
    return difficultySettings[difficulty].octaves;
  };

  const createRandomPitch = (preferredNote = null) => {
    const octaves = getActiveOctaves();

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
    const defaultOctave = getActiveOctaves()[0];
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
    if (availableIntervals.length === 0) {
      setResult("Please select at least one interval.");
      return;
    }
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
  
    const maxAllowedOctave = Math.max(...getActiveOctaves());
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

  const accuracy =
  attempts > 0 ? ((score / attempts) * 100).toFixed(1) : 0;

  const getResultMessage = () => {
    if (!result) return "";
  
    if (!isChildMode) return result;
  
    if (result.includes("Correct")) {
      return "🌟 Brilliant! You got it right!";
    }
  
    if (result.includes("Wrong")) {
      return result.replace("❌ Wrong!", "😊 Oops, not quite!");
    }

    if (result.includes("Not quite")) {
      return result.replace("⚠️ Not quite.", "😊 Oops, not quite!");
    }
  
    if (result.includes("Play")) {
      return "🎵 Press New Sound first!";
    }
  
    return result;
  };
  
  const activeAvatarOptions = isChildMode
  ? childAvatarOptions
  : adultAvatarOptions;


  const unlockedAvatars = activeAvatarOptions.filter(
    (avatar) => level >= avatar.levelRequired
  );
  
  const nextAvatar = activeAvatarOptions.find(
    (avatar) => avatar.levelRequired > level
  );


  const updateProfileAvatar = (emoji) => {
    if (!selectedProfile) return;
  
    setProfiles((prev) =>
      prev.map((profile) =>
        profile.id === selectedProfile
          ? { ...profile, emoji: emoji }
          : profile
      )
    );
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
  
  
  
const theme = isChildMode
  ? {
      pageBg: "linear-gradient(135deg, #dfffd6 0%, #f7fff4 45%, #c8f7b8 100%)",
      shellBg: "#ffffff",
      cardBg: "#f8fff3",
      sideCardBg: "#ffffff",
      border: "#bbf7d0",
      text: "#14351f",
      heading: "#14532d",
      muted: "#64748b",
      primary: "#16a34a",
      primaryDark: "#15803d",
      primarySoft: "#dcfce7",
      shadow: "0 18px 45px rgba(34, 94, 45, 0.18)",
    }
  : {
      pageBg: "linear-gradient(135deg, #eaf2ff 0%, #f8fbff 45%, #dbeafe 100%)",
      shellBg: "#ffffff",
      cardBg: "#f7faff",
      sideCardBg: "#ffffff",
      border: "#bfdbfe",
      text: "#172033",
      heading: "#1e3a8a",
      muted: "#64748b",
      primary: "#2563eb",
      primaryDark: "#1d4ed8",
      primarySoft: "#dbeafe",
      shadow: "0 18px 45px rgba(37, 99, 235, 0.14)",
    };

  const styles = {
    page: {
      minHeight: "100vh",
      width: "100%",
      margin: 0,
      padding: "24px",
      boxSizing: "border-box",
      overflowX: "hidden",
      background: theme.pageBg,
      fontFamily: "Inter, Arial, sans-serif",
      color: theme.text,
    },
  
    shell: {
      width: "100%",
      maxWidth: "1280px",
      margin: "0 auto",
      background: theme.shellBg,
      borderRadius: "32px",
      padding: "28px",
      boxSizing: "border-box",
      boxShadow: theme.shadow,
    },

    header: {
      textAlign: "center",
      marginBottom: "28px",
    },
  
    title: {
      fontSize: isChildMode ? "44px" : "40px",
      margin: "0 0 8px",
      color: theme.heading,
    },
  
    subtitle: {
      color: theme.muted,
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
      background: theme.cardBg,
      border: `1px solid ${theme.border}`,
      borderRadius: "24px",
      padding: "24px",
      marginBottom: "20px",
      boxShadow: "0 6px 18px rgba(0,0,0,0.05)",
    },
  
    sideCard: {
      background: theme.sideCardBg,
      border: `1px solid ${theme.border}`,
      borderRadius: "24px",
      padding: "22px",
      marginBottom: "20px",
      boxShadow: "0 8px 20px rgba(0,0,0,0.07)",
      overflowWrap: "break-word",
      boxSizing: "border-box",
    },

    primaryButton: {
      margin: "7px",
      padding: isChildMode ? "15px 24px" : "12px 20px",
      fontSize: isChildMode ? "18px" : "16px",
      borderRadius: "16px",
      border: "none",
      cursor: "pointer",
      background: `linear-gradient(135deg, ${theme.primary}, ${theme.primaryDark})`,
      color: "white",
      fontWeight: "700",
      boxShadow: isChildMode
        ? "0 6px 12px rgba(34, 197, 94, 0.28)"
        : "0 6px 12px rgba(37, 99, 235, 0.24)",
    },
   secondaryButton: {
  margin: "7px",
  padding: isChildMode ? "13px 22px" : "10px 16px",
  fontSize: isChildMode ? "17px" : "15px",
  borderRadius: "16px",
  border: `1px solid ${theme.border}`,
  cursor: "pointer",
  background: "#ffffff",
  color: theme.heading,
  fontWeight: "700",
},
  
answerButton: {
  margin: "8px",
  padding: isChildMode ? "18px 24px" : "15px 22px",
  fontSize: isChildMode ? "21px" : "18px",
  borderRadius: "18px",
  border: `1px solid ${theme.border}`,
  cursor: "pointer",
  background: "#ffffff",
  color: theme.heading,
  fontWeight: "800",
  minWidth: "80px",
  boxShadow: "0 5px 12px rgba(0,0,0,0.06)",
},
  
statRow: {
  display: "flex",
  justifyContent: "space-between",
  padding: "10px 0",
  borderBottom: `1px solid ${isChildMode ? "#ecfdf5" : "#e0ecff"}`,
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

  const getSemitoneDistance = (answerLabel, correctPitch) => {
    if (!answerLabel || !correctPitch) return null;
  
    // Example answerLabel: "C4"
    const answerNote = answerLabel.slice(0, -1);
    const answerOctave = Number(answerLabel.slice(-1));
  
    if (!noteSemitones[answerNote] && noteSemitones[answerNote] !== 0) {
      return null;
    }
  
    const answerMidi =
      (answerOctave + 1) * 12 + noteSemitones[answerNote];
  
    const correctMidi =
      (correctPitch.octave + 1) * 12 + noteSemitones[correctPitch.note];
  
    return Math.abs(correctMidi - answerMidi);
  };

  const startSession = () => {
    setSessionActive(true);
    setSessionStartTime(Date.now());
    setSessionAttempts([]);
    setLastSessionSummary(null);
    setResult("");
    setAnswered(false);
    setHasPlayed(false);
    setCurrentPitch(null);
    setCurrentNote("");
    setCurrentInterval(null);
    setRootPitch(null);
  
    if (isChildMode) {
      setLessonScreen("lesson");
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
    let attemptData = {};
  
    if (mode === "interval") {
      isCorrect = answer === currentPitch.label;

      const semitoneDistance = isCorrect
        ? 0
        : getSemitoneDistance(answer, currentPitch);

      attemptData = {
        mode: "note",
        target: currentPitch.label,
        note: currentPitch.note,
        octave: currentPitch.octave,
        answer: answer,
        correct: isCorrect,
        difficulty: difficulty,
        semitoneDistance: semitoneDistance,
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
        setResult(`⚠️ Not quite. The correct interval was ${currentInterval.name}.`);
  
        setStreak(0);
        addXp(2);
  
        setIntervalMistakes((prev) => ({
          ...prev,
          [currentInterval.name]: (prev[currentInterval.name] || 0) + 1,
        }));
      }
    } else {
      isCorrect = answer === currentPitch.label;
  
      const semitoneDistance = isCorrect
  ? 0
  : getSemitoneDistance(answer, currentPitch);

    attemptData = {
      mode: "note",
      target: currentPitch.label,
      note: currentPitch.note,
      octave: currentPitch.octave,
      answer: answer,
      correct: isCorrect,
      difficulty: difficulty,
      semitoneDistance: semitoneDistance,
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
        const distanceMessage =
          attemptData.semitoneDistance !== null
            ? ` You were ${attemptData.semitoneDistance} semitone${
                attemptData.semitoneDistance === 1 ? "" : "s"
              } away.`
            : "";
      
        setResult(
          `⚠️ Not quite. The correct answer was ${currentPitch.label}.${distanceMessage}`
        );
      
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

    if (sessionActive) {
      setSessionAttempts((prev) => [...prev, attemptData]);
    }
    const newFeedback = generateAdaptiveFeedback(updatedRecentAnswers, mode);
    setFeedbackMessage(newFeedback);
  };


  

  const createProfile = () => {
    const trimmedName = newProfileName.trim();
  
    if (!trimmedName) {
      alert("Please enter a profile name.");
      return;
    }
  
    const id = trimmedName.toLowerCase().replace(/\s+/g, "-");
  
    const profileExists = profiles.some((profile) => profile.id === id);
  
    if (profileExists) {
      alert("A profile with this name already exists.");
      return;
    }
  
    const newProfile = {
      id,
      name: trimmedName,
      emoji: newProfileAvatar,
      uiMode: uiMode,
    };
  
    setProfiles((prev) => [...prev, newProfile]);
    setSelectedProfile(id);
    setNewProfileName("");
    setNewProfileAvatar(
      uiMode === "child"
        ? childAvatarOptions[0].emoji
        : adultAvatarOptions[0].emoji
    );
  };

  const changeUiModeSafely = () => {
    setSelectedProfile(null);
    setUiMode(null);
    setResult("");
    setAnswered(false);
    setHasPlayed(false);
    setCurrentPitch(null);
    setCurrentNote("");
    setCurrentInterval(null);
    setRootPitch(null);
  };


  const currentProfile = profiles.find(
    (profile) => profile.id === selectedProfile
  );



  const deleteProfile = (profileId) => {
    const profileToDelete = profiles.find((profile) => profile.id === profileId);
  
    if (!profileToDelete) return;
  
    const confirmed = window.confirm(
      `Delete profile "${profileToDelete.name}"? This will also delete its saved progress.`
    );
  
    if (!confirmed) return;
  
    const key = (name) => `${accountName}_${profileId}_${name}`;
  
    localStorage.removeItem(key("score"));
    localStorage.removeItem(key("attempts"));
    localStorage.removeItem(key("mistakes"));
    localStorage.removeItem(key("intervalMistakes"));
    localStorage.removeItem(key("difficulty"));
    localStorage.removeItem(key("xp"));
    localStorage.removeItem(key("level"));
    localStorage.removeItem(key("streak"));
    localStorage.removeItem(key("bestStreak"));
    localStorage.removeItem(key("recentAnswers"));
    localStorage.removeItem(key("feedbackMessage"));
    localStorage.removeItem(key("customOctaves"));
    localStorage.removeItem(key("customIntervals"));
  
    setProfiles((prev) => prev.filter((profile) => profile.id !== profileId));
  
    if (selectedProfile === profileId) {
      setSelectedProfile(null);
    }
  };


  const resetProgress = () => {
    setScore(0);
    setAttempts(0);
    setMistakes({});
    setIntervalMistakes({});
    setXp(0);
    setLevel(1);
    setStreak(0);
    setBestStreak(0);
    setRecentAnswers([]);
    setFeedbackMessage("Complete a few exercises and I'll personalise your practice.");
    setCustomOctaves([4]);
    setCustomIntervals(defaultCustomIntervals);
  
    if (selectedProfile) {
      const key = (name) => `${accountName}_${selectedProfile}_${name}`;
  
      localStorage.removeItem(key("score"));
      localStorage.removeItem(key("attempts"));
      localStorage.removeItem(key("mistakes"));
      localStorage.removeItem(key("intervalMistakes"));
      localStorage.removeItem(key("difficulty"));
      localStorage.removeItem(key("xp"));
      localStorage.removeItem(key("level"));
      localStorage.removeItem(key("streak"));
      localStorage.removeItem(key("bestStreak"));
      localStorage.removeItem(key("recentAnswers"));
      localStorage.removeItem(key("feedbackMessage"));
      localStorage.removeItem(key("customOctaves"));
      localStorage.removeItem(key("customIntervals"));
    }
  };

  const getModeButtonStyle = (buttonMode) => {
    const isActive = mode === buttonMode;
  
    return {
      ...styles.secondaryButton,
      background: isActive
        ? `linear-gradient(135deg, ${theme.primary}, ${theme.primaryDark})`
        : "#ffffff",
      color: isActive ? "white" : theme.heading,
      border: isActive ? "none" : `1px solid ${theme.border}`,
      boxShadow: isActive
        ? isChildMode
          ? "0 6px 14px rgba(34, 197, 94, 0.35)"
          : "0 6px 14px rgba(37, 99, 235, 0.30)"
        : "none",
      transform: isActive ? "scale(1.03)" : "scale(1)",
    };
  };

  const toggleCustomInterval = (intervalName) => {
    setCustomIntervals((prev) => {
      if (prev.includes(intervalName)) {
        if (prev.length === 1) return prev;
        return prev.filter((name) => name !== intervalName);
      }
  
      return [...prev, intervalName];
    });
  };

  const toggleCustomOctave = (octave) => {
    setCustomOctaves((prev) => {
      if (prev.includes(octave)) {
        const updated = prev.filter((item) => item !== octave);
        return updated.length > 0 ? updated : prev;
      }
  
      return [...prev, octave].sort((a, b) => a - b);
    });
  
    setResult("");
    setAnswered(false);
    setHasPlayed(false);
    setCurrentPitch(null);
    setCurrentNote("");
    setCurrentInterval(null);
    setRootPitch(null);
  };

  const getDifficultyButtonStyle = (buttonDifficulty) => {
    const isActive = difficulty === buttonDifficulty;
  
    const adultColours = {
      easy: "#2563eb",
      medium: "#4f46e5",
      hard: "#7c3aed",
      expert: "#0f172a",
      custom: "#0891b2",
    };
  
    const childColours = {
      easy: "#4ade80",
      medium: "#60a5fa",
      hard: "#fb923c",
      expert: "#a78bfa",
      custom: "#14b8a6",
    };
  
    const colours = isChildMode ? childColours : adultColours;
    const activeColour = colours[buttonDifficulty];
  
    return {
      ...styles.secondaryButton,
      background: isActive ? activeColour : "#ffffff",
      color: isActive ? "white" : theme.heading,
      border: isActive ? "none" : `1px solid ${theme.border}`,
      boxShadow: isActive ? `0 6px 14px ${activeColour}55` : "none",
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

  const generateSessionSummary = () => {
    if (sessionAttempts.length === 0) {
      return {
        message: "No exercises were completed in this session.",
        totalAttempts: 0,
      };
    }
  
    const totalAttempts = sessionAttempts.length;
    const correctAnswers = sessionAttempts.filter((item) => item.correct).length;
    const sessionAccuracy = ((correctAnswers / totalAttempts) * 100).toFixed(1);
  
    const noteAttempts = sessionAttempts.filter((item) => item.mode === "note");
    const intervalAttempts = sessionAttempts.filter(
      (item) => item.mode === "interval"
    );
  
    const wrongNotes = noteAttempts.filter((item) => !item.correct);
    const wrongIntervals = intervalAttempts.filter((item) => !item.correct);
  
    const noteCounts = {};
    wrongNotes.forEach((item) => {
      noteCounts[item.note] = (noteCounts[item.note] || 0) + 1;
    });
  
    const intervalCounts = {};
    wrongIntervals.forEach((item) => {
      intervalCounts[item.target] = (intervalCounts[item.target] || 0) + 1;
    });
  
    const weakestNote = Object.entries(noteCounts).sort(
      (a, b) => b[1] - a[1]
    )[0];
  
    const weakestInterval = Object.entries(intervalCounts).sort(
      (a, b) => b[1] - a[1]
    )[0];
  
    const semitoneErrors = noteAttempts
      .map((item) => item.semitoneDistance)
      .filter((value) => value !== null && value !== undefined);
  
    const averageSemitoneError =
      semitoneErrors.length > 0
        ? (
            semitoneErrors.reduce((sum, value) => sum + value, 0) /
            semitoneErrors.length
          ).toFixed(1)
        : "N/A";
  
    const durationSeconds = sessionStartTime
      ? Math.round((Date.now() - sessionStartTime) / 1000)
      : 0;
  
    let recommendation = "Keep practising with your current settings.";
  
    if (weakestNote && weakestInterval) {
      recommendation = `Focus next on ${weakestNote[0]} notes and ${weakestInterval[0]} intervals.`;
    } else if (weakestNote) {
      recommendation = `Focus next on ${weakestNote[0]} notes.`;
    } else if (weakestInterval) {
      recommendation = `Focus next on ${weakestInterval[0]} intervals.`;
    } else if (Number(sessionAccuracy) >= 80) {
      recommendation = "Strong session. You may be ready to increase the difficulty.";
    }
  
    return {
      totalAttempts,
      correctAnswers,
      sessionAccuracy,
      noteAttempts: noteAttempts.length,
      intervalAttempts: intervalAttempts.length,
      weakestNote: weakestNote ? weakestNote[0] : "None",
      weakestInterval: weakestInterval ? weakestInterval[0] : "None",
      averageSemitoneError,
      durationSeconds,
      recommendation,
    };
  };


  const endSession = () => {
    const summary = generateSessionSummary();
  
    setLastSessionSummary(summary);
    setSessionActive(false);
    setSessionStartTime(null);
  
    if (isChildMode) {
      setLessonScreen("recap");
    }
  };

  const returnToSetup = () => {
    setLessonScreen("setup");
    setResult("");
    setAnswered(false);
    setHasPlayed(false);
    setCurrentPitch(null);
    setCurrentNote("");
    setCurrentInterval(null);
    setRootPitch(null);
  };

  const visibleProfiles = profiles.filter(
    (profile) => profile.uiMode === uiMode
  );

  if (!selectedProfile) {
    return (
      <div className="pitch-page" style={styles.page}>
        <div className="pitch-shell" style={styles.shell}>
          <div style={styles.header}>
            <h1 style={styles.title}>Choose Profile</h1>
            <p style={styles.subtitle}>
              Select who is practising today, or create a new local profile.
            </p>
          </div>
  
          {visibleProfiles.length === 0 && (
            <p style={{ marginTop: "20px", color: theme.muted }}>
              No profiles yet for this mode. Create one below to start practising.
            </p>
          )}
  
          <div className="profile-grid" style={{ marginTop: "30px" }}>

          {visibleProfiles.map((profile) => (
            <div
              key={profile.id}
              style={{
                ...styles.sideCard,
                backgroundColor: theme.sideCardBg,
                border: `1px solid ${theme.border}`,
                color: theme.heading,
                width: "180px",
                minHeight: "170px",
                fontSize: "22px",
                fontWeight: "bold",
                position: "relative",
                padding: "12px",
              }}
            >
              <button
                onClick={() => deleteProfile(profile.id)}
                style={{
                  position: "absolute",
                  top: "8px",
                  right: "8px",
                  border: "none",
                  background: "transparent",
                  cursor: "pointer",
                  fontSize: "18px",
                }}
                title="Delete profile"
              >
                🗑️
              </button>

              <button
                onClick={() => setSelectedProfile(profile.id)}
                style={{
                  width: "100%",
                  height: "100%",
                  border: "none",
                  background: "transparent",
                  cursor: "pointer",
                  color: "inherit",
                  fontSize: "inherit",
                  fontWeight: "inherit",
                  padding: "24px 10px 10px",
                }}
              >
                <div style={{ fontSize: "42px", marginBottom: "10px" }}>
                  {profile.emoji}
                </div>
                {profile.name}
              </button>
            </div>
          ))}
          </div>
  
          <div
          className="profile-create-box"
          style={{
            backgroundColor: theme.cardBg,
            border: `1px solid ${theme.border}`,
          }}
        >
          <h2>Create New Profile</h2>

          <input
            className="profile-input"
            type="text"
            value={newProfileName}
            onChange={(e) => setNewProfileName(e.target.value)}
            placeholder="Enter profile name"
            style={{
              border: `1px solid ${theme.border}`,
              color: theme.text,
            }}
          />

          <div style={{ marginTop: "18px" }}>
            <h3>{isChildMode ? "Choose Animal Friend" : "Choose Avatar"}</h3>

            <div className="button-row">
              {activeAvatarOptions
                .filter((avatar) => avatar.levelRequired === 1)
                .map((avatar) => (
                  <button
                    key={avatar.name}
                    onClick={() => setNewProfileAvatar(avatar.emoji)}
                    style={{
                      ...styles.secondaryButton,
                      background:
                        newProfileAvatar === avatar.emoji
                          ? `linear-gradient(135deg, ${theme.primary}, ${theme.primaryDark})`
                          : "#ffffff",
                      color:
                        newProfileAvatar === avatar.emoji
                          ? "white"
                          : theme.heading,
                      border:
                        newProfileAvatar === avatar.emoji
                          ? "none"
                          : `1px solid ${theme.border}`,
                    }}
                  >
                    {avatar.emoji} {avatar.name}
                  </button>
                ))}
            </div>

            <p style={{ marginTop: "8px", fontSize: "14px", color: theme.muted }}>
              More {isChildMode ? "animal friends" : "avatars"} unlock as you level up.
            </p>
          </div>

          <button onClick={createProfile} style={styles.primaryButton}>
            Add Profile
          </button>
        </div>
  
          <button
            onClick={() => setUiMode(null)}
            style={{
              ...styles.secondaryButton,
              marginTop: "30px",
            }}
          >
            Back to UI Mode
          </button>
        </div>
      </div>
    );
  }



  // THIS IS MAIN RETURN 
  return (
    <div className="pitch-page" style={styles.page}>
      <div className="pitch-shell" style={styles.shell}>
        <div style={styles.header}>
          <h1 style={styles.title}>
            {isChildMode ? "🎵 Ear Training Adventure" : "Ear Training App"}
          </h1>
          <p style={styles.subtitle}>
            {isChildMode
              ? "Listen carefully, choose your answer, and keep practising!"
              : "Adaptive pitch and interval training with personalised feedback."}
          </p>

          <p
            style={{
              marginTop: "8px",
              fontWeight: "bold",
              color: theme.heading,
            }}
          >
            Profile:{" "}
            {currentProfile?.emoji} {currentProfile?.name}
          </p>
  
          <button onClick={changeUiModeSafely} style={styles.secondaryButton}>
          Change UI Mode
          </button>

          <button
          onClick={() => setSelectedProfile(null)}
           style={styles.secondaryButton}
          >   
          Change Profile
          </button>
        </div>
        <div className="pitch-layout">
        <main className="pitch-main">
  {!isChildMode && (
    <>
      {/* ADULT MODE: keep the current dashboard layout */}
      <div style={styles.card}>
        <h2>Training Mode</h2>

        <div className="button-row">
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
      </div>

      <div style={styles.card}>
        <h2>Difficulty</h2>

        <div className="button-row">
          <button
            onClick={() => setDifficulty("easy")}
            style={getDifficultyButtonStyle("easy")}
          >
            ⭐ Easy
          </button>

          <button
            onClick={() => setDifficulty("medium")}
            style={getDifficultyButtonStyle("medium")}
          >
            📈 Medium
          </button>

          <button
            onClick={() => setDifficulty("hard")}
            style={getDifficultyButtonStyle("hard")}
          >
            ⛰️ Hard
          </button>

          <button
            onClick={() => setDifficulty("expert")}
            style={getDifficultyButtonStyle("expert")}
          >
            👑 Expert
          </button>

          <button
            onClick={() => setDifficulty("custom")}
            style={getDifficultyButtonStyle("custom")}
          >
            🎛️ Custom
          </button>
        </div>

        <p>
          Current: <strong>{difficultySettings[difficulty].label}</strong>
          {difficulty === "custom" && (
            <>
              {" "}
              ({customOctaves.map((octave) => `Octave ${octave}`).join(", ")})
            </>
          )}
        </p>
      </div>

      {difficulty === "custom" && (
        <div style={styles.card}>
          <h2>Custom Octave Focus</h2>

          <p style={{ marginBottom: "14px", color: theme.muted }}>
            Select one or more octaves to practise.
          </p>

          <div className="button-row">
            {[2, 3, 4, 5].map((octave) => {
              const selected = customOctaves.includes(octave);

              return (
                <button
                  key={octave}
                  onClick={() => toggleCustomOctave(octave)}
                  style={{
                    ...styles.secondaryButton,
                    background: selected
                      ? `linear-gradient(135deg, ${theme.primary}, ${theme.primaryDark})`
                      : "#ffffff",
                    color: selected ? "white" : theme.heading,
                    border: selected ? "none" : `1px solid ${theme.border}`,
                  }}
                >
                  {selected ? "✅" : "⬜"} Octave {octave}
                </button>
              );
            })}
          </div>
        </div>
      )}

{difficulty === "custom" && mode === "interval" && (
  <div style={styles.card}>
    <h2>{isChildMode ? "Choose your intervals" : "Custom Interval Focus"}</h2>

    <p style={{ marginBottom: "14px", color: theme.muted }}>
      Select one or more intervals to include in interval training.
    </p>

    <div className="button-row">
      {allIntervals.map((interval) => {
        const selected = customIntervals.includes(interval.name);

        return (
          <button
            key={interval.name}
            onClick={() => toggleCustomInterval(interval.name)}
            style={{
              ...styles.secondaryButton,
              background: selected
                ? `linear-gradient(135deg, ${theme.primary}, ${theme.primaryDark})`
                : "#ffffff",
              color: selected ? "white" : theme.heading,
              border: selected ? "none" : `1px solid ${theme.border}`,
            }}
          >
            {selected ? "✅" : "⬜"} {interval.name}
          </button>
        );
      })}
    </div>

    <p style={{ marginTop: "14px" }}>
      Selected: <strong>{customIntervals.join(", ")}</strong>
    </p>
  </div>
)}

      {/* Adult exercise card stays on dashboard */}
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
          New Exercise
        </button>

        <button onClick={replayNote} style={styles.secondaryButton}>
          🔁 Replay
        </button>

        <div className="button-row" style={{ marginTop: "12px" }}>
          {!sessionActive ? (
            <button onClick={startSession} style={styles.primaryButton}>
              Start Session
            </button>
          ) : (
            <button onClick={endSession} style={styles.secondaryButton}>
              End Session
            </button>
          )}

          {sessionActive && (
            <p style={{ marginTop: "10px", fontWeight: "bold" }}>
              Session active: {sessionAttempts.length} attempt
              {sessionAttempts.length === 1 ? "" : "s"}
            </p>
          )}
        </div>

        <div className="answer-grid" style={{ marginTop: "20px" }}>
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
    </>
  )}

  {isChildMode && lessonScreen === "setup" && (
    <>
      <div style={styles.card}>
        <h2>Choose your game mode</h2>

        <div className="button-row">
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
      </div>

      <div style={styles.card}>
        <h2>Choose your challenge</h2>

        <div className="button-row">
          <button
            onClick={() => setDifficulty("easy")}
            style={getDifficultyButtonStyle("easy")}
          >
            ⭐ Easy
          </button>

          <button
            onClick={() => setDifficulty("medium")}
            style={getDifficultyButtonStyle("medium")}
          >
            📈 Medium
          </button>

          <button
            onClick={() => setDifficulty("hard")}
            style={getDifficultyButtonStyle("hard")}
          >
            ⛰️ Hard
          </button>

          <button
            onClick={() => setDifficulty("expert")}
            style={getDifficultyButtonStyle("expert")}
          >
            👑 Expert
          </button>

          <button
            onClick={() => setDifficulty("custom")}
            style={getDifficultyButtonStyle("custom")}
          >
            🎛️ Custom
          </button>
        </div>

        <p>
          Current: <strong>{difficultySettings[difficulty].label}</strong>
          {difficulty === "custom" && (
            <>
              {" "}
              ({customOctaves.map((octave) => `Octave ${octave}`).join(", ")})
            </>
          )}
        </p>
      </div>

      {difficulty === "custom" && (
        <div style={styles.card}>
          <h2>Choose your sound areas</h2>

          <p style={{ marginBottom: "14px", color: theme.muted }}>
            Select one or more octaves to practise.
          </p>

          <div className="button-row">
            {[2, 3, 4, 5].map((octave) => {
              const selected = customOctaves.includes(octave);

              return (
                <button
                  key={octave}
                  onClick={() => toggleCustomOctave(octave)}
                  style={{
                    ...styles.secondaryButton,
                    background: selected
                      ? `linear-gradient(135deg, ${theme.primary}, ${theme.primaryDark})`
                      : "#ffffff",
                    color: selected ? "white" : theme.heading,
                    border: selected ? "none" : `1px solid ${theme.border}`,
                  }}
                >
                  {selected ? "✅" : "⬜"} Octave {octave}
                </button>
              );
            })}
          </div>
        </div>
      )}

{difficulty === "custom" && mode === "interval" && (
  <div style={styles.card}>
    <h2>{isChildMode ? "Choose your intervals" : "Custom Interval Focus"}</h2>

    <p style={{ marginBottom: "14px", color: theme.muted }}>
      Select one or more intervals to include in interval training.
    </p>

    <div className="button-row">
      {allIntervals.map((interval) => {
        const selected = customIntervals.includes(interval.name);

        return (
          <button
            key={interval.name}
            onClick={() => toggleCustomInterval(interval.name)}
            style={{
              ...styles.secondaryButton,
              background: selected
                ? `linear-gradient(135deg, ${theme.primary}, ${theme.primaryDark})`
                : "#ffffff",
              color: selected ? "white" : theme.heading,
              border: selected ? "none" : `1px solid ${theme.border}`,
            }}
          >
            {selected ? "✅" : "⬜"} {interval.name}
          </button>
        );
      })}
    </div>

    <p style={{ marginTop: "14px" }}>
      Selected: <strong>{customIntervals.join(", ")}</strong>
    </p>
  </div>
)}

      <div style={styles.card}>
        <h2>Ready for your lesson?</h2>

        <p style={{ color: theme.muted }}>
          You will practise{" "}
          <strong>{mode === "note" ? "note recognition" : "interval training"}</strong>{" "}
          on <strong>{difficultySettings[difficulty].label}</strong> difficulty.
          {difficulty === "custom" && mode === "interval" && (
            <>
              {" "}Selected intervals: <strong>{customIntervals.join(", ")}</strong>.
            </>
          )}
        </p>

        <button onClick={startSession} style={styles.primaryButton}>
          Start Lesson
        </button>
      </div>
    </>
  )}

  {isChildMode && lessonScreen === "lesson" && (
    <div style={styles.card}>
      <h2>Listen and choose!</h2>

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
        🎵 New Sound
      </button>

      <button onClick={replayNote} style={styles.secondaryButton}>
        🔁 Replay
      </button>

      <div className="answer-grid" style={{ marginTop: "20px" }}>
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

      <button onClick={endSession} style={styles.secondaryButton}>
        End Lesson
      </button>
    </div>
  )}

  {isChildMode && lessonScreen === "recap" && lastSessionSummary && (
    <div style={styles.card}>
      <h2>Lesson Recap ⭐</h2>

      {lastSessionSummary.totalAttempts === 0 ? (
        <p>{lastSessionSummary.message}</p>
      ) : (
        <>
          <p>
            You completed <strong>{lastSessionSummary.totalAttempts}</strong>{" "}
            exercise{lastSessionSummary.totalAttempts === 1 ? "" : "s"}.
          </p>

          <div style={styles.statRow}>
            <span>Correct</span>
            <strong>{lastSessionSummary.correctAnswers}</strong>
          </div>

          <div style={styles.statRow}>
            <span>Accuracy</span>
            <strong>{lastSessionSummary.sessionAccuracy}%</strong>
          </div>

          <div style={styles.statRow}>
            <span>Duration</span>
            <strong>{lastSessionSummary.durationSeconds}s</strong>
          </div>

          <div style={styles.statRow}>
            <span>Avg. semitone error</span>
            <strong>{lastSessionSummary.averageSemitoneError}</strong>
          </div>

          <div style={styles.statRow}>
            <span>Weak note</span>
            <strong>{lastSessionSummary.weakestNote}</strong>
          </div>

          <div style={styles.statRow}>
            <span>Weak interval</span>
            <strong>{lastSessionSummary.weakestInterval}</strong>
          </div>

          <p style={{ marginTop: "14px", lineHeight: "1.5" }}>
            <strong>Recommendation:</strong>{" "}
            {lastSessionSummary.recommendation}
          </p>
        </>
      )}

      <button onClick={returnToSetup} style={styles.primaryButton}>
        Back to Setup
      </button>
    </div>
  )}
</main>
  
<aside className="pitch-sidebar">
  {/* Full progress card:
      - Always visible in adult mode
      - Visible in child setup/recap
      - Hidden during child lesson screen */}
  {(!isChildMode || lessonScreen !== "lesson") && (
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
            backgroundColor: theme.primarySoft,
            borderRadius: "999px",
            overflow: "hidden",
          }}
        >
          <div
            style={{
              width: `${xp % 100}%`,
              height: "100%",
              background: `linear-gradient(135deg, ${theme.primary}, ${theme.primaryDark})`,
            }}
          />
        </div>
      </div>
    </div>
  )}

  {/* Simple child lesson card:
      Only visible during the child lesson screen */}
  {isChildMode && lessonScreen === "lesson" && (
    <div style={styles.sideCard}>
      <h2>{currentProfile?.emoji || "🐸"} Keep going!</h2>

      <p style={{ color: theme.muted, lineHeight: "1.5" }}>
        Listen carefully, choose your answer, and build your experience.
      </p>

      <div style={styles.statRow}>
        <span>🏅 Level</span>
        <strong>{level}</strong>
      </div>

      <div style={styles.statRow}>
        <span>🔥 Streak</span>
        <strong>{streak}</strong>
      </div>

      <p style={{ marginTop: "12px", marginBottom: "6px", fontWeight: "bold" }}>
        Experience to next level: {xp % 100}/100
      </p>

      <div
        style={{
          width: "100%",
          height: "14px",
          backgroundColor: theme.primarySoft,
          borderRadius: "999px",
          overflow: "hidden",
        }}
      >
        <div
          style={{
            width: `${xp % 100}%`,
            height: "100%",
            background: `linear-gradient(135deg, ${theme.primary}, ${theme.primaryDark})`,
          }}
        />
      </div>
    </div>
  )}

  {/* Avatar collection:
      - Visible in adult mode
      - Visible in child setup/recap
      - Hidden during child lesson screen */}
  {(!isChildMode || lessonScreen !== "lesson") && (
    <div style={styles.sideCard}>
      <h2>{isChildMode ? "Animal Friends ⭐" : "Profile Avatars"}</h2>

      <p style={{ color: theme.muted, fontSize: "14px", marginBottom: "12px" }}>
        {isChildMode
          ? "Unlock animal friends by gaining experience and levelling up."
          : "Unlock profile avatars by gaining experience and levelling up."}
      </p>

      {activeAvatarOptions.map((avatar) => {
        const unlocked = level >= avatar.levelRequired;
        const selected = currentProfile?.emoji === avatar.emoji;

        return (
          <button
            key={avatar.name}
            disabled={!unlocked}
            onClick={() => updateProfileAvatar(avatar.emoji)}
            style={{
              width: "100%",
              marginBottom: "8px",
              padding: "10px",
              borderRadius: "14px",
              border: selected
                ? `2px solid ${theme.primary}`
                : `1px solid ${theme.border}`,
              backgroundColor: unlocked ? theme.cardBg : "#f1f5f9",
              color: unlocked ? theme.heading : "#94a3b8",
              opacity: unlocked ? 1 : 0.55,
              cursor: unlocked ? "pointer" : "not-allowed",
              textAlign: "left",
            }}
          >
            <strong>
              {avatar.emoji} {avatar.name}
            </strong>

            <p style={{ margin: "4px 0 0", fontSize: "13px" }}>
              {unlocked
                ? selected
                  ? "Currently selected"
                  : "Unlocked"
                : `Unlocks at Level ${avatar.levelRequired}`}
            </p>
          </button>
        );
      })}

      {nextAvatar && (
        <p style={{ marginTop: "12px", fontSize: "14px", color: theme.muted }}>
          Next unlock: {nextAvatar.emoji} {nextAvatar.name} at Level{" "}
          {nextAvatar.levelRequired}
        </p>
      )}
    </div>
  )}

  {/* Sidebar recap:
      - Adult mode can still show recap in sidebar
      - Child mode does NOT show this during recap, because child recap is now in main area */}
  {(!isChildMode || lessonScreen !== "recap") && lastSessionSummary && (
    <div style={styles.sideCard}>
      <h2>{isChildMode ? "Session Recap ✔️" : "Session Recap"}</h2>

      {lastSessionSummary.totalAttempts === 0 ? (
        <p>{lastSessionSummary.message}</p>
      ) : (
        <>
          <div style={styles.statRow}>
            <span>Attempts</span>
            <strong>{lastSessionSummary.totalAttempts}</strong>
          </div>

          <div style={styles.statRow}>
            <span>Correct</span>
            <strong>{lastSessionSummary.correctAnswers}</strong>
          </div>

          <div style={styles.statRow}>
            <span>Accuracy</span>
            <strong>{lastSessionSummary.sessionAccuracy}%</strong>
          </div>

          <div style={styles.statRow}>
            <span>Duration</span>
            <strong>{lastSessionSummary.durationSeconds}s</strong>
          </div>

          <div style={styles.statRow}>
            <span>Avg. semitone error</span>
            <strong>{lastSessionSummary.averageSemitoneError}</strong>
          </div>

          <div style={styles.statRow}>
            <span>Weak note</span>
            <strong>{lastSessionSummary.weakestNote}</strong>
          </div>

          <div style={styles.statRow}>
            <span>Weak interval</span>
            <strong>{lastSessionSummary.weakestInterval}</strong>
          </div>

          <p style={{ marginTop: "14px", lineHeight: "1.5" }}>
            <strong>Recommendation:</strong>{" "}
            {lastSessionSummary.recommendation}
          </p>
        </>
      )}
    </div>
  )}

  {/* Feedback/helper card:
      Keep visible in both modes.
      Useful during the child lesson screen because it acts like the helper. */}
  <div style={styles.sideCard}>
    <h2>
      {isChildMode
        ? `${currentProfile?.emoji || "🐸"} ${currentProfile?.name || "Helper"} Says`
        : "Personalised Feedback"}
    </h2>

    {isChildMode && (
      <p style={{ fontSize: "14px", color: theme.muted, marginBottom: "10px" }}>
        Your selected animal friend will help guide your practice.
      </p>
    )}

    <p style={{ lineHeight: "1.5", fontSize: "15px" }}>
      {getFeedbackMessage()}
    </p>
  </div>

  {/* Adult-only weak areas */}
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

  {/* Hide reset during child lesson so the lesson screen stays clean */}
  {(!isChildMode || lessonScreen !== "lesson") && (
    <button onClick={resetProgress} style={styles.secondaryButton}>
      Reset Progress
    </button>
  )}
</aside>
        </div>
      </div>
    </div>
  );
}

export default PitchTrainer;