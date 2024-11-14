export default class WorldUtils {

  locraw = {server: null, gametype: null, mode: null, map: null};

  constructor() {
    
    let worldLoadTime = Date.now();
    let seenLocraw = false;
    
    register("worldLoad", () => {
    
      worldLoadTime = Date.now();
      seenLocraw = false;
    
      let ticks = 0;
      let tpsReg = register("packetReceived", () => {
        if (ticks > 4) {
          if (!seenLocraw) {
            ChatLib.command("locraw");
          }
          tpsReg.unregister();
          return;
        }
        ticks++;
      }).setFilteredClass(net.minecraft.network.play.server.S32PacketConfirmTransaction);
    
    })
    
    register("chat", (event) => {
        
      const message = ChatLib.getChatMessage(event);
      
      if (match = message.match(/{"server":"(.+)","gametype":"(.+)","mode":"(.+)","map":"(.+)"}/)) {
        this.locraw = {server: match[1], gametype: match[2], mode: match[3], map: match[4]};
        if (!seenLocraw) cancel(event);
        seenLocraw = true;
      }
      else if (match = message.match(/{"server":"(.+)","gametype":"(.+)","lobbyname":"(.+)"}/)) {
        this.locraw = {server: match[1], gametype: match[2], mode: match[3], map: null};
        if (!seenLocraw) cancel(event);
        seenLocraw = true;
      }
      else if (match = message.match(/{"server":"(.+)"}/)) {
        this.locraw = {server: match[1], gametype: null, mode: null, map: null};
        if (!seenLocraw) cancel(event);
        seenLocraw = true;
      }
    
      this._locrawRegs.forEach(reg => {
        reg();
      })
    
    })

  }

  _locrawRegs = [];

  registerLocraw(cb) {
    this._locrawRegs.push(cb);
  }

  /**
   * Registers or unregisters a register depending on the condition on locraw message received.
   *
   * @param {Function} check - The boolean function that represents whether the register should be registered or not.
   * @param {Function} reg - The register that is registered or unregistered.
   */
  whenLocraw(check, reg) {
    this.registerLocraw(() => {
      let bool = check();
      if (bool) reg.register();
      if (!bool) reg.unregister();
    });
  }

  playSound(sound, volume, pitch) {
    World.playSound(sound, volume, pitch);
  }

  printLocraw() {
    print(JSON.stringify(this.locraw));
  }
}