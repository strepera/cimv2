import { createFeature } from "../config.js";

createFeature((data, settings, RegUtils, WorldUtils, MathUtils, RenderUtils, ItemUtils, SBUtils) => {

  const inventory = new RenderUtils.ResourceLocation("textures/gui/container/inventory.png");

  let menu = {
    open: false,
    item: null,
    options: []
  }


  register("guiOpened", () => {
    menu = {
      open: false,
      item: null,
      options: []
    }
  })

  const drawSlots = (x, y, slots) => {
    const top = [0, (6+slots*18)/256, 0, 6/256];
    const topRight = [170/256, 176/256, 0, 6/256];
    const end = [170/256, 176/256, 141/256, 166/256];
    const start = [0, (8+slots*18)/256, 142/256, 166/256];
    RenderUtils.draw2dResourceLocation(inventory, x, y+6, 8+slots*18, 23, start[0], start[1], start[2], start[3]);
    RenderUtils.draw2dResourceLocation(inventory, x+7+slots*18, y+6, 6, 23, end[0], end[1], end[2], end[3]);
    RenderUtils.draw2dResourceLocation(inventory, x, y, 8+slots*18, 6, top[0], top[1], top[2], top[3]);
    RenderUtils.draw2dResourceLocation(inventory, x+7+slots*18, y, 6, 6, topRight[0], topRight[1], topRight[2], topRight[3]);
  }

  RegUtils.whenContainerNameOpen((name) => name == "GuiInventory",
    [
      register("guiRender", (mx, my) => {
        if (!menu.open) return;
        Tessellator.pushMatrix();
        Renderer.translate(0, 0, 200);
        drawSlots(menu.x-9, menu.y-8, menu.options.length);
        for (let i = 0; i < menu.options.length; i++) {
          let option = menu.options[i];
          RenderUtils.drawItem(option.item, menu.x+i*18 - 1, menu.y - 2, 1, 201);
          RenderUtils.drawSlotHighlightAndTooltip([option.text], menu.x + i*18 - 1, menu.y - 1);
        }
        Tessellator.popMatrix();
      }).setPriority(Priority.HIGHEST),
    
      register("guiMouseClick", (mx, my, mb, gui, event) => {
        if (!menu.open && mb !== 2) return;
        cancel(event);
        if (menu.open && mb !== 2) {
          if (my < menu.y || my > menu.y+18) return;
          let index = Math.floor((mx - menu.x)/18);
          menu.options[index].fn();
          return;
        }
        let item = Client.currentGui?.getSlotUnderMouse()?.getItem();
        if (!item) return;
        let neuItem = data.items[SBUtils.getSkyblockId(item)];
        if (!neuItem) return;
        let itemName = ChatLib.removeFormatting(neuItem.displayname);
        if (!itemName) return;
        WorldUtils.playSound("gui.button.press", 1, 1);
        menu = {
          x: Renderer.screen.getWidth()/2,
          y: Renderer.screen.getHeight()/2-18,
          open: true,
          item: item,
          options: [
            {
              item: new Item("minecraft:crafting_table"),
              text: "§cCraft",
              fn: () => {
                ChatLib.command(`recipe ${itemName}`);
              }
            },
            {
              item: SBUtils.getItemFromNBT('{id:"minecraft:skull",Count:1b,tag:{HideFlags:254,SkullOwner:{Id:"6ba54607-3d0c-4bac-8da8-5398ed77ce69",hypixelPopulated:1b,Properties:{textures:[0:{Value:"ewogICJ0aW1lc3RhbXAiIDogMTU5MTMxMDU4NTYwOSwKICAicHJvZmlsZUlkIiA6ICI0MWQzYWJjMmQ3NDk0MDBjOTA5MGQ1NDM0ZDAzODMxYiIsCiAgInByb2ZpbGVOYW1lIiA6ICJNZWdha2xvb24iLAogICJzaWduYXR1cmVSZXF1aXJlZCIgOiB0cnVlLAogICJ0ZXh0dXJlcyIgOiB7CiAgICAiU0tJTiIgOiB7CiAgICAgICJ1cmwiIDogImh0dHA6Ly90ZXh0dXJlcy5taW5lY3JhZnQubmV0L3RleHR1cmUvODBhMDc3ZTI0OGQxNDI3NzJlYTgwMDg2NGY4YzU3OGI5ZDM2ODg1YjI5ZGFmODM2YjY0YTcwNjg4MmI2ZWMxMCIKICAgIH0KICB9Cn0="}]},Name:"§6ba54607-3d0c-4bac-8da8-5398ed77ce69"},display:{Lore:[0:"§7A sack which contains other sacks.",1:"§7Sackception!",2:"",3:"§eClick to open!"],Name:"§aSack of Sacks"}},Damage:3s}'),
              text: "§9GFS",
              fn: () => {
                let input = new RenderUtils.textInput(true);
                input.isActive = true;
                let regs = [
                  register("postGuiRender", () => {
                    Renderer.drawRect(Renderer.DARK_GRAY, menu.x, menu.y + 24, 50, 10);
                    input.draw(menu.x, menu.y + 24, 0, 10);
                  }),
                  register("guiMouseClick", () => { 
                    if (!MathUtils.isMouseOver(menu.x, menu.y + 24, 50, 10)) {
                      isActive = false;
                      return;
                    }
                    input.isActive = true;
                  })
                ]
                input.onEnter((text) => {
                  ChatLib.command(`gfs ${itemName} ${text.replace(/\D/g, "")}`);
                  regs.forEach(reg => reg.unregister());
                })
              }
            },
            {
              item: new Item("minecraft:book"),
              text: "§6Recipe",
              fn: () => {
                ChatLib.command(`cimopenrecipe ${neuItem.internalname} 0`, true);
              }
            },
            {
              item: new Item("minecraft:book"),
              text: "§9Usages",
              fn: () => {
                ChatLib.command(`cimopenrecipe ${neuItem.internalname} 1`, true);
              }
            }
          ]
        }
      })
    ]
  )

})