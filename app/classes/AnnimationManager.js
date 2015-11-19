'use strict';
import { Graphics } from 'pixi.js';
import Tools from '../tools';

class AnnimationManager {

  constructor(scene) {
    this.scene = scene;

    this.width = window.innerWidth;
    this.height = window.innerHeight;
    this.center = {
      x: this.width/2,
      y: this.height/2
    }

    this.amplitude = 0;

    this.booms = [];
    this.boomsOptions = {};

    this.removeList = [];

    this.lastBoomPos = {x: this.center.x, y: this.center.y};

    //this.ampCircle();

  }

  update( timeUnit ) {
    this.updateBooms( timeUnit );
    this.clean();
  }

  setAmplitude(amplitude) {
    this.amplitude = amplitude;
  }

  boom(options) {
    let newBoom = {};
    newBoom.color = options.color;
    newBoom.startTime = Date.now();
    newBoom.duration = options.duration;
    newBoom.opacity = 1;
    newBoom.x = this.center.x + (options.dist * Math.cos(options.angle));
    newBoom.y = this.center.y + (options.dist * Math.sin(options.angle));
    newBoom.size = 1;
    newBoom.lineWidth = 2; //Tools.map(options.duration, 2, 0, 0.5, 10);
    newBoom.maxSize = options.size;
    let remove = (function remove(elem) {
      this.removeList.push({
        elem: elem,
        group: 'booms'
      });
    }).bind(this);
    newBoom.tween = TweenMax.to(newBoom, options.duration, {opacity:0, size: options.size, onComplete: remove, onCompleteParams:[newBoom]});
    newBoom.graph = new Graphics();

    this.scene.addChild( newBoom.graph );
    this.booms.push( newBoom );
  }

  updateBooms( timeUnit ) {
    for (var i = 0; i < this.booms.length; i++) {
      let boom = this.booms[i];
      boom.graph.clear();
      boom.graph.beginFill( boom.color, boom.opacity );
      boom.graph.drawCircle(boom.x, boom.y, boom.size);
      boom.graph.endFill();
      boom.graph.lineStyle(boom.lineWidth, boom.color, boom.opacity);
      boom.graph.moveTo(this.lastBoomPos.x, this.lastBoomPos.y);
      this.lastBoomPos = { x: boom.x, y: boom.y };
      boom.graph.lineTo(boom.x, boom.y);
    }
  }

  getBoomOptions(pitche, duration) {
    if (this.boomsOptions[pitche] === undefined) {
      this.boomsOptions[pitche] = {
        size: 10,
        angle: Math.random() * 2 * Math.PI,
        dist: 100,
        color: Tools.hsl2hex(Tools.randomInt(0, 360), 100, 60),
        duration: duration * 2
      }
    }
    return this.boomsOptions[pitche];
  }

  clean() {
    for (var i = 0; i < this.removeList.length; i++) {
      let removeElem = this.removeList[i];
      let result = this.scene.removeChild(removeElem.elem.graph);
      let index = this[removeElem.group].indexOf(removeElem.elem);
      this[removeElem.group].slice(index, 1);
    }
    this.removeList = [];
  }


}

export default AnnimationManager;
