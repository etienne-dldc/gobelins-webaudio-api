import { Graphics } from 'pixi.js';
import _ from 'lodash';
import setts from './setts';
import Scene from './classes/Scene';
import AudioAnalyzer from './classes/AudioAnalyzer';
import SoundExplorer from './classes/SoundExplorer';
import Tools from './tools';

let angle = 0;

class App {

  constructor() {

    this.DELTA_TIME = 0;
    this.LAST_TIME = Date.now();

    this.width = window.innerWidth;
    this.height = window.innerHeight;
    this.center = {
      x: this.width/2,
      y: this.height/2
    }

    this.scene = new Scene();
    this.scene.renderer.backgroundColor = 0x2c3e50;

    let root = document.body.querySelector('.app')
    root.appendChild( this.scene.renderer.view );

    this.graph = new Graphics();
    this.scene.addChild(this.graph);

    this.stats = {};
    this.lastElem = { confidence: 0 };

    //let music = 'woodkid-iron';
    let music = 'awolnation-sail';
    //let music = 'short';

    this.music = new AudioAnalyzer({
      url: '/sounds/' + music + '.mp3',
      onend: this.onMusicEnd.bind(this),
      loop: true
    });

    window.notesStats = this.stats;

    this.mySoundExplorer = new SoundExplorer('/sounds/' + music + '.json');

    this.colorsList = [0x2ecc71, 0x3498db, 0x9b59b6, 0x34495e, 0x16a085, 0x27ae60, 0x2980b9, 0x8e44ad, 0xf1c40f, 0xe67e22, 0xe74c3c, 0xecf0f1, 0x95a5a6, 0xf39c12, 0xd35400, 0xc0392b, 0xbdc3c7, 0x7f8c8d];

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

    let currentTime = this.music.pos() + (setts.timeOffset/1000);

    let amplitude = this.music.getAmplitude();

    let data = this.mySoundExplorer.dataAtPos( currentTime );

    if (data.segment !== null) {
      let elem = data.segment;
      if (this.lastElem.confidence !== elem.confidence) {
        this.lastElem = elem;
      }
      let hue = Tools.map(elem.confidence, 0, 1, 0, 360);
      let color = Tools.hsl2hex(hue, 40, 60);
      let size = Tools.map(amplitude, 0, 255, 50, this.height*0.8);
      let x = 50 * (currentTime % 20);
      let y = 50 * (currentTime / 20);

      this.graph.clear();
      let rectSize = this.width / elem.pitches.length;
      for (var i = 0; i < elem.pitches.length; i++) {
        let height = Tools.map(elem.pitches[i], 0, 1, 0, this.height);
        this.graph.beginFill(this.colorsList[i]);
        this.graph.drawRect(rectSize*i, this.height, rectSize, -height);
        elem.pitches[i]
      }

      let notesDetection = [];

      if ( this.findNote(elem.pitches, [0] )  ) { notesDetection.push('0'); }
      if ( this.findNote(elem.pitches, [1] )  ) { notesDetection.push('1'); }
      if ( this.findNote(elem.pitches, [2] )  ) { notesDetection.push('2'); }
      if ( this.findNote(elem.pitches, [3] )  ) { notesDetection.push('3'); }
      if ( this.findNote(elem.pitches, [4] )  ) { notesDetection.push('4'); }
      if ( this.findNote(elem.pitches, [5] )  ) { notesDetection.push('5'); }
      if ( this.findNote(elem.pitches, [6] )  ) { notesDetection.push('6'); }
      if ( this.findNote(elem.pitches, [7] )  ) { notesDetection.push('7'); }
      if ( this.findNote(elem.pitches, [8] )  ) { notesDetection.push('8'); }
      if ( this.findNote(elem.pitches, [9] )  ) { notesDetection.push('9'); }
      if ( this.findNote(elem.pitches, [10])  ) { notesDetection.push('a'); }
      if ( this.findNote(elem.pitches, [11])  ) { notesDetection.push('b'); }

      //if ( this.findNote(elem.pitches, [5, 6], [5, 8]) ) { notesDetection.push('56'); }
      //if ( this.findNote(elem.pitches, [1, 2, 3, 4, 5], [8, 8, 9, 6, 6]) ) { notesDetection.push('12345'); }

      let note = notesDetection.join('-');
      if (this.stats[note] == undefined) {
        this.stats[note] = 1;
      } else {
        this.stats[note]++
      }

      //this.graph.beginFill(color);
      //this.graph.drawCircle(this.center.x, this.center.y, size);
    }

    this.scene.render();

  }

  findMajorPitches(list, tolerance) {
    if (tolerance == undefined) { tolerance = 0.5 }
    let result = [];
    for (var i = 0; i < list.length; i++) {
      if (list[i] >= tolerance) {
        result.push({
          index: i,
          value: list[i]
        });
      }
    }
    result.sort( (left, right) => {
      return left.value - right.value;
    });
    return result;
  }


  findNote(list, notes, max) {
    if (max == undefined) { max = []; }
    for (var i = 0; i < notes.length; i++) {
      let index = notes[i];
      let maxi = (max[i] !== undefined) ? max[i] : 8;
      if (list[index] < maxi/10) {
        return false;
      }
    }
    return true;
  }

  onMusicEnd() {
    console.log('end');
    console.log(JSON.stringify(this.stats));
  }

  onResize( evt ) {

    this.width = window.innerWidth;
    this.height = window.innerHeight;

    this.scene.resize( this.width, this.height );


  }


}

export default App;
