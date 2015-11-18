import { Graphics } from 'pixi.js';
import { Howl } from 'howler';
import setts from './setts';
import Scene from './classes/Scene';
import AudioAnalyzer from './classes/AudioAnalyzer';
import SoundExplorer from './classes/SoundExplorer';
import NumberUtils from './utils/number-utils';

let angle = 0;

class App {

  constructor() {

    this.DELTA_TIME = 0;
    this.LAST_TIME = Date.now();

    this.width = window.innerWidth;
    this.height = window.innerHeight;

    this.scene = new Scene();
    this.scene.renderer.backgroundColor = 0x2c3e50;

    let root = document.body.querySelector('.app')
    root.appendChild( this.scene.renderer.view );

    //this.myAudioAnalyzer = new AudioAnalyzer('/sounds/woodkid-iron.mp3');
    //this.myAudioAnalyzer = new AudioAnalyzer('/sounds/short.mp3', true);

    this.music = new Howl({
      urls: ['/sounds/woodkid-iron.mp3'],
      autoplay: true,
      onend: this.onMusicEnd.bind(this)
    });

    this.mySoundExplorer = new SoundExplorer('/sounds/woodkid-iron-analysis.json');

    this.addListeners();
  }

  /**
   * addListeners
   */
  addListeners() {

    window.addEventListener( 'resize', this.onResize.bind(this) );
    TweenMax.ticker.addEventListener( 'tick', this.update.bind(this) )

  }

  /**
   * update
   * - Triggered on every TweenMax tick
   */
  update() {

    this.DELTA_TIME = Date.now() - this.LAST_TIME;
    this.LAST_TIME = Date.now();

    data = this.mySoundExplorer.atPos( this.music.pos() );



    this.scene.render();

  }


  onMusicEnd() {
    this.music.play();
  }

  onResize( evt ) {

    this.width = window.innerWidth;
    this.height = window.innerHeight;

    this.scene.resize( this.width, this.height );


  }


}

export default App;
