import { createFeature } from "../config.js";
import axios from "axios";

createFeature((data, settings, RegUtils, WorldUtils, MathUtils, RenderUtils, ItemUtils, SBUtils) => {

  PopupEvents.init(settings);

  const sbStart = 1560275700000;
  const yearMs = 446400000;
  const spiderStart = 1727505300;

  const getCurrentYear = () => {
    return (Date.now() - sbStart) / yearMs + 1;
  }

  const timeUntilNextYear = (Math.floor(getCurrentYear())+1 - getCurrentYear()) * yearMs;

  const time = (num) => {
    if (num < 0) {
      let timeUntilNextNextYear = (Math.floor(getCurrentYear())+1 - getCurrentYear())+1 * yearMs;
      return timeUntilNextNextYear - (num * -1 + timeUntilNextYear);
    }
    return num;
  }

  const timeUntilNextHour = () => {
    const nextHour = Math.floor(Date.now()/3600000)+1;
    return nextHour*3600000 - Date.now();
  }

  const getAcceptName = () => {
    return PopupEvents.getAcceptName();
  }

  Client.scheduleTask(time(timeUntilNextYear - 2*60*60*1000 - 40*60*1000)/50, () => { // jerrys workshop
    PopupEvents.showToast("&9Jerry's Workshop Attack Now", `&a[${getAcceptName()}] to warp to jerry's island`, 10000, 500, "warp jerry");
  });

  Client.scheduleTask(time(timeUntilNextYear - 42*60*60*1000 - 35*60*1000)/50, () => { // spooky festival
    PopupEvents.showToast("&6Spooky Festival Soon", "&c5 minutes remaining", 10000, 500);
  });

  Client.scheduleTask(timeUntilNextYear/50, () => { // hoppity
    PopupEvents.showToast("&6Hoppity's Hunt Started", `&a[${getAcceptName()}] to warp to nucleus`, 10000, 500, "warp cn");
  });

  Client.scheduleTask(timeUntilNextYear/50, () => { // dyes
    PopupEvents.showToast("&5Vinent's Masterpiece Dyes Changed", `&a[${getAcceptName()}] to warp to hub`, 10000, 500, "warp hub");
  });

  Client.scheduleTask(time(timeUntilNextYear - 3600 * 1000)/50, () => { // new year
    PopupEvents.showToast("&dNew Year's Celebration Started", `&a[${getAcceptName()}] to claim your cake`, 10000, 500, "openbaker");
  });

  Client.scheduleTask((timeUntilNextHour() + 10*60*1000)/50, () => { // jacobs contest
    register("step", () => {
      axios.get("https://api.elitebot.dev/contests/at/now", {
        headers: {
          "User-Agent": "Mozilla/5.0 (X11; Ubuntu; Linux x86_64; rv:126.0) Gecko/20100101 Firefox/126.0"
        }
      }).then(response => {
        let contest = response.data.contests[(Math.floor(Date.now()/3600000)*3600000 + 900000) / 1000];
        if (!contest) return;
        PopupEvents.showToast("&eJacob's Contest in 5 minutes", `&9${contest.join(", ")}\n&a[${getAcceptName()}] to warp to garden`, 10000, 500, "warp garden");
      }).catch(e => ChatLib.chat("&c[CIM] Error fetching contest data"));
    }).setDelay(60 * 60 * 1000);    
  });

  Client.scheduleTask((timeUntilNextHour() + 32*60*1000)/50, () => { // spider den rain
    register("step", () => {
      PopupEvents.showToast("&4Spider's Den rain in 3 minutes", `&a[${getAcceptName()}] to warp to spider's den`, 10000, 500, "warp spider");
    }).setDelay(60 * 60 * 1000);    
  });

  Client.scheduleTask(((10800 - ((Date.now()/1000 - spiderStart) % 10800)) - 20 - 3)*1000/50, () => { // spider den thunderstorn
    register("step", () => {
      PopupEvents.showToast("&9Spider's Den thunderstorm in 3 minutes", `&a[${getAcceptName()}] to warp to spider's den`, 10000, 500, "warp spider");
    }).setDelay(3 * 60 * 60 * 1000);
  })

  Client.scheduleTask((timeUntilNextHour() + 52*60*1000)/50, () => { // dark auction
    register("step", () => {
      PopupEvents.showToast("&5Dark Auction in 3 minutes", `&a[${getAcceptName()}] to warp to the dark auction`, 10000, 500, "warp da");
    }).setDelay(60 * 60 * 1000);    
  });

  register("command", (...args) => {
    PopupEvents.showToast(args[0], args[1], args[2], args[3]);
  }).setName("cimpopup");

})

