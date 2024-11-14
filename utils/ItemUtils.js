export class ItemUtils {
  static getLore(item) {
    return [item.getName()].concat(new NBTTagList(item.getNBT().getCompoundTag("tag").getCompoundTag("display").getTagList("Lore", 8)).toArray());
  }
}