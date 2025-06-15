import { jsPDF } from 'jspdf';

export const generatePDFReport = (triggerEvents, totalTriggers) => {
  // Создаем PDF с кодировкой UTF-8
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
    putOnlyUsedFonts: true,
    floatPrecision: 16
  });
  
  // Загружаем шрифт с поддержкой кириллицы
  doc.addFont('https://cdn.jsdelivr.net/npm/dejavu-fonts-ttf@2.37.3/ttf/DejaVuSans.ttf', 'DejaVuSans', 'normal');
  doc.setFont('DejaVuSans');
  
  // Добавляем заголовок
  doc.setFontSize(16);
  doc.text('Отчет о срабатываниях', 20, 20);
  
  // Добавляем информацию
  doc.setFontSize(12);
  doc.text(`Общее количество срабатываний: ${totalTriggers}`, 20, 40);
  
  // Добавляем заголовок таблицы
  doc.text('Дата и время срабатывания', 20, 60);
  doc.text('Значение MSE', 120, 60);
  
  // Добавляем содержимое таблицы
  let yPosition = 70;
  triggerEvents.forEach((event, index) => {
    const dateTime = new Date(event.timestamp).toLocaleString();
    doc.text(dateTime, 20, yPosition);
    doc.text(event.mseValue.toFixed(6), 120, yPosition);
    yPosition += 10;
    
    // Добавляем новую страницу при необходимости
    if (yPosition > 280 && index < triggerEvents.length - 1) {
      doc.addPage();
      yPosition = 20;
      // Добавляем заголовок таблицы на новой странице
      doc.text('Дата и время срабатывания', 20, yPosition);
      doc.text('Значение MSE', 120, yPosition);
      yPosition += 10;
    }
  });
  
  // Сохраняем PDF
  doc.save('отчет-срабатываний.pdf');
};
