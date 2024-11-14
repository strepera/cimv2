import { createFeature } from "../config.js";
import { PersistentObject } from "../utils/PersistentObject.js";

createFeature((data, settings, RegUtils, WorldUtils, MathUtils, RenderUtils, ItemUtils, SBUtils) => {

  const stringifiedButtons = new PersistentObject("inventoryButtons", 
    [
      {
        item: '{id:"minecraft:skull",Count:1b,tag:{SkullOwner:{Id:"0181077c-8141-4b56-9cfd-22dc35994c41",hypixelPopulated:1b,Properties:{textures:[0:{Value:"eyJ0ZXh0dXJlcyI6eyJTS0lOIjp7InVybCI6Imh0dHA6Ly90ZXh0dXJlcy5taW5lY3JhZnQubmV0L3RleHR1cmUvYzljODg4MWU0MjkxNWE5ZDI5YmI2MWExNmZiMjZkMDU5OTEzMjA0ZDI2NWRmNWI0MzliM2Q3OTJhY2Q1NiJ9fX0="}]},Name:"§0181077c-8141-4b56-9cfd-22dc35994c41"},display:{Lore:[0:"§8/warp home",1:"",2:"§7Your very own chunk of SkyBlock. Nice",3:"§7housing for your minions.",4:"",5:"§aYou are here!"],Name:"§bPrivate Island"}},Damage:3s}',
        command: "is"
      },
      {
        item: '{id:"minecraft:skull",Count:1b,tag:{SkullOwner:{Id:"f5a3c783-ad64-4049-9ac3-307edbddcbf8",hypixelPopulated:1b,Properties:{textures:[0:{Value:"eyJ0aW1lc3RhbXAiOjE1NTkyMTU0MTY5MDksInByb2ZpbGVJZCI6IjQxZDNhYmMyZDc0OTQwMGM5MDkwZDU0MzRkMDM4MzFiIiwicHJvZmlsZU5hbWUiOiJNZWdha2xvb24iLCJzaWduYXR1cmVSZXF1aXJlZCI6dHJ1ZSwidGV4dHVyZXMiOnsiU0tJTiI6eyJ1cmwiOiJodHRwOi8vdGV4dHVyZXMubWluZWNyYWZ0Lm5ldC90ZXh0dXJlL2Q3Y2M2Njg3NDIzZDA1NzBkNTU2YWM1M2UwNjc2Y2I1NjNiYmRkOTcxN2NkODI2OWJkZWJlZDZmNmQ0ZTdiZjgifX19"}]},Name:"§f5a3c783-ad64-4049-9ac3-307edbddcbf8"},display:{Lore:[0:"§8/warp hub",1:"",2:"§7Where everything happens and",3:"§7anything is possible.",4:"",5:"§8Right-Click to warp!",6:"§eLeft-Click to open!"],Name:"§bSkyBlock Hub"}},Damage:3s}',
        command: "hub"
      },
      {
        item: '{id:"minecraft:skull",Count:1b,tag:{SkullOwner:{Id:"f50e4c6c-39f2-47ef-90b8-efb29c50684a",hypixelPopulated:1b,Properties:{textures:[0:{Value:"eyJ0aW1lc3RhbXAiOjE1Nzg0MDk0MTMxNjksInByb2ZpbGVJZCI6IjQxZDNhYmMyZDc0OTQwMGM5MDkwZDU0MzRkMDM4MzFiIiwicHJvZmlsZU5hbWUiOiJNZWdha2xvb24iLCJzaWduYXR1cmVSZXF1aXJlZCI6dHJ1ZSwidGV4dHVyZXMiOnsiU0tJTiI6eyJ1cmwiOiJodHRwOi8vdGV4dHVyZXMubWluZWNyYWZ0Lm5ldC90ZXh0dXJlLzliNTY4OTViOTY1OTg5NmFkNjQ3ZjU4NTk5MjM4YWY1MzJkNDZkYjljMWIwMzg5YjhiYmViNzA5OTlkYWIzM2QiLCJtZXRhZGF0YSI6eyJtb2RlbCI6InNsaW0ifX19fQ=="}]},Name:"§f50e4c6c-39f2-47ef-90b8-efb29c50684a"},display:{Lore:[0:"§8/warp dungeon_hub",1:"",2:"§7Group up with friends and take on",3:"§7challenging Dungeons.",4:"",5:"§eClick to warp!"],Name:"§aDungeon Hub§7 - §bSpawn"}},Damage:3s}',
        command: "warp dhub"
      },
      {
        item: '{id:"minecraft:bone",Count:1b,Damage:0s}',
        command: "petmenu"
      },
      {
        item: '{id:"minecraft:leather_chestplate",Count:1b,tag:{overrideMeta:1b,display:{color:8339378}},Damage:0s}',
        command: "wardrobe"
      },
      {
        item: '{id:"minecraft:chest",Count:1b,Damage:0s}',
        command: "storage"
      },
      {
        item: '{id:"minecraft:skull",Count:1b,tag:{overrideMeta:1b,SkullOwner:{Id:"c67dc557-0d47-38a4-a2d4-4e776001ed82",Properties:{textures:[0:{Value:"ewogICJ0aW1lc3RhbXAiIDogMTcxMTYzNDM5MTg3OCwKICAicHJvZmlsZUlkIiA6ICIxNmQ4NjI4NzYzMWY0NDY2OGQ0NDM2ZTJlY2IwNTllNSIsCiAgInByb2ZpbGVOYW1lIiA6ICJSZXphVG91cm5leSIsCiAgInNpZ25hdHVyZVJlcXVpcmVkIiA6IHRydWUsCiAgInRleHR1cmVzIiA6IHsKICAgICJTS0lOIiA6IHsKICAgICAgInVybCIgOiAiaHR0cDovL3RleHR1cmVzLm1pbmVjcmFmdC5uZXQvdGV4dHVyZS9iNzllN2YzMzQxYjY3MmQ5ZGU2NTY0Y2JhY2EwNTJhNmE3MjNlYTQ2NmEyZTY2YWYzNWJhMWJhODU1ZjBkNjkyIgogICAgfQogIH0KfQ=="}]}}},Damage:3s}',
        command: "cf"
      },
      {
        item: '{id:"minecraft:golden_horse_armor",Count:1b,Damage:0s}',
        command: "ah"
      },
      {
        item: '{id:"minecraft:skull",Count:1b,tag:{HideFlags:254,SkullOwner:{Id:"221b4800-d33c-363f-aa39-de9cb0f8d8fe",Properties:{textures:[0:{Value:"eyJ0aW1lc3RhbXAiOjE1NzMyMjM2NDc4NDcsInByb2ZpbGVJZCI6IjQxZDNhYmMyZDc0OTQwMGM5MDkwZDU0MzRkMDM4MzFiIiwicHJvZmlsZU5hbWUiOiJNZWdha2xvb24iLCJzaWduYXR1cmVSZXF1aXJlZCI6dHJ1ZSwidGV4dHVyZXMiOnsiU0tJTiI6eyJ1cmwiOiJodHRwOi8vdGV4dHVyZXMubWluZWNyYWZ0Lm5ldC90ZXh0dXJlL2MyMzJlMzgyMDg5NzQyOTE1NzYxOWIwZWUwOTlmZWMwNjI4ZjYwMmZmZjEyYjY5NWRlNTRhZWYxMWQ5MjNhZDcifX19"}]}},display:{Lore:[0:"§8/bz",1:"",2:"§7Access the Bazaar from anywhere in",3:"§7SkyBlock!",4:"",5:"§cRequires Cookie Buff!"],Name:"§6Bazaar"}},Damage:3s}',
        command: "bz"
      },
      {
        item: '{id:"minecraft:skull",Count:1b,tag:{HideFlags:254,SkullOwner:{Id:"6ba54607-3d0c-4bac-8da8-5398ed77ce69",hypixelPopulated:1b,Properties:{textures:[0:{Value:"ewogICJ0aW1lc3RhbXAiIDogMTU5MTMxMDU4NTYwOSwKICAicHJvZmlsZUlkIiA6ICI0MWQzYWJjMmQ3NDk0MDBjOTA5MGQ1NDM0ZDAzODMxYiIsCiAgInByb2ZpbGVOYW1lIiA6ICJNZWdha2xvb24iLAogICJzaWduYXR1cmVSZXF1aXJlZCIgOiB0cnVlLAogICJ0ZXh0dXJlcyIgOiB7CiAgICAiU0tJTiIgOiB7CiAgICAgICJ1cmwiIDogImh0dHA6Ly90ZXh0dXJlcy5taW5lY3JhZnQubmV0L3RleHR1cmUvODBhMDc3ZTI0OGQxNDI3NzJlYTgwMDg2NGY4YzU3OGI5ZDM2ODg1YjI5ZGFmODM2YjY0YTcwNjg4MmI2ZWMxMCIKICAgIH0KICB9Cn0="}]},Name:"§6ba54607-3d0c-4bac-8da8-5398ed77ce69"},display:{Lore:[0:"§7A sack which contains other sacks.",1:"§7Sackception!",2:"",3:"§eClick to open!"],Name:"§aSack of Sacks"}},Damage:3s}',
        command: "sacks"
      },
      {
        item: '{id:"minecraft:crafting_table",Count:1b,Damage:0s}',
        command: "craft"
      },
      {
        item: '{id:"minecraft:skull",Count:1b,tag:{SkullOwner:{Id:"9dd5008a-08a1-3f4a-b8af-2499bdb8ff3b",Properties:{textures:[0:{Value:"eyJ0ZXh0dXJlcyI6eyJTS0lOIjp7InVybCI6Imh0dHA6Ly90ZXh0dXJlcy5taW5lY3JhZnQubmV0L3RleHR1cmUvZTM2ZTk0ZjZjMzRhMzU0NjVmY2U0YTkwZjJlMjU5NzYzODllYjk3MDlhMTIyNzM1NzRmZjcwZmQ0ZGFhNjg1MiJ9fX0="}]}},display:{Lore:[0:"§7Contact your Banker from anywhere.",1:"§7Cooldown: §e20 minutes",2:"",3:"§7Banker Status:",4:"§aAvailable",5:"",6:"§7Interest in: §b19 Hours",7:"§7Co-op Projection: §626,398.1 coins §b(2%)",8:"§7Last Co-op Interest: §618,086 coins",9:"",10:"§eClick to open!"],Name:"§aPersonal Bank"}},Damage:3s}',
        command: "bank"
      }
    ]
  )

  let parsedButtons = stringifiedButtons.data.map(obj => {return {item: SBUtils.getItemFromNBT(obj.item), command: obj.command}});

  const tabWidth = 28;
  const tabHeight = 32;

  RegUtils.whenContainerNameOpen(
    (name) => (name == "GuiInventory" || name == "GuiChest") && WorldUtils.locraw.gametype == "SKYBLOCK" && settings.inventoryButtons,
    [

      register("guiRender", (mx, my) => {
        for (let i = 0; i < 12; i++) {

          let topLeft = RenderUtils.getInventoryTopLeftCorner();
          let topLeftX = topLeft[0];
          let topLeftY = topLeft[1];
          let w = tabWidth;
          let h = tabHeight;
          let x = topLeftX + (i % 6)*w;
          let type = 0;
          let y = topLeftY;
          if (i > 5) {
            type = 19;
            y = Renderer.screen.getHeight() - topLeftY - h;
          }
          if (MathUtils.isMouseOver(x, y, w, h)) type += 10;
          RenderUtils.drawTab(x, y, type, tabWidth, tabHeight);
          RenderUtils.drawItem(parsedButtons[i].item, x+6, y+8, 1, 100);
        }
      }),

      register("guiMouseClick", (mx, my, mb) => {

        if (mb == 0) {
          for (let i = 0; i < 12; i++) {

            let topLeft = RenderUtils.getInventoryTopLeftCorner();
            let topLeftX = topLeft[0];
            let topLeftY = topLeft[1];
            let w = tabWidth;
            let h = tabHeight;
            let x = topLeftX + (i % 6)*w;
            let y = topLeftY;
            if (i > 5) {
              y = Renderer.screen.getHeight() - topLeftY - h;
            }
            if (MathUtils.isMouseOver(x, y, w, h)) {
              WorldUtils.playSound("gui.button.press", 1, 1);
              ChatLib.command(parsedButtons[i].command);
            }
  
          }
        }

        else if (mb == 1) {
          // TODO: add a menu to change the buttons functionality and item representing it
        }

      })
      
    ]
  )

})