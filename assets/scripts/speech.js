const speech = {
  utterance: null,
  paused: false
};

function isSpeechSupported() {
  return "speechSynthesis" in window && "SpeechSynthesisUtterance" in window;
}

function findSpanishVoice() {
  const voices = window.speechSynthesis.getVoices();
  return voices.find(function (voice) {
    return voice.lang === "es-PE";
  }) || voices.find(function (voice) {
    return voice.lang.startsWith("es");
  });
}

function speakText(text, handlers) {
  stopSpeech();

  const utterance = new SpeechSynthesisUtterance(text);
  const voice = findSpanishVoice();
  utterance.lang = voice ? voice.lang : "es-PE";
  if (voice) {
    utterance.voice = voice;
  }
  utterance.rate = 0.9;

  utterance.onboundary = function (event) {
    if (handlers.onProgress) {
      handlers.onProgress(Math.min(100, Math.round((event.charIndex / text.length) * 100)));
    }
  };
  utterance.onend = function () {
    speech.utterance = null;
    speech.paused = false;
    handlers.onEnd();
  };
  utterance.onerror = function () {
    speech.utterance = null;
    speech.paused = false;
    handlers.onEnd();
  };

  speech.utterance = utterance;
  speech.paused = false;
  window.speechSynthesis.speak(utterance);
}

function toggleSpeechPause() {
  if (!speech.utterance) {
    return false;
  }

  if (speech.paused) {
    window.speechSynthesis.resume();
  } else {
    window.speechSynthesis.pause();
  }
  speech.paused = !speech.paused;
  return speech.paused;
}

function stopSpeech() {
  if (!isSpeechSupported()) {
    return;
  }
  if (speech.utterance) {
    speech.utterance.onend = null;
    speech.utterance.onerror = null;
  }
  speech.utterance = null;
  speech.paused = false;
  window.speechSynthesis.cancel();
}