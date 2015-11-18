import Dat from 'dat-gui';

var setts = {
  timeOffset: 0
};

var gui = new Dat.GUI();
gui.add(setts, 'timeOffset', -2000, 2000);

export default setts;
