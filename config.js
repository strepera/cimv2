import ClickGui from "../ClickGui/ClickGui.js";
export let settings = new ClickGui("cim");

settings
  .addToggle({
    name: "abilityDisplay",
    title: "Ability Display",
    description: "Displays most items with abilities and their durations and cooldowns when used",
    category: "HUD",
  })
  .addToggle({
    name: "popupDisplay",
    title: "Popup Display",
    description: "Displays a popup at the top middle of the screen for certain events",
    category: "HUD",
  })
  .addToggle({
    name: "itemList",
    title: "Item List",
    description: "Shows a list of searchable items in your inventory. Left click on items to view their recipe, right click on items to view their usages",
    category: "Inventory"
  })
  .addToggle({
    name: "equipmentDisplay",
    title: "Equipment Display",
    description: "Shows your equipment on the right of your armour in your inventory in skyblock",
    category: "Inventory"
  })
  .addToggle({
    name: "inventoryButtons",
    title: "Inventory Buttons",
    description: "Shows buttons in your inventory that run different commands in skyblock",
    category: "Inventory"
  })
  .addToggle({
    name: "containerSearch",
    title: "Container Search",
    description: "Adds a search box to search for items in your inventory",
    category: "Inventory"
  })
  .addToggle({
    name: "potionEffects",
    title: "Custom Potion Effects",
    description: "Adds potion effect like timers in your inventory for skyblock",
    category: "Inventory"
  })
  .init();

register("command", () => {
  settings.open();
}).setName("cimconfig")

let features = [];

/**
 * Adds a new feature to the list of features to be executed.
 *
 * @param {Function} fn - The function representing the feature to be added.
 * @description
 * This function adds a feature to the global 'features' array. Features are executed
 * after data has been loaded and the world has finished loading.
 */
export const createFeature = (fn) => {
  features.push(fn);
}

export function endConfig(cb) {
  cb(features);
}
