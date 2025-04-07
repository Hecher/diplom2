import React, { useState, useEffect, useRef } from 'react';
import { BrowserRouter, Routes, Route} from 'react-router-dom'
import AudioRecorder from './components/audioRecorder'
import Login from './components/login'
import Register from './components/register';

const App = () => {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="main" element={<AudioRecorder/>} />
        <Route path="login" element={<Login/>} />
        <Route path="register" element={<Register/>}/>
      </Routes>
    </BrowserRouter>
  );
};



export default App;