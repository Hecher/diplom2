import React, { useState, useEffect, useRef } from 'react';
import { LineChart } from 'chartist';
import '../styles/chartist.css'
import { generatePDFReport } from './pdfGenerator';


const AudioRecorder = () => {
  const [isRecording, setIsRecording] = useState(false);
  const [mediaRecorder, setMediaRecorder] = useState(null);
  const [audioStream, setAudioStream] = useState(null);
  const audioChunks = useRef([]);
  const isManualStop = useRef(false);
  const checkValue = 0.016

  const chartRef1 = useRef(null);
  const chartInstance1 = useRef(null);
  const chartRef2 = useRef(null);
  const chartInstance2 = useRef(null);
  const [serverResponse, setServerResponse] = useState(null);
  const [labels, setLabels] = useState([0, 5, 10, 15, 20]);
  const [data, setData] = useState([0, 0, 0, 0, 0]);
  const [iter, setIter] = useState(0);
  const [data2, setData2] = useState([0, 0, 0, 0, 0]);

  //Число срабатываний тревоги
  const [totalTriggers, setTotalTriggers] = useState(0);
  const [triggerEvents, setTriggerEvents] = useState([]);

  useEffect(() => {
    console.log('Data обновилось:', data);
  }, [data]);
  useEffect(() => {
    console.log("HI " + data2);
  }, [data2])

  const updateDataAtIndex = (category, index, newValue) => {
    if(category === 1){
      setData(prevData => {
        const update = [...prevData];
        update[index] = newValue;
        return update;
      })
    }
    else{
      setData2(prevData => {
        const update = [...prevData];
        update[index] = newValue;
        return update;
      })
    }
    
  };
  const  pushNewData =  (newValue, category) => {
    if (category === 1){
      setData(prevData => [...prevData.slice(1), newValue]);
    }
    else{
      setData2(prevData => [...prevData.slice(1), newValue]);
    }
    
  };
  
  
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
          if (responseData.mse > checkValue) {
            setTotalTriggers(prev => prev + 1);
            setTriggerEvents(prev => [...prev, { timestamp: Date.now(), mseValue: responseData.mse }]);
          }
          setIter(prev => {
            
            const newIter = prev + 1;
            if (newIter < 6){
              updateDataAtIndex(1, newIter-1 % 5, responseData.mse);
              if (responseData.mse >= checkValue) {
                updateDataAtIndex(2, newIter-1 % 5, 1);
                // console.log("HI " + data2);
              }
            }
            else {
              console.log("Я пидор " + responseData.mse);
              console.log("Я не пидор " + data);
              setLabels(prevData => prevData.map(value => value +5))
              if (responseData.mse != data[data.length - 1]) {
                pushNewData(responseData.mse, 1);
                if(responseData.mse >= checkValue) {
                  pushNewData(1, 2);
                }

              }
              else {
                return 0;
              }
            }
            
            return newIter;
          });


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

  useEffect(() => {
      if (chartRef1.current) {
        chartInstance1.current = new LineChart(chartRef1.current, {
          labels: labels,
          series: [data]
        }, {
          fullWidth: true,
          showArea: true,
          chartPadding: { right: 40 },
          axisX: {
            labelInterpolationFnc: value => `${value} сек`
          }
        });
      }
    }, []);
  useEffect(() => {
  
    if (chartInstance1.current) {
      chartInstance1.current.update({
        labels: labels,
        series: [data]
      });
    }
  }, [data]);

  useEffect(() => {
    if(chartRef2.current) {
      chartInstance2.current = new LineChart(chartRef2.current, {
        labels: labels,
        series: [data2]
      }, {
        fullWidth: true,
        showArea: true,
        chartPadding: {right:40},
        axisX: {
          labelInterpolationFnc: value => `${value} сек`
        }
      });
    }
  }, []);
  useEffect(() => {
    if(chartInstance2.current) {
      chartInstance2.current.update({
        labels: labels,
        series: [data2]
      });
    }
  }, [data2])


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
    backgroundColor: '#f0f2f5',
    position: 'relative',  
    width: '100%',
    background: 'linear-gradient(135deg,rgb(91, 137, 222) 0%,rgb(7, 154, 207) 100%)', // Синий градиент
    color: 'white'          
  }}>
    {/*Контейнер для срабатываний*/}
    <div style={{
      position: 'absolute',
      top: '20px',
      right: '20px',
      backgroundColor: 'rgba(0, 0, 0, 0.46)',
      padding: '10px 15px',
      borderRadius: '10px',
      fontSize: '16px'
    }}>
      Срабатываний: {totalTriggers}
    </div>

    {/* Контейнер для графиков */}
    <div style={{
      display: 'flex',
      justifyContent: 'space-between',
      width: 'calc(100% - 100px)', 
      maxWidth: '1200px',          
      position: 'relative'
    }}>
      {/* Первый график - слева */}
      <div ref={chartRef1} style={{ 
        width: '48%', 
        height: '200px',
        marginLeft: '50px'  // Отступ 50px слева
      }} />
      
      {/* Второй график - справа */}
      <div ref={chartRef2} style={{ 
        width: '48%', 
        height: '200px',
        marginRight: '50px' // Отступ 50px справа
      }} />
    </div>
    
    {/* Кнопки под графиками */}
    <div style={{
      position: 'absolute',
      bottom: '50px',
      display: 'flex',
      gap: '20px'
    }}>
      <button
        onClick={isRecording ? stopRecording : startRecording}
        style={{
          padding: '15px 30px',
          fontSize: '18px',
          borderRadius: '25px',
          border: '1px solid rgba(255, 255, 255, 0.2)',
          backgroundColor: isRecording ? 'rgba(255, 68, 68, 0.2)' : 'rgba(76, 175, 80, 0.2)',
          color: 'white',
          cursor: 'pointer',
          transition: 'all 0.3s ease',
          boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
          backdropFilter: 'blur(10px)',
          WebkitBackdropFilter: 'blur(10px)'
        }}
      >
        {isRecording ? 'Остановить запись' : 'Начать запись'}
      </button>

      {/* Кнопка для генерации PDF */}
      <button
        onClick={() => generatePDFReport(triggerEvents, totalTriggers)}
        style={{
          padding: '15px 30px',
          fontSize: '18px',
          borderRadius: '25px',
          border: '1px solid rgba(255, 255, 255, 0.2)',
          backgroundColor: 'rgba(33, 150, 243, 0.2)',
          color: 'white',
          cursor: 'pointer',
          transition: 'all 0.3s ease',
          boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
          backdropFilter: 'blur(10px)',
          WebkitBackdropFilter: 'blur(10px)'
        }}
      >
        Сгенерировать PDF отчет
      </button>
    </div>

  </div>
);


};

export default AudioRecorder;