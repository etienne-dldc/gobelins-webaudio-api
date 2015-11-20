import bufferLoader from 'webaudio-buffer-loader';

export default class AudioAnalyzer {

  constructor(options) {
    this.soundUrl = options.url;

    this.loop = false;
    if (options.loop !== undefined) { this.loop = options.loop; }

    this.onend = function () {};
    if (options.onend !== undefined) { this.onend = options.onend; }

    this.audioCtx = new AudioContext();

    this.analyser = this.audioCtx.createAnalyser();
    this.frequencyData = new Uint8Array(this.analyser.frequencyBinCount);

    this.analyser.connect(this.audioCtx.destination);

    this.soundLoaded = false;
    this.startTime = null;
    this.isPlaying = false;
    this.nbrOfPlay = 0;

    this.audioBuffer = null;
    this.audioSource = null;

    this.loadMusic(this.soundUrl);
  }

  loadMusic(url) {
    if (this.soundLoaded) {
      if (this.isPlaying) {
        this.audioSource.stop();
        this.isPlaying = false;
      }
    }
    bufferLoader(url, this.audioCtx, (err, loadedBuffer) => {
      this.soundLoaded = true;
      this.soundBuffer = loadedBuffer;
      this.playSound();
    });
  }

  playSound() {
    if (this.soundLoaded) {
      if (this.isPlaying) {
        this.audioSource.stop();
        this.isPlaying = false;
      }
      if (this.loop || this.nbrOfPlay < 1) {
        this.audioSource = this.audioCtx.createBufferSource();
        this.audioSource.buffer = this.soundBuffer;

        this.audioSource.connect(this.analyser);
        this.audioSource.onended = () => {
          this.audioSource.onended = () => {};
          this.onend();
          if (this.soundLoaded) {
            this.playSound();
          }
        }
        this.audioSource.start(0);
        this.isPlaying = true;
        this.startTime = Date.now();
        this.nbrOfPlay++;
      }
    }
  }

  pos(){
    if (this.soundLoaded && this.isPlaying) {
      return (Date.now() - this.startTime) / 1000;
    } else {
      return 0;
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

  getAmplitude() {

    let data = this.getFrequencyData();

    let total = 0;
    for (let i = 0; i < data.length; i++) {
      total += data[i];
    }

    return total / data.length;
  }

};
