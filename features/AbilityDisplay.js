import { createFeature } from "../config.js";

createFeature((data, settings, RegUtils, WorldUtils, MathUtils, RenderUtils, ItemUtils, SBUtils) => {

  const useKey = Client.getKeyBindFromDescription("key.use");

  let items = [];

  const getItemAbilities = (item) => {
    if (!item) return;
    return SBUtils.getLore(item)
      .map(l => l.match(/§6Ability: (.+)  §e§l/)?.[1])
      .filter(l => l)
      .map(l => ChatLib.removeFormatting(l))
  }

  RegUtils.onHeldItemChange((item, index) => {
    if (!item) return;
    items[index] = {
      item: item,
      abilities: getItemAbilities(item),
      used: items[index]?.used
    };
    
    for (let line of SBUtils.getLore(item)) {
      if (match = line.match(/§8Cooldown: §a(\d+)s/)) {
        items[index].cooldown = Number(match[1])*20;
      }
      else if (match = ChatLib.removeFormatting(line).match(/for (\d+)(s| seconds)/)) {
        items[index].duration = Number(match[1])*20;
      }
    }

  })

  register("renderOverlay", () => {
    if (!settings.abilityDisplay) return;
    let w = 16;
    let h = 16;
    let ticks = RegUtils.getTicks();
    let displays = items.map(item => {
      if (!item || !item.used) return;
      let dur = (ticks - (item.used+item.duration))/item.duration;
      let cool = (ticks - (item.used+item.cooldown))/item.cooldown;
      return {
        item: item.item,
        times: {dur: (dur+1)/2, cool: (cool+1)/2}
      };
    }).filter(display => display && (display.times.dur < 1 || display.times.cool < 1));

    for (let i = 0; i < displays.length; i++) {
      let item = displays[i];
      let x = Renderer.screen.getWidth()/2 - displays.length*(w+2)/2 + i*(w+2);
      let y = Renderer.screen.getHeight()/2 + h;
      RenderUtils.drawItem(item.item, x, y);
      if (item.times.dur < 1) {
        Renderer.drawRect(Renderer.color(20, 20, 20), x, y+14, w, 2);
        Renderer.drawRect(Renderer.GREEN, x, y+14, w - w*item.times.dur, 2);
      }
      if (item.times.cool < 1) Renderer.drawRect(Renderer.color(255, 255, 255, 100), x, y+h, w, -(h - item.times.cool*h));
    }

  })

  let indexes = {};
  register("actionBar", (event) => {

    let text = ChatLib.removeFormatting(EventLib.getMessage(event).getText());
    let match = text.match(/-(\d+) Mana \((.+)\)/);
    let ability = match?.[2];
    if (!ability) {
      indexes = {};
      return;
    }
    if (!indexes[ability] && indexes[ability] !== 0) indexes[ability] = -1;
    indexes[ability]++;

    if (indexes[ability] !== 0) return;

    let item = items.find(i => i?.abilities?.includes(ability));
    if (!item) return;
    item.used = RegUtils.getTicks();

  })

  useKey.registerKeyDown(() => {
    let abilities = getItemAbilities(Player.getHeldItem());
    if (!abilities) return;
    let item = items[Player.getHeldItemIndex()];
    if (item?.cooldown && (item.used+item.cooldown) - RegUtils.getTicks() > 0) return;
    for (let ability of abilities) {
      if (!indexes[ability]) continue;
      indexes[ability] = -1;
    }
  })

  register("worldLoad", () => {
    for (let item of items) {
      if (!item) continue;
      item.used = null;
    }
  })

})