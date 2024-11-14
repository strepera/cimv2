import { createFeature } from "../config.js";
import { PersistentObject } from "../utils/PersistentObject";
import { PopupEvents } from "./PopupEvents.js";

const timers = new PersistentObject("effectTimers", {
  cakes: [
    {
      msg: "✦ Speed",
      color: "f",
      last: 0
    },
    {
      msg: "⫽ Ferocity",
      color: "c",
      last: 0
    },
    {
      msg: "❁ Strength",
      color: "c",
      last: 0
    },
    {
      msg: "☘ Farming Fortune",
      color: "6",
      last: 0
    },
    {
      msg: "✯ Magic Find",
      color: "b",
      last: 0
    },
    {
      msg: "❂ True Defense",
      color: "f",
      last: 0
    },
    {
      msg: "☘ Foraging Fortune",
      color: "6",
      last: 0
    },
    {
      msg: "❤ Health",
      color: "c",
      last: 0
    },
    {
      msg: "♣ Pet Luck",
      color: "d",
      last: 0
    },
    {
      msg: "α Sea Creature Chance",
      color: "3",
      last: 0
    },
    {
      msg: "✎ Intelligence",
      color: "b",
      last: 0
    },
    {
      msg: "☘ Mining Fortune",
      color: "6",
      last: 0
    },
    {
      msg: "♨ Vitality",
      color: "4",
      last: 0
    },
    {
      msg: "❈ Defense",
      color: "a",
      last: 0
    }
  ],
  forge: [

  ]
})

