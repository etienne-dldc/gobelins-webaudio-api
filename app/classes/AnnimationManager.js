'use strict';
import { Graphics, Point } from 'pixi.js';
import Tools from '../tools';
import setts from '../setts';

/**
* Gestion des annimations
* Pricipalement les "booms"
**/

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

    this.amContainer = new Graphics();
    this.amContainer.x = this.center.x;
    this.amContainer.y = this.center.y;
    this.scene.addChild(this.amContainer);

    // Rotation du Graphics amContainer
    this.globalRotation = 0.1;

    // Liste des éléments à supprimer
    this.removeList = [];

    // Position du dernier boom pour les lignes
    this.lastBoomPos = {x: 0, y: 0};

  }

  update( timeUnit ) {
    this.updateGlobalRotation( timeUnit );
    this.updateBooms( timeUnit );
    // Remove elems in this.removeList
    this.clean();
  }

  setAmplitude(amplitude) {
    this.amplitude = amplitude;
  }

  boom(options) {
    let newBoom = {};
    let hue = Tools.map(options.type + Math.random(), 2, 14, 0, 360);
    newBoom.color = options.color || Tools.hsl2hex( hue, 100, 60);
    newBoom.startTime = Date.now();
    newBoom.duration = options.duration;//Math.floor(options.duration * setts.shapeTTL * 10) / 10;
    newBoom.opacity = options.opacity || setts.shapeOpacity;
    newBoom.type = options.type;
    newBoom.x = (options.dist * Math.cos(options.angle));
    newBoom.y = (options.dist * Math.sin(options.angle));
    newBoom.size = 1;
    newBoom.lines = (options.lines == undefined) ? true : options.lines;
    newBoom.lineWidth = 2; //Tools.map(options.duration, 2, 0, 0.5, 10);
    newBoom.maxSize = options.size;
    newBoom.rotation = options.rotation;
    newBoom.rotationEnd = options.rotationEnd;
    // onComplete -> add to removeList
    let remove = (function remove(elem) {
      this.removeList.push({
        elem: elem,
        group: 'booms'
      });
    }).bind(this);
    // TweenMax
    newBoom.tween = TweenMax.to(
      newBoom,
      newBoom.duration,
      {
        opacity:0,
        size: options.size,
        rotation: newBoom.rotationEnd,
        onComplete: remove, onCompleteParams:[newBoom]
      }
    );
    // Create graphics
    newBoom.graph = new Graphics();

    this.amContainer.addChild( newBoom.graph );
    this.booms.push( newBoom );
  }

  getBoomOptions(pitche, duration, pitcheDetails) {
    // If options for pitche does not exist -> create
    if (this.boomsOptions[pitche] === undefined) {
      // Find angle
        let pitchesArr = [];
        for (var i = 0; i < pitcheDetails.length; i++) {
          pitchesArr.push({
            value: pitcheDetails[i],
            index: i
          });
        }
        pitchesArr.sort( (left, right) => { return (right.value - left.value) } );
        let angle = 0;
        for (var i = 0; i < 4; i++) {
          let anglePart = (Math.PI * 2) * Math.pow(1/12, i);
          angle += pitchesArr[i].index * anglePart;
        }
      const rotationMax = Math.PI/2;
      const rotation = Tools.random(0, Math.PI*2);
      this.boomsOptions[pitche] = {
        size: 10,
        angle: angle,
        dist: 100,
        type: 0,
        color: false,
        rotation: rotation,
        rotationEnd: rotation + (rotationMax/2) - (Math.random() * rotationMax),
        duration: duration * 2
      }
    }
    // rerturn options for pitche
    return this.boomsOptions[pitche];
  }

  setGlobalRotation(value) {
    this.globalRotation = Math.PI * 2 * (value/360); // deg to rad
  }

  updateGlobalRotation( timeUnit ) {
    this.amContainer.rotation += (this.globalRotation * timeUnit);
  }

  updateBooms( timeUnit ) {
    for (var i = 0; i < this.booms.length; i++) {
      let boom = this.booms[i];
      // Clear
      boom.graph.clear();
      // Line
      if (boom.lines) {
        if (setts.displayLines) {
          boom.graph.lineStyle(boom.lineWidth * setts.lineWidth, boom.color, boom.opacity);
          boom.graph.moveTo(this.lastBoomPos.x, this.lastBoomPos.y);
          this.lastBoomPos = { x: boom.x, y: boom.y };
          boom.graph.lineTo(boom.x, boom.y);
        }
        // Line from center
        if (setts.displayLinesFromCenter) {
          boom.graph.lineStyle(boom.lineWidth * setts.lineWidth, boom.color, boom.opacity);
          boom.graph.moveTo(0, 0);
          boom.graph.lineTo(boom.x, boom.y);
        }
      }
      // Shape
      boom.graph.beginFill( boom.color, boom.opacity );
      boom.graph.lineStyle(0, 0xffffff, 0);
      if (boom.type <= 2) { // Circle
        boom.graph.drawCircle(boom.x, boom.y, boom.size);
      } else { // Polygon
          let points = [];
          let angle = boom.rotation;
          for (var j = 0; j < boom.type; j++) {
            let x = boom.x + boom.size * Math.cos(angle);
            let y = boom.y + boom.size * Math.sin(angle);
            points.push( new Point(x, y) );
            angle += (Math.PI*2) / boom.type
          }
          boom.graph.drawPolygon(points);
      }
      boom.graph.endFill();
    }
  }


  clean() {
    // Remove elems in removeList
    for (var i = 0; i < this.removeList.length; i++) {
      let removeElem = this.removeList[i];
      let result = this.amContainer.removeChild(removeElem.elem.graph);
      let index = this[removeElem.group].indexOf(removeElem.elem);
      this[removeElem.group].slice(index, 1);
    }
    this.removeList = [];
  }


}

export default AnnimationManager;