export class PopupEvents {

  static queue = [];

  static init = (settings) => {

    this.acceptKeybind = new KeyBind("Activate Popup", 21, "cim");
    this.acceptKeybind.registerKeyDown(() => {
      if (!PopupEvents.queue[0] || !PopupEvents.queue[0].command) return;
      ChatLib.command(PopupEvents.queue[0].command);
    })

    const toastImage = Image.fromAsset("toast.png");
    const chainImage = Image.fromAsset("chain.png");

    register("renderOverlay", () => {

      if (!settings.popupDisplay) return;

      if (PopupEvents.queue.length == 0) return;
      const toast = PopupEvents.queue[0];

      const elapsed = Date.now() - toast.now;
      if (elapsed > toast.duration) {
        PopupEvents.queue = PopupEvents.queue.filter(t => t !== toast);
        return;
      }

      if (!toast.now) {
        toast.now = Date.now();
        World.playSound("random.orb", 1, 1);
      }

      const w = toast.width;
      const h = 30;
      const x = Renderer.screen.getWidth()/2 - w/2;
      const y = PopupEvents._calculateY(toast, h*2);

      let chainH = 11;
      for (let i = -1; y + i*chainH < y+h/2; i++) {
        chainImage.draw(x, y + i*chainH, 16, 16);
        chainImage.draw(x+w-16, y + i*chainH, 16, 16);
      }
      toastImage.draw(x, y+h/2, w, h);

      const textIndex = Math.min(elapsed / (toast.duration/2), toast.texts.length-0.001);
      let text = toast.texts[Math.floor(textIndex)];
      if (!text) return;
      text.setColor(Renderer.color(255, 255, 255, (Math.sin((textIndex % 1)*Math.PI))*750));
      if (Renderer.getStringWidth(text.getString()) < w) text.draw(x+w/2, y + h/2 + 4 + 6);
      else text.draw(x+w/2, y + h/2 + 4);

    }).setPriority(Priority.LOWEST);

  }

  static _calculateY = (toast, h) => {
    const easeInOut = (t) => {
      return t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2;
    }

    const elapsed = Date.now() - toast.now;

    const fade = toast.duration/toast.fade;
    
    if (elapsed < toast.duration / fade) {
      return -h + easeInOut(elapsed / (toast.duration / fade)) * h;
    } 
    else if (elapsed < toast.duration - toast.fade) {
      return 0;
    } 
    else {
      const remainingTime = toast.duration - elapsed;
      return easeInOut(remainingTime / (toast.duration / fade)) * h - h;
    }
  }

  static showToast = (text, text2, duration, fade, command, width = 158) => {
    let obj = {
      texts: [
        new Text(text)
          .setMaxWidth(width-8)
          .setAlign(DisplayHandler.Align.CENTER),
        new Text(text2)
          .setMaxWidth(width-8)
          .setAlign(DisplayHandler.Align.CENTER)
      ],
      duration,
      fade,
      command,
      width
    };
    PopupEvents.queue.push(obj);
  }

  static getAcceptName = () => {
    return Keyboard.getKeyName(this.acceptKeybind.getKeyCode());
  }

}