createFeature((data, settings, RegUtils, WorldUtils, MathUtils, RenderUtils, ItemUtils, SBUtils) => {

  const inventory = new RenderUtils.ResourceLocation("textures/gui/container/inventory.png");

  const h48 = 172800000;

  let effects = [];

  const setEffects = () => {

    effects = [];

    let activeCakes = timers.data.cakes.filter(cake => h48 - (Date.now() - cake.last) > 0);
    if (activeCakes.length > 0) {
      effects.push({
        text: `&dCentury Cakes &7${activeCakes.length}/${timers.data.cakes.length}`,
        time: activeCakes.sort((a,b) => (h48 - (Date.now() - a.last)) - (h48 - (Date.now() - b.last)))?.[0]?.last?? 0,
        duration: h48
      })
    }

    let forge = timers.data.forge.filter(f => {
      if (!f) return false;
      let remaining = f.duration - (Date.now() - f.started);
      if (remaining < 0) PopupEvents.showToast(`${f.name} &fhas finished forging`, `&a[${PopupEvents.getAcceptName()}] to warp to the forge`, 10000, 500, "warp forge");
      return remaining > 0;
    });
    if (forge.length > 0) {
      let closest = forge.sort((a,b) => (a.started+a.duration - Date.now()) - (b.started+b.duration - Date.now()))[0];
      effects.push({
        text: `${closest.name} &8+${forge.length-1}`,
        time: closest.started,
        duration: closest.duration
      })
    }

    if (timers.data.freeRift && (Date.now() - timers.data.freeRift) < 4*60*60*1000) {
      effects.push({
        text: "&5Free Rift Entrance",
        time: timers.data.freeRift,
        duration: 4*60*60*1000
      })
    }

    let timeUntilDailyReset = (1 - (Date.now()/1000/60/60/24 - Math.floor(Date.now()/1000/60/60/24)))*24*60*60*1000;
    if (timers.data.superpairs && Date.now() - timers.data.superpairs < timeUntilDailyReset) {
      effects.push({
        text: "&dExperimentation",
        time: Date.now(),
        duration: timeUntilDailyReset
      })
    }

  }
  register("worldLoad", setEffects);

  RegUtils.whenContainerNameOpen((name) => (name == "GuiInventory" || name == "GuiChest") && WorldUtils.locraw.gametype == "SKYBLOCK" && settings.potionEffects,
    [
      register("guiRender", () => {

        let [x, y] = RenderUtils.getInventoryTopLeftCorner();
        let h = 32;
        let w = 120;
        let rX = x-w-6;
        let rY = y+h;
        let now = Date.now();
        for (let i = 0; i < effects.length; i++) {
          let effect = effects[i];
          let increment = i*(h-4);
          RenderUtils.draw2dResourceLocation(inventory, rX, rY+increment, w, h, 0, 120/256, 166/256, 198/256);
          Renderer.drawString(effect.text, rX+6, rY+6 + increment, true);
          let time = Math.floor((effect.duration - (now - effect.time))/1000);
          let hours = Math.floor(time/3600);
          let minutes = Math.floor((time%3600)/60);
          let seconds = time % 60;
          if (seconds < 0) {
            setEffects();
            return;
          }
          Renderer.drawString(`&7${hours}:${minutes.toString().padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`, rX+6, rY+6+11 + increment, true);
        }

      })
    ]
  )

  register("chat", (message) => {
    if (WorldUtils.locraw.mode !== "dynamic") return;
    for (let stat of timers.data.cakes) {
      if (message.match(new RegExp(`&d&l(?:Big )?Yum! &r&eYou (?:gain|refresh) &r&\\S\\+\\d+${stat.msg} &r&efor &r&a48 &r&ehours!&r`))) {
        stat.last = Date.now();
        timers.save();
        setEffects();
        return;
      }
    }
  }).setCriteria("&r${message}");

  
  const times = {
    "w": 604800000,
    "d": 86400000,
    "h": 3600000,
    "m": 60000,
    "s": 1000
  }
  const getTimeFromString = (string) => {
    let time = 0;
    string.split(" ").forEach(element => {
      element = element.toString();
      let num = Number(element.slice(0, element.length-1));
      let factor = times[element[element.length-1].toString().toLowerCase()];
      time += Number(num * factor);
    });
    return time;
  }
  const names = [
    "Refining",
    "Forging",
    "Tools",
    "Gear",
    "Reforge Stones",
    "Drill Parts",
    "Perfect Gemstones",
    "Pets",
    "Other"
  ]
  let forgeTime = 0;
  let currentSlot = -1;

  RegUtils.onGuiNameLoad(() => {
    let name = Player.getContainer()?.getName();
    if (match = name?.match(/Select Process \(Slot #(\d+)\)/)) {
      currentSlot = match[1]-1;
    }
  })

  RegUtils.onGuiLoad(() => {
    let name = Player.getContainer()?.getName();
    if (name == "The Forge") {
      Client.scheduleTask(1, () => {
        timers.data.forge = [];
        const slots = [10, 11, 12, 13, 14, 15, 16];
        for (let i = 0; i < slots.length; i++) {
          let slot = Player.getContainer().getStackInSlot(slots[i]);
          if (!slot) continue;
          let time = SBUtils.getLore(slot)?.[2]?.match(/§7Time Remaining: §a(.+)/)?.[1];
          if (!time) continue;
          timers.data.forge[i] = {
            name: slot.getName(),
            started: Date.now(),
            duration: getTimeFromString(time)
          }
        }
        timers.save();
        setEffects();
      })
    }
  })

  RegUtils.whenContainerNameOpen(() => WorldUtils.locraw.mode == "mining_3" && names.includes(Player.getContainer()?.getName()),
    [
      register("guiMouseClick", () => {
        let slot = Client.currentGui?.getSlotUnderMouse();
        if (!slot) return;
        let item = slot.getItem();
        let lore = SBUtils.getLore(item);
        let duration = lore[lore.length-3]?.match(/§7Duration: §b(.+)/)?.[1];
        if (!duration) return;
        forgeTime = getTimeFromString(duration);
      })
    ]
  )

  RegUtils.whenContainerNameOpen(() => WorldUtils.locraw.mode == "mining_3" && Player.getContainer()?.getName() == "Confirm Process",
    [
      register("guiMouseClick", (_, __, ___, gui) => {
        let container = Player.getContainer();
        if (!gui?.getSlotUnderMouse()) return;
    
        const confirmItem = new Slot(gui.getSlotUnderMouse())?.getItem();
        if (confirmItem?.getName() !== "§aConfirm") return;
        if (SBUtils.getLore(confirmItem)[0] == "§7§cYou don't have the required items!") return;
    
        const item = container.getStackInSlot(16);
        ChatLib.chat(`&aStarted forging &f${item.getName()}! &7(${MathUtils.getTimeLeft(forgeTime/1000)})`);

        timers.data.forge[currentSlot] = {
          name: item.getName(),
          started: Date.now(),
          duration: forgeTime
        }
        timers.save();
        setEffects();
      })
    ]
  )

  register("chat", () => {
    timers.data.freeRift = Date.now();
    timers.save();
    setEffects();
  }).setCriteria("&r&d&lINFUSED! &r&7Used your free dimensional infusion!&r")

  register("chat", () => {
    timers.data.superpairs = Date.now();
    timers.save();
    setEffects();
  }).setCriteria("&r&eYou claimed the &r&cSuperpairs &r&erewards!&r")

})