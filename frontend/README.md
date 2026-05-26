# Adaptive Ear Training App

This is a React + Vite web application for adaptive ear training. The app allows users to practise pitch recognition and interval recognition through generated audio exercises. It includes separate Adult and Child UI modes, local user profiles, progress tracking, custom difficulty options, session summaries, and unlockable profile avatars.

## Features

- Note recognition exercises
- Interval recognition exercises
- Adult and Child UI modes
- Child mode lesson flow with setup, practice, and recap screens
- Local user profile creation and deletion
- Progress tracking using browser localStorage
- Score, attempts, accuracy, streak, best streak, experience, and level tracking
- Custom octave selection
- Custom interval selection
- Adaptive feedback based on recent mistakes
- Session recap with accuracy, weak areas, and recommendations
- Unlockable avatars for adult users
- Unlockable animal helpers for child users

## Requirements

Before running the project, install:

- Node.js
- npm, which is included with Node.js
- A modern web browser such as Chrome, Edge, or Firefox

To check that Node.js and npm are installed, run:

```bash
node -v
npm -v

Installation

Clone the repository:

git clone YOUR_REPOSITORY_URL

Move into the project folder:

cd ear-training-app

If the project uses a frontend folder, move into it:

cd frontend

Install the required packages:

npm install
Running the Application

Start the development server:

npm run dev

Vite will show a local URL in the terminal, usually:

http://localhost:5173/

Open that URL in your browser.

How to Use
Choose either Adult Mode or Child Mode.
Create or select a local profile.
Choose Note Mode or Interval Mode.
Select a difficulty level.
If using Custom difficulty, choose the octaves and intervals you want to practise.
Start a session or lesson.
Listen to the generated sound and select the correct answer.
End the session to view feedback and progress.
Adult Mode

Adult mode uses a dashboard-style layout. It displays the exercise controls, progress statistics, avatar unlocks, adaptive feedback, and weak areas.

Child Mode

Child mode uses a lesson-style flow:

Setup screen: choose mode and difficulty.
Lesson screen: complete the pitch or interval guessing activity.
Recap screen: review session results and feedback.

Child mode also includes animal helper avatars that unlock as the user levels up.

Data Storage

The application stores profiles and progress locally in the browser using localStorage.

This means:

Data is saved on the same browser and device.
No external database is required.
Clearing browser storage will remove saved profiles and progress.
Main Technologies
React
Vite
JavaScript
CSS
Web Audio API
Browser localStorage
Development Notes

The app generates tones using the Web Audio API. Notes are converted to frequencies using semitone calculations based on A4 = 440Hz. Interval exercises play two tones in sequence, with the second tone calculated from the selected interval distance.

Adaptive feedback is generated from recent answers, mistakes, and session results. The app tracks both note-based and interval-based weak areas.

Build

To create a production build:

npm run build

To preview the production build locally:

npm run preview