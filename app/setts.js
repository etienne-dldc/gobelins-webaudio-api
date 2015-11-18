import Dat from 'dat-gui';

var setts = {
  nbrOfBars: 10,
  barsMargin: 0.2
};

var gui = new Dat.GUI();
gui.add(setts, 'nbrOfBars', 1, 500);
gui.add(setts, 'barsMargin', 0, 1);

export default setts;
