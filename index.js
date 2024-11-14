import { endConfig, settings } from "./config.js";

import { PersistentObject } from "./utils/PersistentObject";

import RegUtils from "./utils/RegUtils";
import WorldUtils from "./utils/WorldUtils";
import SBUtils from "./utils/SBUtils";
import { DataUtils } from "./utils/DataUtils";
import { MathUtils } from "./utils/MathUtils";
import { RenderUtils } from "./utils/RenderUtils";
import { ItemUtils } from "./utils/ItemUtils";

const RegU = new RegUtils(settings);
const WorldU = new WorldUtils();
const SBU = new SBUtils(RegU);
RenderUtils.init();

let features = [];

import "./features/AbilityDisplay.js";
import "./features/InventoryButtons.js";
import "./features/ItemSearch.js";
import "./features/EquipmentDisplay.js";
import "./features/PopupEvents.js";
import "./features/ItemContextMenu.js";
import "./features/CustomInventoryEffects.js";
import "./features/ContainerSearch.js";

endConfig((feat) => {
  features = feat;
})

RegU.onceWorldLoad(() => {
  const metadata = JSON.parse(FileLib.read("cim", "metadata.json"));
  const currentVersion = metadata.version;
  const lastVersion = new PersistentObject("lastVersion", {
    version: currentVersion
  })
  if (currentVersion !== lastVersion.data.version) {
    ChatLib.chat(metadata.patchnotes);
  }
  lastVersion.data.version = currentVersion;
  lastVersion.save();

  DataUtils.onLoaded((data) => {
    features.forEach(feature => {
      feature(data, settings.settings, RegU, WorldU, MathUtils, RenderUtils, ItemUtils, SBU);
    })
  })
  DataUtils.getData();

  register("command", () => {
    DataUtils.getRepo();
  }).setName("cimupdaterepo");

  const lastPlayed = new PersistentObject("lastPlayed", {
    lastLogin: Date.now()
  })

  ChatLib.chat(`&7[CIM] &aLast Load: ${new Date(lastPlayed.data.lastLogin).toLocaleDateString()} ${new Date(lastPlayed.data.lastLogin).toLocaleTimeString()}`);

  lastPlayed.data.lastLogin = Date.now();
  lastPlayed.save();

  register("gameUnload", () => {
    lastPlayed.data.lastLogin = Date.now();
    lastPlayed.save();
  })
})

register("command", (...args) => {
  eval(args.join(" "));
}).setName("cimeval")