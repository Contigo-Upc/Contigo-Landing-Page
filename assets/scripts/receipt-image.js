/* Sprint 2 · Lectura simulada del recibo.
   - US-18: revisa de verdad la foto en el navegador (brillo y nitidez) para avisar
     si está borrosa o con poca luz.
   - US-16: la "lectura" de los datos se simula: no hay OCR ni servidor. */

const IMAGE_LIMITS = {
  minBrightness: 80,
  minContrast: 22,
  minSharpness: 60
};

function loadImage(source) {
  return new Promise(function (resolve, reject) {
    const image = new Image();
    image.onload = function () {
      resolve(image);
    };
    image.onerror = reject;
    image.src = source;
  });
}

function getGrayPixels(image, maxSize) {
  const scale = Math.min(1, maxSize / Math.max(image.naturalWidth, image.naturalHeight));
  const width = Math.max(1, Math.round(image.naturalWidth * scale));
  const height = Math.max(1, Math.round(image.naturalHeight * scale));
  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;

  const context = canvas.getContext("2d", { willReadFrequently: true });
  context.drawImage(image, 0, 0, width, height);
  const rgba = context.getImageData(0, 0, width, height).data;
  const gray = new Float32Array(width * height);

  for (let i = 0, p = 0; i < rgba.length; i += 4, p++) {
    gray[p] = 0.299 * rgba[i] + 0.587 * rgba[i + 1] + 0.114 * rgba[i + 2];
  }
  return { gray: gray, width: width, height: height };
}

/* Brillo promedio, contraste (desviación) y nitidez (varianza del laplaciano). */
function analyzeReceiptImage(image) {
  const pixels = getGrayPixels(image, 480);
  const gray = pixels.gray;
  const width = pixels.width;
  const height = pixels.height;

  let sum = 0;
  for (let i = 0; i < gray.length; i++) {
    sum += gray[i];
  }
  const brightness = sum / gray.length;

  let variance = 0;
  for (let i = 0; i < gray.length; i++) {
    variance += Math.pow(gray[i] - brightness, 2);
  }
  const contrast = Math.sqrt(variance / gray.length);

  let lapSum = 0;
  let lapSquares = 0;
  let count = 0;
  for (let y = 1; y < height - 1; y++) {
    for (let x = 1; x < width - 1; x++) {
      const i = y * width + x;
      const lap = gray[i - width] + gray[i + width] + gray[i - 1] + gray[i + 1] - 4 * gray[i];
      lapSum += lap;
      lapSquares += lap * lap;
      count++;
    }
  }
  const lapMean = count ? lapSum / count : 0;
  const sharpness = count ? lapSquares / count - lapMean * lapMean : 0;

  let hash = 0;
  for (let i = 0; i < gray.length; i += 7) {
    hash = (hash * 31 + Math.round(gray[i])) % 1000000007;
  }

  return { brightness: brightness, contrast: contrast, sharpness: sharpness, hash: hash };
}

function getImageProblem(analysis) {
  if (analysis.brightness < IMAGE_LIMITS.minBrightness || (analysis.brightness < 110 && analysis.contrast < IMAGE_LIMITS.minContrast)) {
    return {
      type: "dark",
      title: "La foto tiene poca luz",
      text: "No logramos leer el texto. Acércate a una ventana o enciende la luz, y vuelve a tomar la foto."
    };
  }
  if (analysis.sharpness < IMAGE_LIMITS.minSharpness) {
    return {
      type: "blurry",
      title: "La foto salió borrosa",
      text: "Apoya los codos en la mesa, acerca el celular al recibo y espera a que enfoque antes de tomar la foto."
    };
  }
  return null;
}

/* ---------- Lectura simulada (US-16) ---------- */

function addDaysKey(days) {
  const date = new Date();
  date.setDate(date.getDate() + days);
  return toDateKey(date);
}

function simulateReceiptReading(serviceId, analysis, demoData) {
  if (demoData) {
    return Object.assign({}, demoData);
  }

  const service = findBillService(serviceId);
  const seed = analysis.hash;
  const digits = service.numberField === "supply" ? 7 + (seed % 2) : 8;
  let number = String(1000000 + (seed % 8999999)).padEnd(digits, String(seed % 10)).slice(0, digits);
  const variation = 0.7 + ((seed % 60) / 100);
  let amount = (service.reference * variation * 0.6).toFixed(2);
  let dueDate = addDaysKey(3 + (seed % 18));

  /* Algunas fotos solo permiten leer parte de los datos (US-16, escenario 2). */
  if (seed % 4 === 0) {
    dueDate = "";
  }
  if (seed % 7 === 0) {
    amount = "";
  }
  if (seed % 11 === 0) {
    number = "";
  }

  return { number: number, amount: amount, dueDate: dueDate };
}

