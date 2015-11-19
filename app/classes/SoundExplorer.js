import clone from 'clone';

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
    request.responseType = 'json';
    request.onload = () => {
      this.data = request.response;
      this.dataLoaded = true;
    }
    request.send();
  }

  getData() {
    if (this.dataLoaded) {
      return this.data;
    } else {
      return {
        meta: {
          analyzer_version: null,
          platform: null,
          detailed_status: null,
          filename: null,
          artist: null,
          album: null,
          title: null,
          genre: null,
          bitrate: null,
          sample_rate: null,
          seconds: null,
          status_code: null,
          timestamp: null,
          analysis_time: null
        },
        track: {
          num_samples: null,
          duration: null,
          sample_md5: null,
          decoder: null,
          decoder_version: null,
          offset_seconds: null,
          window_seconds: null,
          analysis_sample_rate: null,
          analysis_channels: null,
          end_of_fade_in: null,
          start_of_fade_out: null,
          loudness: null,
          tempo: null,
          tempo_confidence: null,
          time_signature: null,
          time_signature_confidence: null,
          key: null,
          key_confidence: null,
          mode: null,
          mode_confidence: null,
          codestring: null,
          code_version: null,
          echoprintstring: null,
          echoprint_version: null,
          synchstring: null,
          synch_version: null,
          rhythmstring: null,
          rhythm_version: null
        },
        bars: [],
        beats: [],
        tatums: [],
        sections: [],
        segments: []
      }

    }
  }

  dataAtPos(pos) {
    let result = {
      bar: this.getBarAtPos(pos),
      beat: this.getBeatAtPos(pos),
      tatum: this.getTatumAtPos(pos),
      section: this.getSectionAtPos(pos),
      segment: this.getSegmentAtPos(pos)
    };
    return result;
  }

  parseDataList (listName, pos) {
    let data = this.getData();
    //console.log(data);
    if (data[listName] == undefined) {
      return null;
    }
    let result = [];
    for (var i = 0; i < data[listName].length; i++) {
      let elem = data[listName][i];
      if (elem.start <= pos && (elem.start + elem.duration) > pos) {
        var newElem = clone(elem);
        newElem.time = pos - elem.start;
        newElem.id = i;
        //result.push(newElem);
        result = newElem;
        break;
      }
    }
    if (result.length == 0) { return null; }
    //if (result.length == 1) { return result[0]; }
    return result;
  }

  getBarAtPos(pos) {
    return this.parseDataList('bars', pos);
  }

  getBeatAtPos(pos) {
    return this.parseDataList('beats', pos);
  }

  getTatumAtPos(pos) {
    return this.parseDataList('tatums', pos);
  }

  getSectionAtPos(pos) {
    return this.parseDataList('sections', pos);
  }

  getSegmentAtPos(pos) {
    return this.parseDataList('segments', pos);
  }





};
