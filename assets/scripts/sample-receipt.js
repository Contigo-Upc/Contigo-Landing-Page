const SAMPLE_VALUES = {
  electricity: { title: "RECIBO DE LUZ", label: "N.º DE SUMINISTRO", number: "1234567", amount: "85.40" },
  water: { title: "RECIBO DE AGUA", label: "N.º DE SUMINISTRO", number: "7654321", amount: "42.60" },
  internet: { title: "RECIBO DE INTERNET", label: "N.º DE CONTRATO", number: "45678901", amount: "79.90" },
  cable: { title: "RECIBO DE CABLE", label: "N.º DE CONTRATO", number: "23456789", amount: "59.90" }
};

function drawSampleReceipt(procedureId, dueDate, effect) {
  const sample = SAMPLE_VALUES[procedureId];
  const canvas = document.createElement("canvas");
  canvas.width = 600;
  canvas.height = 840;
  const context = canvas.getContext("2d");

  if (effect === "blurry") {
    context.filter = "blur(5px)";
  }
  if (effect === "dark") {
    context.filter = "brightness(0.22)";
  }

  context.fillStyle = "#FFFFFF";
  context.fillRect(0, 0, 600, 840);
  context.fillStyle = "#E3EAF2";
  context.fillRect(0, 0, 600, 110);
  context.fillStyle = "#F4C430";
  context.beginPath();
  context.arc(60, 55, 24, 0, Math.PI * 2);
  context.fill();
  context.fillStyle = "#1F2D3A";
  context.font = "bold 30px Arial";
  context.textAlign = "right";
  context.fillText(sample.title, 570, 66);
  context.textAlign = "left";

  context.fillStyle = "#C9D1DA";
  [150, 175, 200].forEach(function (y, index) {
    context.fillRect(40, y, 420 - index * 90, 10);
  });

  context.strokeStyle = "#9AA6B2";
  context.lineWidth = 2;
  context.strokeRect(40, 240, 520, 130);
  context.strokeRect(40, 390, 250, 140);
  context.strokeRect(310, 390, 250, 140);

  context.fillStyle = "#3B4A58";
  context.font = "18px Arial";
  context.fillText(sample.label, 60, 275);
  context.fillText("TOTAL A PAGAR", 60, 425);
  context.fillText("FECHA DE VENCIMIENTO", 330, 425);

  context.fillStyle = "#111111";
  context.font = "bold 56px Arial";
  context.fillText(sample.number, 60, 345);
  context.font = "bold 44px Arial";
  context.fillText("S/ " + sample.amount, 60, 495);
  context.font = "bold 36px Arial";
  context.fillText(formatShortDate(dueDate), 330, 495);

  context.fillStyle = "#C9D1DA";
  [570, 595, 620, 645].forEach(function (y, index) {
    context.fillRect(40, y, 520 - index * 60, 10);
  });

  context.fillStyle = "#111111";
  for (let x = 60; x < 540; x += 6) {
    const width = (x * 7) % 3 + 1;
    context.fillRect(x, 690, width, 110);
  }

  return canvas.toDataURL("image/png");
}
