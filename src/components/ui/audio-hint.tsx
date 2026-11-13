"use client";

import { useRef, useState } from "react";
import { Square, Volume2 } from "lucide-react";

type Props = {
  /** Consigne lue à voix haute (texte de repli si le fichier audio est vide ou absent). */
  text: string;
  /** Fichier audio de la consigne, ex. /audio/fr/accueil.mp3 (vide au départ). */
  src?: string;
  lang?: string;
  listenLabel: string;
  stopLabel: string;
  /** Texte court affiché à côté de l'icône (ex. « Écouter ») : pastille comme dans la maquette. */
  label?: string;
};

/** Bouton haut-parleur présent sur chaque écran : lit la consigne (section 3, guidage audio). */
export function AudioHint({ text, src, lang = "fr-FR", listenLabel, stopLabel, label }: Props) {
  const [playing, setPlaying] = useState(false);
  const audio = useRef<HTMLAudioElement | null>(null);

  function speak() {
    if (typeof window === "undefined" || !("speechSynthesis" in window)) return setPlaying(false);
    const u = new SpeechSynthesisUtterance(text);
    u.lang = lang;
    u.onend = () => setPlaying(false);
    u.onerror = () => setPlaying(false);
    window.speechSynthesis.speak(u);
  }

  function stop() {
    audio.current?.pause();
    if ("speechSynthesis" in window) window.speechSynthesis.cancel();
    setPlaying(false);
  }

  function toggle() {
    if (playing) return stop();
    setPlaying(true);
    if (!src) return speak();
    const a = new Audio(src);
    audio.current = a;
    a.onended = () => setPlaying(false);
    a.onerror = speak; // fichier vide ou absent : synthèse vocale du navigateur
    a.play().catch(speak);
  }

  return (
    <button
      type="button"
      onClick={toggle}
      aria-pressed={playing}
      aria-label={playing ? stopLabel : listenLabel}
      className={label ? "soft flex min-h-12 shrink-0 items-center gap-2 rounded-full px-4 font-bold" : "soft grid size-12 shrink-0 place-items-center rounded-full"}
    >
      {playing ? <Square className="size-5" aria-hidden="true" /> : <Volume2 className="size-6" aria-hidden="true" />}
      {label && <span>{label}</span>}
    </button>
  );
}
