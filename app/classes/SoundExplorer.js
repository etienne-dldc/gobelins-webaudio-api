export default class SoundExplorer {

  constructor(dataFile) {
    this.file = dataFile;

    this.data = {};

    this.loadFile();
  }

  loadFile() {
    let request = new XMLHttpRequest();
    request.open('GET', this.file, true);
    request.onload = () => {
      this.data = request.response;
    }
    request.send();
  }

  



};
