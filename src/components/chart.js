import React, { useEffect, useRef, useState } from 'react';
import { LineChart } from 'chartist';
import '../styles/chartist.css';

const ChartComponent = () => {
  const chartRef = useRef(null);
  const chartInstance = useRef(null);
  const [data, setData] = useState([5, 10, 7, 8, 6]);

  useEffect(() => {
    if (chartRef.current) {
      chartInstance.current = new LineChart(chartRef.current, {
        labels: ['Пн', 'Вт', 'Ср', 'Чт', 'Пт'],
        series: [data]
      }, {
        fullWidth: true,
        showArea: true,
        chartPadding: { right: 40 }
      });
    }
  }, []);

  useEffect(() => {
    if (chartInstance.current) {
      chartInstance.current.update({
        labels: ['Пн', 'Вт', 'Ср', 'Чт', 'Пт'],
        series: [data]
      });
    }
  }, [data]);

  return <div ref={chartRef} style={{ width: '50%', height: '200px' }} />;

};

export default ChartComponent;
