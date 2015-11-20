import Dat from 'dat-gui';

/**
* This is the dat-gui object
**/

var setts = {
  music: 'woodkid-run-boy-run',
  timeOffset: 0,
  amplitudeMap: 200,
  shapeOpacity: 0.5,
  shapeTTL: 2,
  pitcheFilter: 0.5,
  displayLines: true,
  displayLinesFromCenter: true,
  lineWidth: 0.8,
  syncEvent: 'segment',
  customSyncFrequency: 30,
  globalRotation: 0.5 // deg / ms
};

let saveData = {
  "preset": "Default",
  "remembered": {
    "Default": {
      "0": {
        "timeOffset": 0,
        "amplitudeMap": 200,
        "shapeOpacity": 1,
        "shapeTTL": 2,
        "pitcheFilter": 0.5,
        "displayLines": true,
        "displayLinesFromCenter": true,
        "lineWidth": 0.8,
        "syncEvent": 'segment',
        "customSyncFrequency": 30,
        "globalRotation": 0.5
      }
    },
    "Cloud": {
      "0": {
        "timeOffset": 0,
        "amplitudeMap": 200,
        "shapeOpacity": 0.1,
        "shapeTTL": 2,
        "pitcheFilter": 0.5,
        "displayLines": false,
        "displayLinesFromCenter": false,
        "lineWidth": 0.8,
        "syncEvent": 'custom',
        "customSyncFrequency": 60,
        "globalRotation": 0.5
      }
    }
  },
  "closed": false,
  "folders": {}
}

let gui = new Dat.GUI({ load: saveData });
gui.add(setts, 'music', ['woodkid-iron', 'woodkid-run-boy-run', 'awolnation-sail', 'hello', 'hanszimmer-interstellar', 'beethoven-lettre-a-elise']);
gui.add(setts, 'timeOffset', -2000, 2000);
gui.add(setts, 'amplitudeMap', 1, 255);
gui.add(setts, 'shapeOpacity', 0, 1);
gui.add(setts, 'shapeTTL', 0.1, 10);
gui.add(setts, 'pitcheFilter', 0, 0.9);
gui.add(setts, 'displayLines');
gui.add(setts, 'displayLinesFromCenter');
gui.add(setts, 'lineWidth', 0.5, 10);
gui.add(setts, 'syncEvent', ['tatum', 'beat', 'segment', 'bar','custom']);
gui.add(setts, 'customSyncFrequency', 1, 60);
gui.add(setts, 'globalRotation', -1, 1);

gui.remember(setts);

export default setts;
