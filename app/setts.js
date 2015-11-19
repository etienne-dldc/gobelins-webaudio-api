import Dat from 'dat-gui';

/**
* This is the dat-gui object
**/

var setts = {
  timeOffset: -100,
  amplitudeMap: 200,
  shapeOpacity: 0.5,
  shapeTTL: 2,
  displayLines: true,
  lineWidth: 3,
  syncEvent: 'custom',
  customSyncFrequency: 3,
  globalRotation: 0.5 // deg / ms
};

var gui = new Dat.GUI();
gui.add(setts, 'timeOffset', -2000, 2000);
gui.add(setts, 'amplitudeMap', 1, 255);
gui.add(setts, 'shapeOpacity', 0, 1);
gui.add(setts, 'shapeTTL', 0.1, 10);
gui.add(setts, 'displayLines');
gui.add(setts, 'lineWidth', 0.5, 10);
gui.add(setts, 'syncEvent', ['tatum', 'beat', 'segment','custom']);
gui.add(setts, 'customSyncFrequency', 1, 10);
gui.add(setts, 'globalRotation', -1, 1);

export default setts;
