import axios from "axios";

/**
 * Utilities relating to obtaining and requesting data.
 */
export class DataUtils {

  static _onLoaded = [];

  static getRepo() {
    const sources = JSON.parse(FileLib.read("cim", "data_sources.json")).filter(s => !s.disabled);
    let index = 0;
    let length = sources.length;
    let finished = false;

    const checkFinished = () => {
      index++;
      let lineLength = Math.floor(15 * Renderer.screen.getScale());
      let charsDone = lineLength * (index/length);
      try {
        ChatLib.deleteChat(23424);
        ChatLib.chat(new Message(`§7[CIM] §aDownloading Repo${(".").repeat(index % 5)}\n§a${Math.floor(index/length*100*100)/100}% [${("=").repeat(charsDone) + (" ").repeat(lineLength - charsDone)}]`).setChatLineId(23424));
      }
      catch (e) {};
      if (index >= length) {
        finished = true;
        this._onLoaded.forEach(cb => {
          cb(data);
        });
        for (let key in data) {
          FileLib.write("cim", `data/${key}.json`, JSON.stringify(data[key]));
        }
      }

    }

    let data = {};

    for (let source of sources) {
      if (finished) return;
      let name = source.name;
      axios.get(source.source, {
        headers: {
          "User-Agent": "Mozilla/5.0 (X11; Ubuntu; Linux x86_64; rv:126.0) Gecko/20100101 Firefox/126.0"
        }
      })
      .then((res) => {
        data[name] = res.data;
        checkFinished();
      })
      .catch(e => {
        ChatLib.chat("§cError requesting " + name + ": " + JSON.stringify(e));
        checkFinished();
      })
    }

  }

  /**
    * Requests every source from "data_sources.json" and loads it into this object. Use DataUtils.onLoaded() to trigger a cb.
    */
  static getData() {
    const sources = JSON.parse(FileLib.read("cim", "data_sources.json"));
    let data = {};
    
    for (let i = 0; i < sources.length; i++) {

      let source = sources[i];
      let fileContent = FileLib.read("cim", `data/${source.name}.json`);
      
      if (!fileContent) {
        DataUtils.getRepo();
        ChatLib.chat("§7[CIM] §cFound undownloaded data. Updating from repo");
        return;
      }
      
      fileContent = JSON.parse(fileContent);
      data[source.name] = fileContent;

      if (i == sources.length-1) {
        this._onLoaded.forEach((cb, index) => {
          cb(data);
          ChatLib.deleteChat(23424);
          ChatLib.chat(new Message(`§7[CIM] §aLoading ${(index+1)/this._onLoaded.length * 100}%`).setChatLineId(23424));
        });
      }

    }
  }

  /**
   * Runs cb when this.getData() has finished successfully.
   * @param {Function} cb - Function to be ran
   */
  static onLoaded(cb) {
    if (!this._onLoaded) this._onLoaded = [];
    this._onLoaded.push(cb);
  }
}