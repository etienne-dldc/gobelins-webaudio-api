export default class SoundExplorer {

  constructor(dataFile) {
    this.file = dataFile;

    this.data = {};
    this.dataLoaded = false;

    this.loadFile();
  }

  loadFile() {
    let request = new XMLHttpRequest();
    request.open('GET', this.file, true);
    request.onload = () => {
      this.data = request.response;
      this.dataLoaded = true;
    }
    request.send();
  }





};
