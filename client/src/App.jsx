import React, { useState } from 'react';
import VoiceRecorder from './components/VoiceRecorder';
import NotesList from './components/NotesList';

function App() {
  const [notes, setNotes] = useState([]);

  return (
    <div className="min-h-screen flex flex-col bg-white">
      <header className="flex justify-between items-center px-4 md:px-6 py-4 shadow bg-white">
        <h1 className="text-xl md:text-2xl font-bold">Captain's Log</h1>
        <button className="btn btn-outline btn-sm md:btn-md">Sign Out</button>
      </header>

      <section className="flex flex-col items-center justify-center px-4 py-8 md:py-12 gap-4 md:gap-6">
        <div className="text-center space-y-2 md:space-y-3">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-800">Welcome Back</h2>
          <p className="text-base md:text-lg text-gray-500">Start capturing your thoughts with a tap</p>
        </div>

        <VoiceRecorder />
      </section>

      <main className="flex flex-col gap-6 px-4 md:px-8 py-6 md:py-8">
        <h3 className="text-2xl font-bold text-gray-800">Your Voice Notes</h3>
        <NotesList notes={notes} setNotes={setNotes} />
      </main>
    </div>
  );
}

export default App;
