/**
 * Utility class for handling register-related operations.
 */
export default class RegUtils {

  scheduled = [];
  onTick = [];
  _onHeldItemChangeRegs = [];
  ticks = 0;

  constructor(settings) {

    this.settings = settings;

    {
      register("packetReceived", () => {
        this.ticks++;
        for (let reg of this.onTick) {
          reg();
        }
        for (let task of this.scheduled) {
          if (task.delay < 1) {
            task.func();
            this.scheduled = this.scheduled.filter(t => t !== task);
            continue;
          }
          task.delay--;
        }
      }).setFilteredClass(net.minecraft.network.play.server.S32PacketConfirmTransaction);
    }

    {
      let lastHeldItem = Player?.getHeldItem();
      const checkItem = () => {
        let newItem = Player?.getHeldItem();
        if (!newItem?.equals(lastHeldItem)) {
          this._onHeldItemChangeRegs.forEach(cb => {cb(newItem, Player.getHeldItemIndex())});
        }
        lastHeldItem = newItem;
      }
  
      register("scrolled", checkItem);
      register("packetReceived", checkItem).setFilteredClass(net.minecraft.network.play.server.S2FPacketSetSlot);
      register("dropItem", checkItem);
      register("guiClosed", checkItem);
      Client.settings.getSettings().field_151456_ac.forEach(keyBinding => {
        new KeyBind(keyBinding).registerKeyDown(checkItem);
      });
    }

  }

  getTicks() {
    return this.ticks;
  }

  /**
   * Registers a callback to be executed once during world load.
   *
   * @param {Function} cb - The callback function to be called when the world loads.
   * @description
   * This method registers a listener for the "worldLoad" event and automatically unregisters itself after the first execution.
   */
  onceWorldLoad(cb) {
    let firstLoad = register("worldLoad", () => {
      cb();
      firstLoad.unregister();
    })
  }

  /**
   * Registers a callback to be executed when the player opens the settings GUI.
   *
   * @param {Function} cb - The callback function to be called when the settings GUI is opened.
   */
  onSettingsChange(cb) {
    this.settings.gui.registerClosed(cb);
  }

  whenSettingsChange(condition, regs) {
    regs.forEach(reg => {
      this.onSettingsChange(() => {
        let bool = condition();
        if (bool) reg.register();
        if (!bool) reg.unregister();
      })
    })
  }

  /**
   * Registers a callback to be executed when the GUI loads all items.
   *
   * @param {Function} cb - The callback function to be called when the GUI loads.
   */
  onGuiLoad(cb) {
    register(net.minecraftforge.client.event.GuiScreenEvent.InitGuiEvent.Post, () => {
      this.serverSchedule(1, cb);
    })
  }

  /**
   * Schedules a function to be executed after a specified delay.
   *
   * @param {number} delay - The number of ticks to wait before executing the function.
   * @param {Function} func - The function to be scheduled for execution.
   */
  serverSchedule(delay, func){
    this.scheduled.push({delay: delay, func: func});
  }

  /**
   * Registers a callback to be executed on every server tick.
   *
   * @param {Function} cb - The callback function to be called on each server tick.
   */
  onServerTick(cb) {
    this.onTick.push(cb);
  }

  onChatPacketReceived(cb, regex) {
    let reg = register("packetReceived", (packet, event) => {
      if (packet.func_148916_d()) return;
      let message = new Message(packet.func_148915_c()).getFormattedText();
      if (regex && !message.match(regex)) return;
      cb(message, event);
    }).setFilteredClass(net.minecraft.network.play.server.S02PacketChat);
    return reg;
  }

  onDungeonStart(cb) {
    let reg = this.onChatPacketReceived(() => {
      this.serverSchedule(25, cb);
      reg.unregister();
    }, /§r§r§r§aStarting in 1 second.§r/)
  }

  onHeldItemChange(cb) {
    this._onHeldItemChangeRegs.push(cb);
  }

  onInventoryOpen(cb) {
    register(net.minecraftforge.client.event.GuiScreenEvent.InitGuiEvent.Post, () => {
      if (Client.currentGui?.getClassName() == "GuiInventory") {
        cb();
      }
    })
  }

  onContainerNameOpen(check, cb) {
    register(net.minecraftforge.client.event.GuiScreenEvent.InitGuiEvent.Post, () => {
      let name = Client.currentGui?.getClassName();
      if (!check(name)) return;
      cb(name);
    })
  }

  onGuiNameLoad(cb) {
    register(net.minecraftforge.client.event.GuiScreenEvent.InitGuiEvent.Post, () => {
      cb();
    })
  }

  onGuiClose(cb) {
    register("guiClosed", cb);
  }

  whenInventoryOpen(regs) {
    regs.forEach(reg => {
      reg.unregister();
      this.onInventoryOpen(() => {
        reg.register();
      })
      this.onGuiClose(() => {
        reg.unregister();
      })
    })
  }

  whenContainerNameOpen(check, regs) {
    regs.forEach(reg => {
      reg.unregister();
      this.onContainerNameOpen(check, () => {
        reg.register();
      })
      this.onGuiClose(() => {
        reg.unregister();
      })
    })
  }

};