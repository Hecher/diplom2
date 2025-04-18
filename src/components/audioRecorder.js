import React, { useState, useEffect, useRef } from 'react';
import Chartist from "chartist";
import '../styles/chartist.css'


const AudioRecorder = () => {
  const [isRecording, setIsRecording] = useState(false);
  const [mediaRecorder, setMediaRecorder] = useState(null);
  const [audioStream, setAudioStream] = useState(null);
  const audioChunks = useRef([]);
  const isManualStop = useRef(false);

  

  useEffect(() => {
    return () => {
      if (audioStream) {
        audioStream.getTracks().forEach(track => track.stop());
      }
    };
  }, [audioStream]);

  const convertFloat32ToInt16 = (buffer) => {
    const length = buffer.length;
    const int16Buffer = new Int16Array(length);
    for (let i = 0; i < length; i++) {
      const s = Math.max(-1, Math.min(1, buffer[i]));
      int16Buffer[i] = s < 0 ? s * 0x8000 : s * 0x7FFF;
    }
    return int16Buffer;
  };

  const encodeWAV = (samples, sampleRate) => {
    const buffer = new ArrayBuffer(44 + samples.length * 2);
    const view = new DataView(buffer);

    const writeString = (view, offset, string) => {
      for (let i = 0; i < string.length; i++) {
        view.setUint8(offset + i, string.charCodeAt(i));
      }
    };

    writeString(view, 0, 'RIFF');
    view.setUint32(4, 36 + samples.length * 2, true);
    writeString(view, 8, 'WAVE');
    writeString(view, 12, 'fmt ');
    view.setUint32(16, 16, true);
    view.setUint16(20, 1, true);
    view.setUint16(22, 1, true);
    view.setUint32(24, sampleRate, true);
    view.setUint32(28, sampleRate * 2, true);
    view.setUint16(32, 2, true);
    view.setUint16(34, 16, true);
    writeString(view, 36, 'data');
    view.setUint32(40, samples.length * 2, true);

    const int16Array = new Int16Array(buffer, 44);
    int16Array.set(samples);

    return new Blob([view], { type: 'audio/wav' });
  };

  const startRecording = async () => {
    try {
      isManualStop.current = false;
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      setAudioStream(stream);
      
      const audioContext = new (window.AudioContext || window.webkitAudioContext)();
      const source = audioContext.createMediaStreamSource(stream);
      const processor = audioContext.createScriptProcessor(4096, 1, 1);

      audioChunks.current = [];

      processor.onaudioprocess = (event) => {
        const channelData = event.inputBuffer.getChannelData(0);
        audioChunks.current.push(new Float32Array(channelData));
      };

      source.connect(processor);
      processor.connect(audioContext.destination);

      const intervalId = setInterval(async () => {
        if (audioChunks.current.length === 0) return;
      
        const totalLength = audioChunks.current.reduce((acc, chunk) => acc + chunk.length, 0);
        const mergedData = new Float32Array(totalLength);
        let offset = 0;
        audioChunks.current.forEach(chunk => {
          mergedData.set(chunk, offset);
          offset += chunk.length;
        });
        audioChunks.current = [];
      
        const wavData = convertFloat32ToInt16(mergedData);
        const wavBlob = encodeWAV(wavData, audioContext.sampleRate);
      
        const formData = new FormData();
        formData.append('audio', wavBlob, `recording_${Date.now()}.wav`);
      
        try {
          const response = await fetch('http://localhost:3003/upload', {
            method: 'POST',
            body: formData,
          });
          
          if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
          }
          
          const responseData = await response.json(); // Или response.text() если сервер возвращает не JSON
          console.log('Ответ сервера:', responseData);
        } catch (error) {
          console.error('Ошибка запроса:', error);
          
          if (error.response) {
            const errorText = await error.response.text();
            console.error('Текст ошибки сервера:', errorText);
          }
        }
      }, 5000);

      setMediaRecorder({
        intervalId,
        audioContext,
        processor,
        source,
      });
      setIsRecording(true);
    } catch (error) {
      console.error('Microphone access error:', error);
      alert('Для работы приложения требуется доступ к микрофону');
    }
  };

  const stopRecording = () => {
    if (mediaRecorder) {
      isManualStop.current = true;
      clearInterval(mediaRecorder.intervalId);
      mediaRecorder.processor.disconnect();
      mediaRecorder.source.disconnect();
      mediaRecorder.audioContext.close();
      if (audioStream) {
        audioStream.getTracks().forEach(track => track.stop());
      }
      setIsRecording(false);
      setMediaRecorder(null);
      setAudioStream(null);
    }
  };

  return (
    <div style={{
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      minHeight: '100vh',
      backgroundColor: '#f0f2f5'
    }}>
      <button
        onClick={isRecording ? stopRecording : startRecording}
        style={{
          padding: '15px 30px',
          fontSize: '18px',
          borderRadius: '25px',
          border: 'none',
          backgroundColor: isRecording ? '#ff4444' : '#4CAF50',
          color: 'white',
          cursor: 'pointer',
          transition: 'all 0.3s ease',
          boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
          ':hover': {
            transform: 'scale(1.05)',
            boxShadow: '0 6px 8px rgba(0, 0, 0, 0.2)'
          }
        }}
      >
        {isRecording ? '⏹ Stop' : '⏺ Start'}
      </button>
    </div>
  );
};

export default AudioRecorder;