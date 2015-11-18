import { Graphics } from 'pixi.js';
import { Howl } from 'howler';
import _ from 'lodash';
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

    this.loudness = -60;

    //let music = 'woodkid-iron';
    let music = 'woodkid-run-boy-run';

    this.music = new Howl({
      urls: ['/sounds/' + music + '.mp3'],
      autoplay: true,
      onend: this.onMusicEnd.bind(this)
    });
    this.mySoundExplorer = new SoundExplorer('/sounds/' + music + '.json');

    this.pointsGraph = [];
    this.pointsSize = [];

    let colors = [0x2ecc71, 0x3498db, 0x9b59b6, 0x34495e, 0x16a085, 0x27ae60, 0x2980b9, 0x8e44ad, 0xf1c40f, 0xe67e22, 0xe74c3c, 0xecf0f1, 0x95a5a6, 0xf39c12, 0xd35400, 0xc0392b, 0xbdc3c7, 0x7f8c8d];

    for (var i = 0; i < 20; i++) {
      var newGraph = new Graphics();
      newGraph.y = this.height/2;
      newGraph.x = 50 + (i * ((this.width-100)/20));
      newGraph.color = colors[i % colors.length];
      this.pointsGraph.push(newGraph);
      this.pointsSize[i] = 50;
      this.scene.addChild(newGraph);
    }

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

    let data = this.mySoundExplorer.dataAtPos( this.music.pos() + (setts.timeOffset/1000) );

    if (data.segment !== null) {
      let val = Math.floor(data.segment.confidence * 100);
      //console.log(val);
    }


    if (data.bar !== null) {
      let val = data.bar.confidence; //Math.floor(data.beat.confidence * 100);
      console.log(val);
    }

    if (data.segment !== null) {
      var db = data.segment.loudness_max;
      this.loudness = 50 + (60 + db) * 3;
    }

    if (data.segment !== null) {
      let list = data.segment.pitches;
      for (var i = 0; i < list.length; i++) {
        let val = Math.floor(list[i] * 19);
        this.pointsGraph[val].y = this.height/2 + data.segment.timbre[i];
        this.pointsSize[val] = this.loudness;
      }
    }
    //this.updatePoints();

    this.scene.render();

  }

  updatePoints() {
    for (var i = 0; i < this.pointsGraph.length; i++) {
      let graph = this.pointsGraph[i];
      if (this.pointsSize[i] > 50) {
        this.pointsSize[i] = 50;
      }
      graph.clear();
      graph.beginFill( graph.color );
      let size = ((this.width-100)/20) - 4;
      graph.drawRect(-size/2, -this.pointsSize[i]/2, size, this.pointsSize[i]);
    }
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
