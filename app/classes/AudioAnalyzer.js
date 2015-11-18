export default class AudioAnalyzer {

  constructor(soundUrl, loop) {
    this.soundUrl = soundUrl;
    this.loop = false;
    if (loop !== undefined) { this.loop = true; }

    this.audioCtx = new AudioContext();

    this.analyser = this.audioCtx.createAnalyser();
    this.frequencyData = new Uint8Array(this.analyser.frequencyBinCount);

    this.soundLoaded = false;
    this.playStart = null;

    this.audioBuffer;
    this.audioSource;

    this.loadSound();
  }

  loadSound() {
    let request = new XMLHttpRequest();
    request.open('GET', this.soundUrl, true);
    request.responseType = 'arraybuffer';

    request.onload = () => {
      this.audioCtx.decodeAudioData(request.response, (buffer) => {
        this.soundLoaded = true;
        // success callback
        this.audioBuffer = buffer;
        // Create sound from buffer
        this.audioSource = this.audioCtx.createBufferSource();
        this.audioSource.buffer = this.audioBuffer;
        this.audioSource.loop = this.loop;
        this.audioSource.onended = () => {
          this.playSound();
        }
        // connect the audio source to context's output
        this.audioSource.connect(this.analyser);
        this.analyser.connect(this.audioCtx.destination);
        this.audioSource.start();
        this.playSound();
      }, function(){
        // error callback
      });
    }
    request.send();
  }

  playSound() {
    if (this.soundLoaded) {
      this.playStart = Date.now();
      console.log('play : ' + this.playStart);
    }
  }

  getFrequencyData() {
    if (this.soundLoaded) {
      this.analyser.getByteFrequencyData(this.frequencyData);
    }
    return this.frequencyData;
  }

  getAverageFrequency() {

    let data = this.getFrequencyData();

    let total = 0;
    let pond = 0;

    for (let i = 0; i < data.length; i++) {
      total += i * data[i];
      pond += data[i];
    }

    const result = (pond) ? total / pond : 0;
    return result;
  }

  getFrequencyBars(nbfOfBars) {

    let data = this.getFrequencyData();

    let freqByBar = data.length / nbfOfBars;

    let result = [];
    for (let i = 0; i < nbfOfBars; i++) {
      result[i] = [];
    }

    // Group
    for (let i = 0; i < data.length; i++) {
      let resultIndex = Math.floor(i/freqByBar);
      result[resultIndex].push(data[i])
    }

    // Reduce
    result = result.map( (list) => {
      let len = list.length;
      let total = list.reduce( (valeurPrecedente, valeurCourante, index, array) => {
        return valeurPrecedente + valeurCourante;
      }, 0);
      return total / len;
    });

    return result;
  }

  getT() {
    return this.audioCtx.currentTime;
  }

};
