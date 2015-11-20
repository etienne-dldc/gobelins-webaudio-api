import { Graphics } from 'pixi.js';
import _ from 'lodash';
import setts from './setts';
import Scene from './classes/Scene';
import AudioAnalyzer from './classes/AudioAnalyzer';
import SoundExplorer from './classes/SoundExplorer';
import AnnimationManager from './classes/AnnimationManager';
import Tools from './tools';
import clone from 'clone';

class App {

  constructor() {

    //const music = 'woodkid-iron';
    //const music = 'woodkid-run-boy-run';
    const music = 'awolnation-sail';
    //const music = 'hello';

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

    // A 60 fps timeUnit vaut 1.
    // En multipliant les vitesse pas timeUnit on s'assure que
    // les veleurs sont en px/milliseconde et radian/ms quelque soit le FPS
    let timeUnit = this.DELTA_TIME / this.fps;
    let currentTime = this.music.pos() + (setts.timeOffset/1000);

    this.current.amplitude = this.music.getAmplitude();
    this.am.setAmplitude(this.current.amplitude);

    // Update currentData avec les bonne données EchoNest
    // (recupère 'segment', 'section', 'bar', 'beat', 'tatum' à la position courante)
    this.currentData = this.mySoundExplorer.dataAtPos( currentTime );

    // segment
    this.onNewEvent('segment', (elem) => {
      this.currentSegment = elem;
      let pitche = this.findElemAuto(elem.pitches, 0.8);
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
    });

    // bar
    this.onNewEvent('bar', (elem) => {
      if (setts.syncEvent == 'bar') {
        this.addBoom();
      }
    });

    // beat
    this.onNewEvent('beat', (elem) => {
      if (setts.syncEvent == 'beat') {
        this.addBoom();
      }
      this.am.boom({
        size: 500,
        angle: 0,
        dist: 0,
        type: 0,
        color: Tools.hsl2hex(Tools.randomInt(0, 360), 20, 50),
        rotation: 0,
        rotationEnd: 0,
        duration: 3,
        opacity: 0.02,
        lines: false
      });
    });

    // tatum
    this.onNewEvent('tatum', (elem) => {
      if (setts.syncEvent == 'tatum') {
        this.addBoom();
      }
    });

    // section
    this.onNewEvent('section', (elem) => {
      //console.log(this.current.section.id);
    });

    if (setts.syncEvent == 'custom') {
      let timeDiff = Date.now() - this.lastCustomSyncRender;
      if (timeDiff > 1000 / setts.customSyncFrequency) {
        this.lastCustomSyncRender = Date.now();
        this.addBoom();
      }
    }

    if (this.current.section.id !== null) {
      this.am.setGlobalRotation( setts.globalRotation * Math.pow(-1, this.current.section.id ) );
    } else {
      this.am.setGlobalRotation( setts.globalRotation );
    }

    // Update the AnnimationManager
    this.am.update( timeUnit );

    this.scene.render();

  }

  /**
   * Vérifie que `eventType` exist dans currentData
   * et que ce n'est pas le meme depuis le dernier rendu
   */
  onNewEvent(eventType, callback) {
    if (this.currentData[eventType] !== null) {
      let elem = this.currentData[eventType];
      if (this.current[eventType].id !== elem.id) {
        this.current[eventType] = elem;
        callback(elem);
      }
    }
  }

  /**
   * Recupere les options liées au pitche (si elles n'existe pas elle sont crées)
   * et ajoute un élément 'boom' à l'AnnimationManager
   */
  addBoom() {
    let cu = this.current;
    let options = this.am.getBoomOptions(cu.pitche, cu.segment.duration);
    options.dist = Tools.map(cu.amplitude, 0, setts.amplitudeMap, 0, this.diagonal/2);
    options.type = cu.timbre.length;
    options.size = Math.pow( Tools.map(cu.segment.loudness_max, -60, 0, 1, 1.8), 10);
    this.am.boom(options);
  }

  /**
   * Cherche les différentes valeurs de @pitche dans @list
   */
  elemHas(pitche, list) {
    if (!_.isArray(list)) {
      list = [list];
    }
    let pitcheArr = pitche.split('');
    for (var i = 0; i < list.length; i++) {
      let searchArr = list[i].split('');
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

  /**
   * Vérifie si @pitche est égal à un des éléments de @search
   */
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

  /**
   * Retourne les valeurs de @list qui sont supérieurs à :
   * (moyenne de list) + @averageUp * (la différence entre la valeur max et la moyenne)
   * @averageUp permet faire augmenter le moyenne pour revoyer moins de résultats
   */
  findElemAuto(list, averageUp = 0) {
    let hex = [0,1,2,3,4,5,6,7,8,9,'a','b','c','d','e','f'];
    let result = [];
    let average = 0;
    let max = 0;
    for (var i = 0; i < list.length; i++) {
      average += list[i];
      if (list[i] > list[max]) {
        max = i;
      }
    }
    average = average/list.length;
    average += (list[max] - average) * averageUp;
    for (var i = 0; i < list.length; i++) {
      if (list[i] > average ) {
        result.push(hex[i]);
      }
    }
    return result.join('');
  }

  /**
   * Retourne les éléments de @list qui sont supérieurs à @tolérence
   * @tolerance vaut 0.5 par défault
   */
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
