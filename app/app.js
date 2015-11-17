import Dat from 'dat-gui';
import Scene from './scene/scene';
import { Graphics } from 'pixi.js';
import NumberUtils from './utils/number-utils';

let angle = 0;

/**
 * SETUP Audio
 */
var audioCtx = new AudioContext();
var analyser = audioCtx.createAnalyser();
var frequencyData = new Uint8Array(analyser.frequencyBinCount);
var audioBuffer;
var audioSource;
function loadSound() {
  var request = new XMLHttpRequest();
  request.open('GET', '/sounds/woodkid-iron.mp3', true);
  request.responseType = 'arraybuffer';
  // Decode asynchronously
  request.onload = function() {
    audioCtx.decodeAudioData(request.response, function(buffer) {
      // success callback
      audioBuffer = buffer;
      // Create sound from buffer
      audioSource = audioCtx.createBufferSource();
      audioSource.buffer = audioBuffer;
      // connect the audio source to context's output
      audioSource.connect( audioCtx.destination )
      // play sound
      audioSource.start();
    }, function(){
      // error callback
    });
  }
  request.send();
}


class App {

  constructor() {

    this.DELTA_TIME = 0;
    this.LAST_TIME = Date.now();

    this.width = window.innerWidth;
    this.height = window.innerHeight;

    this.scene = new Scene();

    let root = document.body.querySelector('.app')
    root.appendChild( this.scene.renderer.view );

    this.ball = new Graphics();
    this.ball.beginFill( 0xFF0000 );
    this.ball.drawCircle( 0, 0, 50 );
    this.ball.y = window.innerHeight / 2;
    this.scene.addChild( this.ball );

    this.addListeners();

    loadSound();

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

    angle += 0.05;

    this.ball.x = ( window.innerWidth / 2 ) + Math.sin( angle ) * 100;

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
