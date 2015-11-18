import Dat from 'dat-gui';
import Scene from './classes/Scene';
import AudioAnalyzer from './classes/AudioAnalyzer';
import SoundExplorer from './classes/SoundExplorer';
import { Graphics } from 'pixi.js';
import NumberUtils from './utils/number-utils';

let angle = 0;

class App {

  constructor() {

    this.DELTA_TIME = 0;
    this.LAST_TIME = Date.now();

    this.initDatGui();

    this.width = window.innerWidth;
    this.height = window.innerHeight;

    this.scene = new Scene();
    this.scene.renderer.backgroundColor = 0x2c3e50;

    let root = document.body.querySelector('.app')
    root.appendChild( this.scene.renderer.view );

    this.bars = new Graphics();
    this.scene.addChild( this.bars );

    this.myAudioAnalyzer = new AudioAnalyzer('/sounds/woodkid-iron.mp3', true);

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

    var frequencyData = this.myAudioAnalyzer.getFrequencyBars(this.setts.nbrOfBars);

    this.bars.clear();
    var barWidth = this.width / (frequencyData.length + this.setts.barsMargin);
    var barsMargin = barWidth * this.setts.barsMargin;

    this.bars.beginFill(0xe74c3c);

    for (var i = 0; i < frequencyData.length; i++) {
      let freq = frequencyData[i];
      let height = NumberUtils.map(freq, 0, 255, 0, this.height);
      let width = barWidth - barsMargin;
      let left = barsMargin + i * barWidth;
      let top = this.height - height;
      this.bars.drawRect(left, top, width, height);
    }

    console.log(this.myAudioAnalyzer.getT() );

    this.scene.render();

  }


  initDatGui() {
    this.setts = {
      nbrOfBars: 10,
      barsMargin: 0.2
    };
    this.gui = new Dat.GUI();
    this.gui.add(this.setts, 'nbrOfBars', 1, 500);
    this.gui.add(this.setts, 'barsMargin', 0, 1);
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
