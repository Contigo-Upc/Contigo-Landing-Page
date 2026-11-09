const MIN_BRIGHTNESS = 70;
const MIN_SHARPNESS = 60;

function getGrayPixels(image, width) {
  const scale = width / image.naturalWidth;
  const height = Math.max(1, Math.round(image.naturalHeight * scale));
  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;

  const context = canvas.getContext("2d", { willReadFrequently: true });
  context.drawImage(image, 0, 0, width, height);
  const data = context.getImageData(0, 0, width, height).data;
  const gray = new Float32Array(width * height);

  for (let i = 0; i < gray.length; i++) {
    gray[i] = 0.299 * data[i * 4] + 0.587 * data[i * 4 + 1] + 0.114 * data[i * 4 + 2];
  }
  return { gray: gray, width: width, height: height };
}

function measureBrightness(gray) {
  let total = 0;
  for (let i = 0; i < gray.length; i++) {
    total += gray[i];
  }
  return total / gray.length;
}

function measureSharpness(pixels) {
  const gray = pixels.gray;
  const width = pixels.width;
  const height = pixels.height;
  let sum = 0;
  let sumSquares = 0;
  let count = 0;

  for (let y = 1; y < height - 1; y++) {
    for (let x = 1; x < width - 1; x++) {
      const i = y * width + x;
      const laplacian = 4 * gray[i] - gray[i - 1] - gray[i + 1] - gray[i - width] - gray[i + width];
      sum += laplacian;
      sumSquares += laplacian * laplacian;
      count++;
    }
  }

  const mean = sum / count;
  return sumSquares / count - mean * mean;
}

function checkPhotoQuality(image) {
  const pixels = getGrayPixels(image, 400);
  const brightness = measureBrightness(pixels.gray);
  const sharpness = measureSharpness(pixels);

  if (brightness < MIN_BRIGHTNESS) {
    return { ok: false, problem: "dark", brightness: brightness, sharpness: sharpness };
  }
  if (sharpness < MIN_SHARPNESS) {
    return { ok: false, problem: "blurry", brightness: brightness, sharpness: sharpness };
  }
  return { ok: true, problem: null, brightness: brightness, sharpness: sharpness };
}

function getImageSeed(image) {
  const pixels = getGrayPixels(image, 64);
  let seed = 7;
  for (let i = 0; i < pixels.gray.length; i += 7) {
    seed = (seed * 31 + Math.round(pixels.gray[i])) % 1000003;
  }
  return seed;
}
