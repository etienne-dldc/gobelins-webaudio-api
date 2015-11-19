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

    this.scene = new Scene();
    this.scene.renderer.backgroundColor = 0x2c3e50;

    let root = document.body.querySelector('.app')
    root.appendChild( this.scene.renderer.view );

    this.graph = new Graphics();
    this.scene.addChild(this.graph);

    this.am = new AnnimationManager(this.scene);

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

    let stats = JSON.parse('{"1345":2,"12345":1,"13457":1,"03479a":1,"034579a":4,"034789ab":10,"034579ab":1,"0345789a":11,"034789a":2,"0345789ab":1,"03479ab":4,"045679":1,"03479b":3,"045789b":1,"045678b":4,"04789ab":8,"034689ab":7,"034568a":1,"034568ab":2,"0349b":4,"0345678a":1,"04568a":2,"0346789b":2,"0345689ab":1,"0349a":2,"0349ab":7,"034789b":7,"0346789ab":5,"035689a":1,"04789b":3,"0245679b":1,"0789ab":1,"01489b":4,"045678a":3,"019b":1,"0345b":5,"012349":5,"046789a":2,"013456":5,"04568b":3,"03689ab":4,"046789b":3,"0145678b":1,"0456789b":2,"0468a":2,"04568":1,"014689b":1,"03689b":2,"03456":2,"014568b":2,"05678b":2,"0246789a":1,"045678":3,"013469b":1,"01346":3,"036789ab":2,"04678ab":1,"03468a":3,"01345b":1,"014689":2,"0389b":2,"01345":6,"0145689b":1,"013469":1,"01245a":2,"036789a":1,"014689ab":3,"0125678":1,"01249":4,"01367b":1,"01567":1,"0124569":1,"013468":1,"01489ab":4,"0123469":3,"0136789":2,"013789b":1,"012345a":4,"01459":1,"024569":1,"03489ab":9,"0389ab":2,"04567b":2,"0149a":3,"03489b":2,"01379":1,"0124568b":1,"01234a":2,"0134568":1,"0569ab":1,"0136b":1,"01456b":2,"012456":2,"01349":2,"05678a":6,"015678":1,"0123469b":1,"013679":1,"0136789ab":1,"013459":4,"024567":2,"034569b":1,"024568b":4,"0124":1,"024679ab":1,"024678b":2,"013489b":5,"034689b":2,"034568":2,"01469":2,"034678":1,"024789ab":1,"03689a":1,"01469b":1,"0245678b":5,"0345678b":1,"04568ab":1,"03459b":2,"04789a":1,"034789":1,"06789ab":1,"01257":1,"01234":1,"03469b":2,"01245":1,"0134":2,"0678b":1,"02467b":1,"013689b":1,"012467b":1,"01459a":1,"0247b":1,"0136789b":2,"01245678":1,"013789":1,"01378b":1,"02479":1,"01458":1,"0149ab":2,"01349b":12,"014789ab":3,"0178b":2,"012569b":1,"0135679":1,"013569":1,"013":1,"013479b":2,"012346":1,"01379a":1,"01478":1,"0459b":1,"03468ab":1,"012478":1,"0149b":3,"0189a":1,"0134689ab":2,"014a":1,"0149":2,"024678":1,"0478":1,"04678":1,"01458b":2,"0148b":1,"013689ab":1,"014689a":1,"0145b":3,"049ab":1,"01249ab":1,"0348b":1,"0245678":2,"0345":3,"023456":2,"03569":2,"0356":1,"024569b":2,"02456":1,"0256b":1,"02456789b":1,"024567b":5,"0256789b":1,"03678b":1,"039b":2,"02456b":5,"035678":1,"034568b":1,"024568":2,"0234689b":1,"03458":1,"0456b":1,"0368":1,"023469a":1,"02346":1,"02346ab":1,"0346":1,"0456ab":1,"0234ab":1,"02349a":1,"04578b":1,"0489b":1,"03489a":1,"012469b":2,"0468ab":1,"04578":1,"049b":1,"0478a":1,"0145":1,"01456789b":1,"047b":1,"0489ab":1,"03789ab":7,"03457b":3,"03459":2,"0359a":1,"013459b":3,"0134789b":3,"012345":1,"034b":3,"0349":1,"0379ab":1,"01349ab":1,"0379a":1,"013479ab":1,"1479b":1}');
    let statsArr = _.map(stats, (elem, index) => {
      return {
        timbre: index,
        count: elem
      }
    });
    statsArr.sort((left, right) => {
      return right.count - left.count;
    });
    console.log(JSON.stringify(statsArr));

    //let music = 'woodkid-iron';
    //let music = 'woodkid-run-boy-run';
    let music = 'awolnation-sail';
    //let music = 'short';

    this.music = new AudioAnalyzer({
      url: '/sounds/' + music + '.mp3',
      onend: this.onMusicEnd.bind(this),
      loop: true
    });

    this.mySoundExplorer = new SoundExplorer('/sounds/' + music + '.json');

    this.colorsList = [0x2ecc71, 0x3498db, 0x9b59b6, 0x34495e, 0x16a085, 0x27ae60, 0x2980b9, 0x8e44ad, 0xf1c40f, 0xe67e22, 0xe74c3c, 0xecf0f1, 0x95a5a6, 0xf39c12, 0xd35400, 0xc0392b, 0xbdc3c7, 0x7f8c8d];

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
    })

    this.onNewEvent(setts.syncEvent, (elem) => {
      this.pitcheDetected(this.current.pitche, this.current.segment);
      this.timbreDetected(this.current.timbre, this.current.segment);
    });

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

  pitcheDetected(pitche, segment) {
    //console.log('- ' + pitche);
    let options = this.am.getBoomOptions(pitche, segment.duration);
    options.dist = Tools.map(this.current.amplitude, 0, setts.amplitudeMap, 0, this.diagonal/2);
    options.size = Math.pow( Tools.map(segment.loudness_max, -60, 0, 1, 1.8), 10);
    this.am.boom(options);
  }

  timbreDetected(timbre, segment) {
    //console.log('# ' + timbre);
    if (this.stats[timbre] == undefined) {
      this.stats[timbre] = 0;
    }
    this.stats[timbre]++;
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
