import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

const MicrophoneSelector = () => {
  const [microphones, setMicrophones] = useState([]);
  const [selectedMic, setSelectedMic] = useState('');
  
  useEffect(() => {
    // Получение списка доступных микрофонов
    const getMicrophones = async () => {
      try {
        const devices = await navigator.mediaDevices.enumerateDevices();
        const mics = devices.filter(device => device.kind === 'audioinput');
        setMicrophones(mics);
        if (mics.length > 0) {
          setSelectedMic(mics[0].deviceId);
        }
      } catch (error) {
        console.error('Ошибка при получении списка микрофонов:', error);
      }
    };
    
    getMicrophones();
  }, []);

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'center',
      alignItems: 'center',
      minHeight: '100vh',
      background: 'linear-gradient(135deg,rgb(91, 137, 222) 0%,rgb(7, 154, 207) 100%)',
      color: 'white'
    }}>
      <h2>Выбор микрофона</h2>
      
      <div style={{ 
        width: '80%', 
        maxWidth: '500px',
        marginBottom: '30px'
      }}>
        <select 
          value={selectedMic}
          onChange={(e) => setSelectedMic(e.target.value)}
          style={{
            width: '100%',
            padding: '10px',
            borderRadius: '5px',
            border: 'none',
            marginBottom: '20px'
          }}
        >
          {microphones.map(mic => (
            <option key={mic.deviceId} value={mic.deviceId}>
              {mic.label || `Микрофон ${microphones.indexOf(mic) + 1}`}
            </option>
          ))}
        </select>
        
        <Link 
          to={`/main?micId=${selectedMic}`}
          style={{
            display: 'inline-block',
            padding: '15px 30px',
            fontSize: '18px',
            borderRadius: '25px',
            backgroundColor: '#4CAF50',
            color: 'white',
            textDecoration: 'none',
            textAlign: 'center',
            boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)'
          }}
        >
          Перейти к записи
        </Link>
      </div>
    </div>
  );
};

export default MicrophoneSelector;
