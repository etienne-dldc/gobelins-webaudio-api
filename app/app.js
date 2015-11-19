import { Graphics } from 'pixi.js';
import _ from 'lodash';
import setts from './setts';
import Scene from './classes/Scene';
import AudioAnalyzer from './classes/AudioAnalyzer';
import SoundExplorer from './classes/SoundExplorer';
import AnnimationManager from './classes/AnnimationManager';
import Tools from './tools';
import clone from 'clone';


let angle = 0;

class App {

  constructor() {

    const music = 'woodkid-iron';
    //const music = 'woodkid-run-boy-run';
    //const music = 'awolnation-sail';
    //const music = 'short';

    this.DELTA_TIME = 0;
    this.LAST_TIME = Date.now();

    this.width = window.innerWidth;
    this.height = window.innerHeight;
    this.diagonal = Math.sqrt((this.width * this.width) + (this.height * this.height));
    this.center = {
      x: this.width/2,
      y: this.height/2
    }
    this.fps = 1000/60;
    this.lastCustomSyncRender = 0; // Counter to trigger boom x time per second
    this.current = {
      segment: { id: null },
      beat: { id: null },
      tatum: { id: null },
      section: { id: null },
      bar: { id: null },
      pitche: '',
      timbre: '',
      amplitude: 0
    };

    this.scene = new Scene();
    this.scene.renderer.backgroundColor = 0x2c3e50;

    const root = document.body.querySelector('.app')
    root.appendChild( this.scene.renderer.view );

    this.am = new AnnimationManager(this.scene); // To manage annimation ('booms')

    // To control music
    this.music = new AudioAnalyzer({
      url: '/sounds/' + music + '.mp3',
      onend: this.onMusicEnd.bind(this),
      loop: true
    });

    // To mange json file from EchoNest
    this.mySoundExplorer = new SoundExplorer('/sounds/' + music + '.json');

    this.addListeners();
  }

  addListeners() {
    window.addEventListener( 'resize', this.onResize.bind(this) );
    TweenMax.ticker.addEventListener( 'tick', this.update.bind(this) )
  }

  update() {

    this.DELTA_TIME = Date.now() - this.LAST_TIME;
    this.LAST_TIME = Date.now();

    let timeUnit = this.DELTA_TIME / this.fps;
    let currentTime = this.music.pos() + (setts.timeOffset/1000);

    this.current.amplitude = this.music.getAmplitude();
    this.am.setAmplitude(this.current.amplitude);

    this.currentData = this.mySoundExplorer.dataAtPos( currentTime );

    this.onNewEvent('segment', (elem) => {
      this.currentSegment = elem;
      let pitche = this.findElemAuto(elem.pitches);
      if (pitche !== this.current.pitche) {
        this.current.pitche = pitche;
      }
      let timbre = this.findElemAuto(elem.timbre);
      if (timbre !== this.current.timbre) {
        this.current.timbre = timbre;
      }
      if (setts.syncEvent == 'segment') {
        this.addBoom()
      }
    })

    if (setts.syncEvent == 'custom') {
      let timeDiff = Date.now() - this.lastCustomSyncRender;
      if (timeDiff > 1000 / setts.customSyncFrequency) {
        this.lastCustomSyncRender = Date.now();
        this.addBoom();
      }
    }

    if (setts.syncEvent === 'bar' || setts.syncEvent === 'beat' || setts.syncEvent === 'tatum') {
      this.onNewEvent(setts.syncEvent, (elem) => {
        this.addBoom();
      });
    }

    this.onNewEvent('section', (elem) => {
      console.log(this.current.section.id);
    });

    if (this.current.section.id !== null) {
      this.am.setGlobalRotation( setts.globalRotation * Math.pow(-1, this.current.section.id ) );
    } else {
      this.am.setGlobalRotation( setts.globalRotation );
    }

    this.am.update( timeUnit );

    this.scene.render();

  }

  onNewEvent(eventType, callback) {

    if (this.currentData[eventType] !== null) {
      let elem = this.currentData[eventType];
      if (this.current[eventType].id !== elem.id) {
        this.current[eventType] = elem;
        callback(elem);
      }
    }
  }

  addBoom(elem) {
    let cu = this.current;
    let options = this.am.getBoomOptions(cu.pitche, cu.segment.duration);
    options.dist = Tools.map(cu.amplitude, 0, setts.amplitudeMap, 0, this.diagonal/2);
    options.type = cu.timbre.length;
    options.size = Math.pow( Tools.map(cu.segment.loudness_max, -60, 0, 1, 1.8), 10);
    this.am.boom(options);
  }

  elemHas(pitche, search) {
    if (!_.isArray(search)) {
      search = [search];
    }
    let pitcheArr = pitche.split('');
    for (var i = 0; i < search.length; i++) {
      let searchArr = search[i].split('');
      let find = true;
      for (var i = 0; i < searchArr.length; i++) {
        if (find === true && pitcheArr.indexOf(searchArr[i]) === -1) {
          find = false;
        }
      }
      if (find) {
        return true;
      }
    }
    return false;
  }

  elemIs(pitche, search) {
    if (!_.isArray(search)) {
      search = [search];
    }
    for (var i = 0; i < search.length; i++) {
      if (search[i] === pitche) {
        return true;
      }
    }
    return false;
  }

  findElemAuto(list) {
    let hex = [0,1,2,3,4,5,6,7,8,9,'a','b','c','d','e','f']
    let result = [];
    let average = 0;
    for (var i = 0; i < list.length; i++) {
      average += list[i];
    }
    average = average/list.length;
    for (var i = 0; i < list.length; i++) {
      if (list[i] > average ) {
        result.push(hex[i]);
      }
    }
    return result.join('');
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

  findPitche(list, pitches, max) {
    if (max == undefined) { max = []; }
    for (var i = 0; i < pitches.length; i++) {
      let index = pitches[i];
      let maxi = (max[i] !== undefined) ? max[i] : 8;
      if (list[index] < maxi/10) {
        return false;
      }
    }
    return true;
  }

  onMusicEnd() {
    console.log('end');
  }

  onResize( evt ) {

    this.width = window.innerWidth;
    this.height = window.innerHeight;

    this.scene.resize( this.width, this.height );


  }


}

export default App;
