import React, { useEffect, useRef, useState } from 'react';
import { LineChart } from 'chartist';
import '../styles/chartist.css';

const ChartComponent = () => {
  const chartRef = useRef(null);
  const chartInstance = useRef(null);
  const [data, setData] = useState([5, 10, 7, 8, 6]);
  const [labels, setLabels] = useState([0, 5, 10, 15, 20]);

  useEffect(() => {
    if (chartRef.current) {
      chartInstance.current = new LineChart(chartRef.current, {
        labels: labels,
        series: [data]
      }, {
        fullWidth: true,
        showArea: true,
        chartPadding: { right: 40 }
      });
    }
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      setData(prevData => prevData.map(value => value + 1));
      setLabels(prevLabels => prevLabels.map(value => value +5))
    }, 5000); // каждые 5000 мс = 5 секунд
  
    return () => clearInterval(interval); // очистка таймера при размонтировании
  }, []);
  
  

  useEffect(() => {

    if (chartInstance.current) {
      chartInstance.current.update({
        labels: labels,
        series: [data]
      });
    }
  }, [data]);

  return <div ref={chartRef} style={{ width: '50%', height: '200px' }} />;

};

export default ChartComponent;
