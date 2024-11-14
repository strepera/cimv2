import { createFeature } from "../config.js";
import { PersistentObject } from "../utils/PersistentObject";

createFeature((data, settings, RegUtils, WorldUtils, MathUtils, RenderUtils, ItemUtils, SBUtils) => {

  const equipment = new PersistentObject("equipment", [
    '{id:"minecraft:stained_glass_pane",Count:1b,tag:{display:{Lore:[0:" §8> Necklace"],Name:"§7Empty Equipment Slot"}},Damage:8s}',
    '{id:"minecraft:stained_glass_pane",Count:1b,tag:{display:{Lore:[0:" §8> Cloak"],Name:"§7Empty Equipment Slot"}},Damage:8s}',
    '{id:"minecraft:stained_glass_pane",Count:1b,tag:{display:{Lore:[0:" §8> Belt"],Name:"§7Empty Equipment Slot"}},Damage:8s}',
    '{id:"minecraft:stained_glass_pane",Count:1b,tag:{display:{Lore:[0:" §8> Gloves",1:" §8> Bracelet"],Name:"§7Empty Equipment Slot"}},Damage:8s}'
  ]);
  let parsedEquipment = equipment.data.map(item => {if (item) return SBUtils.getItemFromNBT(item)});

  const setEquipment = (arr) => {
    equipment.data = arr.map(item => item?.getRawNBT());
    equipment.save();
    parsedEquipment = arr;
  }

  RegUtils.onGuiLoad(() => {
    let container = Player.getContainer();
    if (container?.getName() !== "Your Equipment and Stats") return;
    setEquipment([
      container.getStackInSlot(10),
      container.getStackInSlot(19),
      container.getStackInSlot(28),
      container.getStackInSlot(37)
    ])
  })

  const getPos = () => {
    let topLeft = RenderUtils.getInventoryTopLeftCorner();
    let x = topLeft[0]+22;
    let y = topLeft[1]+35;
    return [x, y];
  }

  RegUtils.whenContainerNameOpen((name) => name == "GuiInventory" && WorldUtils.locraw.gametype == "SKYBLOCK" && settings.equipmentDisplay,
    [

      register("guiRender", (mx, my) => {
        let [x, y] = getPos();
        for (let i = 0; i < parsedEquipment.length; i++) {
          let item = parsedEquipment[i];
          if (!item) continue;
          let rX = x;
          let rY = y+i*18;
          RenderUtils.pushPop(() => {
            RenderUtils.drawItem(item, rX, rY+1, 1, 150);
            RenderUtils.drawSlotHighlightAndTooltip(SBUtils.getLore(item), rX, rY+1);
          })
        }
      }).setPriority(Priority.LOWEST),
      
      register("guiMouseClick", (mx, my) => {
        let [x, y] = getPos();
        if (MathUtils.isMouseOver(x, y, 18, 18*4)) ChatLib.command("equipment");
      })

    ]
  )

})