import Dat from 'dat-gui';
import Scene from './classes/Scene';
import AudioAnalyzer from './classes/AudioAnalyzer';
import { Graphics } from 'pixi.js';
import NumberUtils from './utils/number-utils';

let angle = 0;

class App {

  constructor() {

    this.DELTA_TIME = 0;
    this.LAST_TIME = Date.now();

    this.width = window.innerWidth;
    this.height = window.innerHeight;

    this.scene = new Scene();

    let root = document.body.querySelector('.app')
    root.appendChild( this.scene.renderer.view );

    this.bars = new Graphics();
    this.scene.addChild( this.bars );

    this.myAudioAnalyzer = new AudioAnalyzer('/sounds/woodkid-iron.mp3');

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

    var frequencyData = this.myAudioAnalyzer.getFrequencyBars(10);

    this.bars.clear();
    var barWidth = this.width / frequencyData.length;

    this.bars.beginFill(0xFF0000);

    for (var i = 0; i < frequencyData.length; i++) {
      var freq = frequencyData[i];
      var height = NumberUtils.map(freq, 0, 255, 0, this.height);
      this.bars.drawRect(i*barWidth, this.height - height, barWidth, height);
    }

    this.scene.render();

  }



  /**
   * onResize
   * - Triggered when window is resized
   * @param  {obj} evt
   */
  onResize( evt ) {

    this.width = window.innerWidth;
    this.height = window.innerHeight;

    this.scene.resize( this.width, this.height );


  }


}

export default App;
