/* Sprint 2 · US-12: reproducir por audio la instrucción de cada paso de la guía.
   Usa la síntesis de voz del navegador (Web Speech API), sin servidor. */

const GuideAudio = (function () {
  const synth = window.speechSynthesis;
  const state = { status: "idle", stepKey: null, controls: null };

  function isSupported() {
    return Boolean(synth) && typeof window.SpeechSynthesisUtterance === "function";
  }

  function pickVoice() {
    const voices = synth.getVoices();
    return voices.find(function (voice) { return /^es[-_]PE/i.test(voice.lang); })
      || voices.find(function (voice) { return /^es[-_](419|MX|US|CO|AR|CL)/i.test(voice.lang); })
      || voices.find(function (voice) { return /^es/i.test(voice.lang); })
      || null;
  }

  function render() {
    if (!state.controls) {
      return;
    }
    const play = state.controls.querySelector(".s2-audio-play");
    const pause = state.controls.querySelector(".s2-audio-pause");
    const status = state.controls.querySelector(".s2-audio-status");

    if (state.status === "playing") {
      play.hidden = true;
      pause.hidden = false;
      pause.innerHTML = getExtraIcon("pause") + "<span>Pausar</span>";
      pause.setAttribute("aria-label", "Pausar el audio");
      status.textContent = "Leyendo la instrucción en voz alta…";
    } else if (state.status === "paused") {
      play.hidden = true;
      pause.hidden = false;
      pause.innerHTML = getExtraIcon("play") + "<span>Continuar audio</span>";
      pause.setAttribute("aria-label", "Continuar el audio desde donde se pausó");
      status.textContent = "Audio en pausa.";
    } else {
      play.hidden = false;
      pause.hidden = true;
      status.textContent = "";
    }
  }

  function stop() {
    if (!isSupported()) {
      return;
    }
    synth.cancel();
    state.status = "idle";
    render();
  }

  function speak(text) {
    if (!isSupported()) {
      showToast("Tu navegador no puede leer en voz alta. Prueba con Chrome o Edge.");
      return;
    }

    synth.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    const voice = pickVoice();
    utterance.lang = voice ? voice.lang : "es-PE";
    if (voice) {
      utterance.voice = voice;
    }
    utterance.rate = 0.9;

    utterance.onend = function () {
      if (state.status !== "paused") {
        state.status = "idle";
        render();
      }
    };
    utterance.onerror = function (event) {
      if (event.error !== "interrupted" && event.error !== "canceled") {
        showToast("No pudimos reproducir el audio. Revisa el volumen de tu equipo.");
      }
      state.status = "idle";
      render();
    };

    state.status = "playing";
    render();
    synth.speak(utterance);
  }

  function togglePause() {
    if (state.status === "playing") {
      synth.pause();
      state.status = "paused";
    } else if (state.status === "paused") {
      synth.resume();
      state.status = "playing";
    }
    render();
  }

  /* Crea los controles dentro de la tarjeta del paso. getText devuelve lo que se leerá. */
  function mount(container, beforeElement, getText) {
    if (state.controls) {
      return;
    }

    const controls = document.createElement("div");
    controls.className = "s2-audio";
    controls.innerHTML =
      '<button type="button" class="btn btn-secondary s2-audio-play" aria-label="Escuchar la instrucción en voz alta">' +
        getExtraIcon("speaker") + "<span>Escuchar</span></button>" +
      '<button type="button" class="btn btn-secondary s2-audio-pause" hidden></button>' +
      '<p class="s2-audio-status" role="status" aria-live="polite"></p>';

    container.insertBefore(controls, beforeElement);
    state.controls = controls;

    controls.querySelector(".s2-audio-play").addEventListener("click", function () {
      speak(getText());
    });
    controls.querySelector(".s2-audio-pause").addEventListener("click", togglePause);

    if (!isSupported()) {
      controls.querySelector(".s2-audio-play").title = "Tu navegador no puede leer en voz alta";
    } else if (typeof synth.getVoices === "function") {
      synth.getVoices();
    }

    window.addEventListener("pagehide", stop);
    render();
  }

  /* Al cambiar de paso se detiene el audio anterior (US-12, escenario 3). */
  function onStepChange(stepKey) {
    if (state.stepKey !== stepKey) {
      state.stepKey = stepKey;
      stop();
    }
  }

  return { mount: mount, onStepChange: onStepChange, stop: stop };
})();
