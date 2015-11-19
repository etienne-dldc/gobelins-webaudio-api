import Dat from 'dat-gui';

var setts = {
  timeOffset: -100,
  amplitudeMap: 200,
  syncEvent: 'beat'
};

var gui = new Dat.GUI();
gui.add(setts, 'timeOffset', -2000, 2000);
gui.add(setts, 'amplitudeMap', 1, 255);
gui.add(setts, 'syncEvent', ['tatum', 'beat', 'segment']);

export default setts;
