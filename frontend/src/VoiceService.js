/**
 * VoiceService.js
 * 
 * Web Speech API Integration
 * Makes the robot "speak" user messages aloud using text-to-speech
 */

class VoiceService {
  constructor() {
    this.synth = window.speechSynthesis;
    this.currentUtterance = null;
    this.isEnabled = true;
    this.voice = null;
    
    // Wait for voices to load
    this.loadVoices();
    
    // Some browsers need this event to load voices
    if (this.synth.onvoiceschanged !== undefined) {
      this.synth.onvoiceschanged = () => this.loadVoices();
    }
  }

  /**
   * Load available voices and select the best one
   */
  loadVoices() {
    const voices = this.synth.getVoices();
    
    if (voices.length === 0) return;

    // Try to find a good English voice
    // Priority: Google UK English Male > Any English Male > Any English voice > First voice
    this.voice = 
      voices.find(v => v.name.includes('Google UK English Male')) ||
      voices.find(v => v.lang.startsWith('en') && v.name.toLowerCase().includes('male')) ||
      voices.find(v => v.lang.startsWith('en-US')) ||
      voices.find(v => v.lang.startsWith('en')) ||
      voices[0];

    console.log('🎙️ Voice loaded:', this.voice?.name);
  }

  /**
   * Speak the given text aloud
   * @param {string} text - The text to speak
   * @param {object} options - Voice options (rate, pitch, volume)
   */
  speak(text, options = {}) {
    if (!this.isEnabled) return;
    if (!text || text.trim() === '') return;

    // Cancel any current speech
    this.cancel();

    // Create new speech utterance
    this.currentUtterance = new SpeechSynthesisUtterance(text);
    
    // Set voice if available
    if (this.voice) {
      this.currentUtterance.voice = this.voice;
    }

    // Set voice properties
    this.currentUtterance.rate = options.rate || 1.0;    // Speed (0.1 - 10)
    this.currentUtterance.pitch = options.pitch || 1.0;  // Pitch (0 - 2)
    this.currentUtterance.volume = options.volume || 1.0; // Volume (0 - 1)
    this.currentUtterance.lang = options.lang || 'en-US';

    // Event listeners
    this.currentUtterance.onstart = () => {
      console.log('🎙️ Robot started speaking');
    };

    this.currentUtterance.onend = () => {
      console.log('🎙️ Robot finished speaking');
      this.currentUtterance = null;
    };

    this.currentUtterance.onerror = (event) => {
      console.error('🎙️ Speech error:', event.error);
      this.currentUtterance = null;
    };

    // Speak!
    this.synth.speak(this.currentUtterance);
  }

  /**
   * Cancel current speech
   */
  cancel() {
    if (this.synth.speaking) {
      this.synth.cancel();
    }
    this.currentUtterance = null;
  }

  /**
   * Pause current speech
   */
  pause() {
    if (this.synth.speaking) {
      this.synth.pause();
    }
  }

  /**
   * Resume paused speech
   */
  resume() {
    if (this.synth.paused) {
      this.synth.resume();
    }
  }

  /**
   * Enable/disable voice
   */
  setEnabled(enabled) {
    this.isEnabled = enabled;
    if (!enabled) {
      this.cancel();
    }
  }

  /**
   * Check if currently speaking
   */
  isSpeaking() {
    return this.synth.speaking;
  }

  /**
   * Get list of available voices
   */
  getAvailableVoices() {
    return this.synth.getVoices();
  }

  /**
   * Change voice by name
   */
  setVoice(voiceName) {
    const voices = this.synth.getVoices();
    const newVoice = voices.find(v => v.name === voiceName);
    if (newVoice) {
      this.voice = newVoice;
      console.log('🎙️ Voice changed to:', voiceName);
    }
  }
}

// Create singleton instance
const voiceService = new VoiceService();

export default voiceService;