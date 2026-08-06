class SoundEngine {
  private ctx: AudioContext | null = null;
  private ambientOscs: { osc: OscillatorNode; gain: GainNode }[] = [];
  private ambientFilter: BiquadFilterNode | null = null;
  private masterGain: GainNode | null = null;
  private isMuted: boolean = false;
  private currentChordsInterval: any = null;
  private ringtoneInterval: any = null;

  constructor() {
    // Lazily initialized on first user interaction
  }

  private init() {
    if (this.ctx) return;
    try {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      this.ctx = new AudioCtx();
      
      this.masterGain = this.ctx.createGain();
      this.masterGain.gain.setValueAtTime(this.isMuted ? 0 : 0.5, this.ctx.currentTime);
      this.masterGain.connect(this.ctx.destination);

      // Lowpass filter for the warm cinematic room hum
      this.ambientFilter = this.ctx.createBiquadFilter();
      this.ambientFilter.type = 'lowpass';
      this.ambientFilter.frequency.setValueAtTime(250, this.ctx.currentTime);
      this.ambientFilter.connect(this.masterGain);
    } catch (e) {
      console.error("Failed to initialize Web Audio API", e);
    }
  }

  setMute(mute: boolean) {
    this.isMuted = mute;
    if (this.masterGain && this.ctx) {
      this.masterGain.gain.setValueAtTime(mute ? 0 : 0.4, this.ctx.currentTime);
    }
  }

  getMute() {
    return this.isMuted;
  }

  // Plays a soft high-fidelity click for typewriter letters
  playClick() {
    this.init();
    if (!this.ctx || this.isMuted) return;

    const time = this.ctx.currentTime;
    
    // Low frequency click
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(120, time);
    // Pitch slide down quickly
    osc.frequency.exponentialRampToValueAtTime(30, time + 0.05);

    gain.gain.setValueAtTime(0.08, time);
    gain.gain.exponentialRampToValueAtTime(0.001, time + 0.04);

    osc.connect(gain);
    if (this.masterGain) gain.connect(this.masterGain);

    osc.start(time);
    osc.stop(time + 0.05);

    // High frequency tick
    const oscHigh = this.ctx.createOscillator();
    const gainHigh = this.ctx.createGain();
    
    oscHigh.type = 'sine';
    oscHigh.frequency.setValueAtTime(1200, time);
    oscHigh.frequency.exponentialRampToValueAtTime(800, time + 0.02);

    gainHigh.gain.setValueAtTime(0.04, time);
    gainHigh.gain.exponentialRampToValueAtTime(0.001, time + 0.02);

    oscHigh.connect(gainHigh);
    if (this.masterGain) gainHigh.connect(this.masterGain);

    oscHigh.start(time);
    oscHigh.stop(time + 0.02);
  }

  // Plays a dual-sine chime for system clearance / action success
  playSystemClearance() {
    this.init();
    if (!this.ctx || this.isMuted) return;

    const time = this.ctx.currentTime;
    const osc1 = this.ctx.createOscillator();
    const osc2 = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc1.type = 'sine';
    osc1.frequency.setValueAtTime(523.25, time); // C5
    osc1.frequency.exponentialRampToValueAtTime(783.99, time + 0.15); // G5

    osc2.type = 'sine';
    osc2.frequency.setValueAtTime(659.25, time); // E5
    osc2.frequency.exponentialRampToValueAtTime(1046.50, time + 0.15); // C6

    gain.gain.setValueAtTime(0.08, time);
    gain.gain.exponentialRampToValueAtTime(0.001, time + 0.3);

    osc1.connect(gain);
    osc2.connect(gain);
    if (this.masterGain) gain.connect(this.masterGain);

    osc1.start(time);
    osc2.start(time);
    
    osc1.stop(time + 0.35);
    osc2.stop(time + 0.35);
  }

  // Simulates corporate office atmospheric hum (A/C rumble & distant server fans)
  startOfficeHum() {
    this.init();
    if (!this.ctx || this.isMuted || this.ambientOscs.length > 0) return;

    const time = this.ctx.currentTime;

    // Create a deep low drone at 55Hz & 110Hz (A1 and A2)
    const frequencies = [55, 110, 165];
    frequencies.forEach((freq, idx) => {
      if (!this.ctx || !this.ambientFilter) return;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, time);

      // Add a tiny bit of frequency modulation for organic flutter
      osc.frequency.linearRampToValueAtTime(freq + (idx === 0 ? 0.5 : -0.5), time + 5);

      gain.gain.setValueAtTime(idx === 0 ? 0.15 : 0.07, time);
      
      osc.connect(gain);
      gain.connect(this.ambientFilter);
      osc.start(time);

      this.ambientOscs.push({ osc, gain });
    });
  }

  stopOfficeHum() {
    this.ambientOscs.forEach(({ osc }) => {
      try {
        osc.stop();
      } catch (e) {}
    });
    this.ambientOscs = [];
  }

  // Smart ambient synth chord progress (Interstellar / Mr. Robot style)
  startAmbientMusic() {
    this.init();
    if (!this.ctx) return;
    this.startOfficeHum();

    if (this.currentChordsInterval) clearInterval(this.currentChordsInterval);

    // Chords are represented by note frequencies:
    // Dm9 (D, F, A, C, E), G13 (G, B, D, F, A, E), Cmaj9 (C, E, G, B, D), Am9 (A, C, E, G, B)
    const chords = [
      [73.42, 130.81, 174.61, 220.00, 329.63], // Dm9
      [98.00, 146.83, 196.00, 246.94, 329.63], // G13
      [65.41, 130.81, 164.81, 196.00, 293.66], // Cmaj9
      [55.00, 110.00, 164.81, 220.00, 293.66], // Am9
    ];

    let chordIndex = 0;

    const playChord = () => {
      if (!this.ctx || this.isMuted) return;
      const time = this.ctx.currentTime;
      const chord = chords[chordIndex];

      chord.forEach((freq, idx) => {
        if (!this.ctx) return;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();

        // Alternate waveforms for high/low parts
        osc.type = idx < 2 ? 'sine' : 'triangle';
        osc.frequency.setValueAtTime(freq, time);

        // Very slow attack, long release
        const attack = 2.5;
        const sustain = 3.0;
        const release = 2.5;
        const maxGain = idx === 0 ? 0.08 : 0.04;

        gain.gain.setValueAtTime(0, time);
        gain.gain.linearRampToValueAtTime(maxGain, time + attack);
        gain.gain.setValueAtTime(maxGain, time + attack + sustain);
        gain.gain.exponentialRampToValueAtTime(0.001, time + attack + sustain + release);

        // Lowpass filter routing for warmth
        if (this.ambientFilter) {
          osc.connect(gain);
          gain.connect(this.ambientFilter);
        } else if (this.masterGain) {
          osc.connect(gain);
          gain.connect(this.masterGain);
        }

        osc.start(time);
        osc.stop(time + attack + sustain + release);
      });

      // Play a tiny, sparse high-pitched piano note inside the chords
      setTimeout(() => {
        if (Math.random() > 0.3) {
          const notes = [440, 523.25, 587.33, 659.25, 783.99, 880]; // A, C, D, E, G, A
          const randomNote = notes[Math.floor(Math.random() * notes.length)];
          this.playMinimalPianoNote(randomNote);
        }
      }, 3000);

      chordIndex = (chordIndex + 1) % chords.length;
    };

    playChord();
    this.currentChordsInterval = setInterval(playChord, 8000);
  }

  // Play a soft high piano frequency with long decay
  playMinimalPianoNote(freq: number) {
    if (!this.ctx || this.isMuted) return;
    const time = this.ctx.currentTime;

    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    const filter = this.ctx.createBiquadFilter();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(freq, time);

    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(1000, time);

    // Fast attack, long decay
    gain.gain.setValueAtTime(0.0, time);
    gain.gain.linearRampToValueAtTime(0.12, time + 0.02);
    gain.gain.exponentialRampToValueAtTime(0.001, time + 3.0);

    osc.connect(filter);
    filter.connect(gain);
    if (this.masterGain) gain.connect(this.masterGain);

    osc.start(time);
    osc.stop(time + 3.1);
  }

  // Futuristic low-pitch radio static voice beep to make text dialogues interactive
  playVoiceStatic(pitchOffset: number = 0) {
    this.init();
    if (!this.ctx || this.isMuted) return;

    const time = this.ctx.currentTime;
    const baseFreq = 180 + pitchOffset; // Custom pitches for different stakeholders

    const osc = this.ctx.createOscillator();
    const modulator = this.ctx.createOscillator();
    const oscGain = this.ctx.createGain();
    const filter = this.ctx.createBiquadFilter();

    // Frequency modulation for voice-like vibration
    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(baseFreq, time);

    modulator.frequency.setValueAtTime(45, time); // 45 Hz LFO modulation
    const modGain = this.ctx.createGain();
    modGain.gain.setValueAtTime(30, time);

    // Bandpass filter to sound like a low-fidelity speaker/radio
    filter.type = 'bandpass';
    filter.frequency.setValueAtTime(600, time);
    filter.Q.setValueAtTime(1.5, time);

    oscGain.gain.setValueAtTime(0.04, time);
    oscGain.gain.exponentialRampToValueAtTime(0.001, time + 0.12);

    modulator.connect(modGain);
    modGain.connect(osc.frequency);

    osc.connect(filter);
    filter.connect(oscGain);
    if (this.masterGain) oscGain.connect(this.masterGain);

    modulator.start(time);
    osc.start(time);
    
    modulator.stop(time + 0.15);
    osc.stop(time + 0.15);
  }

  // Synthesizes the Microsoft Teams ringing sound
  startTeamsRingtone() {
    this.init();
    if (!this.ctx) return;

    if (this.ringtoneInterval) clearInterval(this.ringtoneInterval);

    const playBeepSeq = () => {
      if (!this.ctx || this.isMuted) return;
      const time = this.ctx.currentTime;

      // Microsoft Teams Ringtone: Dual sine waves (600Hz + 750Hz) playing in a double pulse rhythm
      const playPulse = (startOffset: number) => {
        if (!this.ctx) return;
        const osc1 = this.ctx.createOscillator();
        const osc2 = this.ctx.createOscillator();
        const gain = this.ctx.createGain();

        osc1.type = 'sine';
        osc1.frequency.setValueAtTime(600, time + startOffset);
        
        osc2.type = 'sine';
        osc2.frequency.setValueAtTime(750, time + startOffset);

        gain.gain.setValueAtTime(0.0, time + startOffset);
        gain.gain.linearRampToValueAtTime(0.08, time + startOffset + 0.02);
        gain.gain.setValueAtTime(0.08, time + startOffset + 0.18);
        gain.gain.exponentialRampToValueAtTime(0.001, time + startOffset + 0.22);

        osc1.connect(gain);
        osc2.connect(gain);
        if (this.masterGain) gain.connect(this.masterGain);

        osc1.start(time + startOffset);
        osc2.start(time + startOffset);
        
        osc1.stop(time + startOffset + 0.25);
        osc2.stop(time + startOffset + 0.25);
      };

      // Double-pulse rhythm
      playPulse(0.0);
      playPulse(0.3);
    };

    playBeepSeq();
    this.ringtoneInterval = setInterval(playBeepSeq, 1500);
  }

  stopTeamsRingtone() {
    if (this.ringtoneInterval) {
      clearInterval(this.ringtoneInterval);
      this.ringtoneInterval = null;
    }
  }

  stopAll() {
    this.stopOfficeHum();
    this.stopTeamsRingtone();
    if (this.currentChordsInterval) {
      clearInterval(this.currentChordsInterval);
      this.currentChordsInterval = null;
    }
  }
}

export const sound = new SoundEngine();
