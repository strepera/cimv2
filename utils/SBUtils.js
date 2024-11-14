import { PersistentObject } from "./PersistentObject";

export default class SBUtils {

  _stats = new PersistentObject("sbStats", {});
  currentClass = null;

  constructor(RegUtils, WorldUtils) {

    RegUtils.onGuiLoad(() => {

      let container = Player.getContainer();
      if (container?.getName() !== "SkyBlock Menu") return;

      const statsItem = container.getStackInSlot(13);

      for (let line of this.getLore(statsItem).slice(1)) {
        let match = ChatLib.removeFormatting(line).match(/ \S+ (.+) ([0-9.,+%]+)/);
        if (!match) continue;
        let num = parseFloat(match[2].replaceAll("%", "").replaceAll(",", ""));
        this._stats.data[match[1]] = num;
      }
      this._stats.save();
    })

    RegUtils.onDungeonStart(() => {
      for (let line of TabList.getNames()) {
        if (match = ChatLib.removeFormatting(line).match(new RegExp(`\\[\\d+\\] ${Player.getName()} \\S+ \\((\\S+) \\S+\\)`))) {
          this.currentClass = match[1];
          return;
        }
      }
    })

  }

  get stats() {
    return this._stats.data;
  }

  getLore(item) {
    return [item.getName()].concat(new NBTTagList(item.getNBT().getCompoundTag("tag").getCompoundTag("display").getTagList("Lore", 8)).toArray());
  }

  getItemFromNBT(nbtStr) {
    let nbt = net.minecraft.nbt.JsonToNBT.func_180713_a(nbtStr); // Get MC NBT object from string
    let count = nbt.func_74771_c('Count'); // get byte
    let id = nbt.func_74765_d('id') || nbt.func_74779_i('id'); // get short || string
    let damage = nbt.func_74765_d('Damage'); // get short
    let tag = nbt.func_74781_a('tag'); // get tag
    let item = new Item(id); // create ct item object
    item.setStackSize(count);
    item = item.getItemStack(); // convert to mc object
    item.func_77964_b(damage); // set damage of mc item object
    if (tag) item.func_77982_d(tag); // set tag of mc item object
    item = new Item(item); // convert back to ct object
    return item;
  }

  getItemFromString(nbtStr) {
    const MCItemStack = Java.type("net.minecraft.item.ItemStack");
    const nbt = net.minecraft.nbt.JsonToNBT.func_180713_a(nbtStr);
    return new Item(MCItemStack.func_77949_a(nbt));
  }

  neuItemToCt(item, count) {
    if (!item) return;
    if (!count) count = 1;
    let nbt = {
      id: item.itemid,
      Count: count,
      Damage: item.damage
    }
    let ctitem = new Item(net.minecraft.item.ItemStack.func_77949_a(NBT.parse(nbt).rawNBT)); // loadItemStackFromNBT()
    let nbtString = ctitem.getRawNBT().toString().replace(",", ",tag:" + item.nbttag + ",");
    ctitem = this.getItemFromString(nbtString);
    ctitem.setStackSize(count);
    if (item.lore) ctitem.setLore(item.lore);
    if (item.displayname) ctitem.setName(item.displayname);
    return ctitem;
  }

  getSkyblockId(item) {
    return item.getNBT().getCompoundTag("tag")?.getCompoundTag("ExtraAttributes")?.getString("id");
  }

}