/* ---------- Recibos de ejemplo para practicar ---------- */

function drawDemoReceipt(serviceId, variant) {
  const service = findBillService(serviceId) || BILL_SERVICES[0];
  const width = 600;
  const height = 820;
  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext("2d");

  const number = service.numberField === "supply" ? "1234567" : "45678901";
  const amount = (service.reference * 0.62).toFixed(2);
  const dueDate = addDaysKey(5);

  ctx.fillStyle = "#d8d2c4";
  ctx.fillRect(0, 0, width, height);
  ctx.fillStyle = "#ffffff";
  ctx.fillRect(40, 30, width - 80, height - 60);

  ctx.fillStyle = "#1A7F5A";
  ctx.fillRect(40, 30, width - 80, 90);
  ctx.fillStyle = "#ffffff";
  ctx.font = "bold 30px Arial";
  ctx.fillText("EMPRESA DE " + service.label.toUpperCase(), 64, 88);

  ctx.fillStyle = "#222222";
  ctx.font = "18px Arial";
  const lines = [
    ["Cliente:", "María Elena Quispe"],
    ["Dirección:", "Av. Los Olivos 123, Lima"],
    [service.numberField === "supply" ? "Suministro:" : "Contrato:", number],
    ["Periodo:", new Date().toLocaleDateString("es-PE", { month: "long", year: "numeric" })]
  ];
  lines.forEach(function (line, index) {
    const y = 175 + index * 42;
    ctx.font = "bold 18px Arial";
    ctx.fillText(line[0], 70, y);
    ctx.font = "18px Arial";
    ctx.fillText(line[1], 230, y);
  });

  ctx.strokeStyle = "#999999";
  ctx.lineWidth = 1;
  for (let i = 0; i < 6; i++) {
    const y = 370 + i * 34;
    ctx.beginPath();
    ctx.moveTo(70, y);
    ctx.lineTo(width - 70, y);
    ctx.stroke();
    ctx.font = "16px Arial";
    ctx.fillText("Concepto " + (i + 1), 76, y + 24);
    ctx.fillText((service.reference * 0.1 * (i + 1) / 3).toFixed(2), width - 150, y + 24);
  }

  ctx.fillStyle = "#F8EED7";
  ctx.fillRect(70, 600, width - 140, 110);
  ctx.fillStyle = "#222222";
  ctx.font = "bold 22px Arial";
  ctx.fillText("TOTAL A PAGAR:  S/ " + amount, 90, 642);
  ctx.font = "bold 18px Arial";
  ctx.fillText("Fecha de vencimiento:  " + parseDateKey(dueDate).toLocaleDateString("es-PE"), 90, 688);

  for (let x = 70; x < width - 70; x += 6) {
    ctx.fillRect(x, 730, (x * 7) % 4 + 1, 50);
  }

  let data = { number: number, amount: amount, dueDate: dueDate };

  if (variant === "partial") {
    ctx.fillStyle = "#b9b4aa";
    ctx.fillRect(80, 612, width - 160, 90);
    data = { number: number, amount: "", dueDate: "" };
  }

  let output = canvas;

  if (variant === "blurry") {
    const blurred = document.createElement("canvas");
    blurred.width = width;
    blurred.height = height;
    const blurContext = blurred.getContext("2d");
    if ("filter" in blurContext) {
      blurContext.filter = "blur(6px)";
      blurContext.drawImage(canvas, 0, 0);
    }
    const small = document.createElement("canvas");
    small.width = width / 10;
    small.height = height / 10;
    small.getContext("2d").drawImage(blurred, 0, 0, small.width, small.height);
    blurContext.filter = "none";
    blurContext.imageSmoothingEnabled = true;
    blurContext.clearRect(0, 0, width, height);
    blurContext.drawImage(small, 0, 0, width, height);
    output = blurred;
  }

  if (variant === "dark") {
    ctx.fillStyle = "rgba(10, 10, 20, 0.86)";
    ctx.fillRect(0, 0, width, height);
  }

  return { dataUrl: output.toDataURL("image/jpeg", 0.85), data: data };
}
