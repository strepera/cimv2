import { createFeature } from "../config.js";

createFeature((data, settings, RegUtils, WorldUtils, MathUtils, RenderUtils, ItemUtils, SBUtils) => {

  const creativeSearch = new RenderUtils.ResourceLocation("textures/gui/container/creative_inventory/tab_item_search.png");
  const tabsWithScrollBar = new RenderUtils.ResourceLocation("textures/gui/container/creative_inventory/tabs.png");
  const craftingTableTexture = new RenderUtils.ResourceLocation("textures/gui/container/crafting_table.png");
  const selectArrows = new RenderUtils.ResourceLocation("textures/gui/server_selection.png");
  const beacon = new RenderUtils.ResourceLocation("textures/gui/container/beacon.png");

  const drawCreativeSearch = (x, y, w, h, progress) => {
    RenderUtils.draw2dResourceLocation(creativeSearch, x, y, w+progress, h, -progress/256, w/256, 0, h/256);
  }

  const drawScrollBar = (x, y) => {
    let scrollPercent = scroll/Math.ceil(totalFiltered.length/9);
    let rX = x+175;
    let rY = y+18+scrollPercent*95;
    let w = 11;
    let h = 14;
    let v = 244;
    let u = 0;
    if (MathUtils.isMouseOver(rX, rY, w, h)) v -= 12;
    RenderUtils.draw2dResourceLocation(tabsWithScrollBar, rX, rY, w, h, v/256, (v+w)/256, u, (u+h)/256);
  }

  const getScrollBarPos = () => {
    let topLeft = RenderUtils.getInventoryTopLeftCorner();
    let x = Renderer.screen.getWidth() - topLeft[0];
    let y = topLeft[1]+28;
    let scrollPercent = scroll/Math.ceil(totalFiltered.length/9);
    let rX = x+175;
    let rY = y+18+scrollPercent*95;
    return [rX, rY];
  }

  const getHistoryTabsPos = (x, y, i, w, h, progress) => {
    let rX = x+progress + i*w + 12;
    let rY = y-h+4;
    return [rX, rY];
  }

  const setFiltered = () => {
    new Thread(() => {
      filtered = totalFiltered.slice(scroll*9, 45+scroll*9).map(i => SBUtils.neuItemToCt(i));
    }).start()
  }

  const filterData = (filter) => {
    if (!filter) {
      totalFiltered = [];
      filtered = [];
      scroll = 0;
      return;
    }
    new Thread(() => {
      scroll = 0;
      let results = [];
      const exactMatches = new Set();
      const checkString = (str) => str.toLowerCase().includes(filter) || str.replace(/§\S/g, '').toLowerCase() === filter;
    
      [data.items, data.npcs, data.monsters, data.bosses].forEach(category => {
        Object.values(category).forEach(item => {
          if (checkString(item.displayname)) {
            if (item.displayname.replace(/§\S/g, '').toLowerCase() === filter) {
              exactMatches.add(item);
              return;
            }
            results.push(item);
            return;
          }
    
          const formattedLore = ChatLib.removeFormatting(item.lore.join(""))?.toLowerCase();
          if (checkString(formattedLore)) {
            results.push(item);
            return;
          }
        });
      });
    
      if (exactMatches.size > 0) {
        results.unshift(...Array.from(exactMatches));
      }
    
      totalFiltered = results;
      setFiltered();
    }).start();
  }

  const setHistory = (item, openNew) => {
    if (openNew && (!history[0] || history[0].getName() !== item.getName()) || !recipeGui.isOpen) recipeGui.open();
    history = history.filter(i => i.getName() !== item.getName());
    history.unshift(item);
    if (history.length > 6) {
      history.pop();
    }
  }

  const setPages = (item, openNew, mb) => {
    new Thread(() => {

      let ctItem = SBUtils.neuItemToCt(item);

      switch (mb) {
        case 0: // left click recipe
          let recipe = getRecipe(item);
          let costs = getCost(item);
          let drops = getDrops(item, data.monsters).concat(getDrops(item, data.bosses));
          let newPages = (recipe).concat(costs).concat(drops);
          if (newPages.length === 0) break;
          currentPages = newPages;
          currentPageIndex = 0;
          setHistory(ctItem, openNew);
          break;
        case 1: // right click usages
          let recipes = getRecipeUsages(item);
          let costsUsages = getCostUsages(item);
          let entityDrops = getDropUsages(item);
          let usages = (recipes).concat(costsUsages).concat(entityDrops);
          if (usages.length === 0) break; 
          currentPages = usages;
          currentPageIndex = 0;
          setHistory(ctItem, openNew);
          break;
        default:
          return;
      }

      WorldUtils.playSound("gui.button.press", 1, 1);

    }).start()
  }

  register("command", (...args) => {
    let item = getFromData(args[0]);
    if (!item) return;
    isMenuOpen = true;
    setPages(item, true, Number(args[1]));
  }).setName("cimopenrecipe")

  const getFromData = (name) => {
    return data.items[name] || data.monsters[name] || data.bosses[name] || data.npcs[name];
  }

  const itemSearchInput = new RenderUtils.textInput();
  const recipeGui = new RecipeGui();

  const tabWidth = 28;
  const tabHeight = 32;

  let history = [];
  let totalFiltered = [];
  let filtered = [];
  let scroll = 0;
  let isMenuOpen = false;
  let initialScrollbarY = 0;
  let itemListSlide = 0;

  let currentPages = [];
  let currentPageIndex = 0;

  itemSearchInput.onGuiKey(filterData);

  register("guiClosed", () => {
    isMenuOpen = false;
    itemListSlide = 0;
  })

  RegUtils.whenContainerNameOpen(
    (name) => (name == "GuiInventory" || name == "GuiChest") && WorldUtils.locraw.gametype == "SKYBLOCK" && settings.itemList,
    [

      register("guiRender", (mx, my) => {

        let topLeft = RenderUtils.getInventoryTopLeftCorner();
        let x = Renderer.screen.getWidth() - topLeft[0]+2;
        let y = topLeft[1]+28;
        let w = 195;
        let h = 135;
        let progress = -w;

        if (isMenuOpen) {
          itemListSlide = Math.min(itemListSlide + 3*(300/Client.getFPS()), 100);
          progress = Math.floor(MathUtils.easeInOut(itemListSlide/100)*w - w);
        }
        else {
          progress = Math.floor(w/6 - w);
          if (mx - x > w/6 && my > y && my < y+h) {
            isMenuOpen = true;
          }
        }

        for (let i = 0; i < history.length; i++) {
          let item = history[i];
          let [rX, rY] = getHistoryTabsPos(x, y, i, tabWidth, tabHeight, progress);
          if (rX < x) continue;
          let type = 0;
          if (MathUtils.isMouseOver(rX, rY, tabWidth, tabHeight)) type = 10;
          RenderUtils.drawTab(rX, rY, type, tabWidth, tabHeight);
          RenderUtils.drawItem(item, rX+6, rY+8);
        }

        recipeGui.draw(craftingTableTexture, currentPages, currentPageIndex, RenderUtils, SBUtils, MathUtils, selectArrows, beacon);
        drawCreativeSearch(x, y, w, h, progress);
        if (!isMenuOpen) return;

        if (progress === 0) {
          drawScrollBar(x, y);
          itemSearchInput.draw(x+80, y+4, 89, 11);
        }

        let i = 0;
        for (let item of filtered) {
          let xIndex = i % 9;
          let yIndex = Math.floor(i/9);
          let rX = x + 9 + xIndex*18 + progress;
          if (rX < x) continue;
          let rY = y + 18 + yIndex*18;
          RenderUtils.drawItem(item, rX, rY, 1, 150);
          RenderUtils.drawSlotHighlightAndTooltip(SBUtils.getLore(item), rX, rY);
          i++;
        }

      }),

      register("guiMouseClick", (mx, my, mb) => {

        if (!isMenuOpen) return;

        currentPageIndex += recipeGui.clicked(currentPages, currentPageIndex, SBUtils, MathUtils, setPages, getFromData, RenderUtils, mb);

        let topLeft = RenderUtils.getInventoryTopLeftCorner();
        let x = Renderer.screen.getWidth() - topLeft[0]+2;
        let y = topLeft[1]+28;
        let searchX = mx - x;
        let searchY = my - y;
        itemSearchInput.isActive = searchX > 80 && searchY > 4 && searchX < 169 && searchY < 15;  

        for (let i = 0; i < history.length; i++) {
          if (!isMenuOpen) break;
          let item = history[i];
          let [rX, rY] = getHistoryTabsPos(x, y, i, tabWidth, tabHeight, 0);
          if (rX < x) continue;
          if (!MathUtils.isMouseOver(rX, rY, tabWidth, tabHeight)) continue;
          setPages(getFromData(SBUtils.getSkyblockId(item)), true, mb);
        }

        let scrollBarPos = getScrollBarPos();
        if (MathUtils.isMouseOver(scrollBarPos[0], scrollBarPos[1], 11, 14)) {
          initialScrollbarY = my;
        }

        for (let i = 0; i < filtered.length; i++) {
          let item = totalFiltered[i+scroll*9];
          let xIndex = i % 9;
          let yIndex = Math.floor(i/9);
          let rX = x + 9 + xIndex*18;
          let rY = y + 18 + yIndex*18;
          if (MathUtils.isMouseOver(rX, rY, 18, 18)) {
            setPages(item, true, mb);
          }
        }

      }),

      register("scrolled", (mx, my, direction) => {
        let topLeft = RenderUtils.getInventoryTopLeftCorner();
        let x = Renderer.screen.getWidth() - topLeft[0]+2;
        let y = topLeft[1]+28;
        let w = 195;
        let h = 135;
        if (!MathUtils.isMouseOver(x, y, w, h)) return;
        scroll = Math.floor(MathUtils.clamp(scroll-direction, 0, Math.floor(totalFiltered.length/9)-1));
        setFiltered();
      }),

      register("dragged", (mdx, mdy, mx, my, mb) => { // scroll bar dragged
        let [rX, rY] = getScrollBarPos();
        if (!MathUtils.isMouseOver(rX, rY-7, 11, 28)) return;
        let diff = (my - initialScrollbarY);
        let amountForOneScroll = 1/Math.floor(totalFiltered.length/9)*95;
        scroll = MathUtils.clamp(
          scroll+diff/amountForOneScroll, 
          0, 
          Math.floor(totalFiltered.length/9)-1);
        setFiltered();
        initialScrollbarY = my;
      })

    ]
  )

  const getTimeInCtItems = (time) => {
    let weeks = Math.floor(time / 604800);
    let days = Math.floor((time % 604800) / 86400);
    let hours = Math.floor(((time % 604800) % 86400) / 3600);
    let minutes = Math.floor((((time % 604800) % 86400) % 3600) / 60);
    let seconds = Math.floor((((time % 604800) % 86400) % 3600) % 60);
  
    const items = [];

    const push = (item) => {
      item.setName(`§6${item.getStackSize()} ${item.getName()}`);
      items.push(item)
    }
  
    if (weeks > 0) push(SBUtils.neuItemToCt(data.items["WEEK"], weeks));
  
    if (days > 0) push(SBUtils.neuItemToCt(data.items["DAY"], days));
  
    if (hours > 0) push(SBUtils.neuItemToCt(data.items["HOUR"], hours));
  
    if (minutes > 0) push(SBUtils.neuItemToCt(data.items["MINUTE"], minutes));
  
    if (seconds > 0) push(SBUtils.neuItemToCt(data.items["SECOND"], seconds));
  
    return items;
  };

  const neuInputToCt = (array) => {
    return array.map(i => {
      let recipeItem = getFromData(i.split(":")[0]);
      let amount = (i.split(":")[1]?? 1);
      return SBUtils.neuItemToCt(recipeItem, amount);
    });
  }

  const getRecipe = (item) => {
    if (!item.recipe) return [];
    return [{
      name: "§6Recipe", 
      command: `recipe ${ChatLib.removeFormatting(item.displayname)}`, 
      content: neuInputToCt(Object.values(item.recipe).slice(0, 9)).concat(SBUtils.neuItemToCt(item, (item.recipe.count?? 1)))
    }]
  }

  const getCost = (item) => {
    let costs = [];

    for (let npc of Object.values(data.npcs)) {
      if (!npc.recipes) continue;
      for (let recipe of npc.recipes) {
        if (!recipe.result) continue;
        if (recipe.result.split(":")[0] !== item.internalname) continue;
        costs.push({
          name: npc.displayname,
          command: data.islands.find(is => is.locraw == npc.island).command,
          content: neuInputToCt(recipe.cost.concat(recipe.result))
        });
      }
    }
    
    for (let recipe of (item.recipes?? [])) {
      switch (recipe?.type) {
        case "forge":
          costs.push({
            name: "§9Forge",
            command: "warp forge",
            content: 
              neuInputToCt(recipe.inputs).concat(
                getTimeInCtItems(recipe.duration),
                SBUtils.neuItemToCt(item, recipe.count)
            )
          });

          break;
        case "katgrade":
          costs.push({
            name: "§dKat",
            command: "warp hub",
            content: 
              [SBUtils.neuItemToCt(data.npcs["KAT_NPC"], 1), SBUtils.neuItemToCt(data.items["SKYBLOCK_COIN"], recipe.coins)]
                .concat(getTimeInCtItems(recipe.time))
                .concat(neuInputToCt(recipe.items.concat(recipe.input)))
                .concat(SBUtils.neuItemToCt(item, 1))
          })
          break;
        default: 
          break;
      }
    }

    return costs;
  }
  
  const getDrops = (item, type) => {
    const matchingBosses = Object.values(type).filter(e => {
      let bool = e.recipes && e.recipes.some(recipe => 
        recipe.drops.some(drop => drop?.id?.split(":")?.[0] === item.internalname)
      )
      return bool;
    });
  
    const matchingRecipes = matchingBosses.reduce((acc, e) => {
      return acc.concat(
        e.recipes.map(recipe => {
          return {recipe: recipe, ownerName: e.internalname} 
        })
        .filter(recipe => 
          recipe.recipe.drops.some(drop => drop?.id?.split(":")?.[0] === item.internalname)
        )
      );
    }, []);
  
    return matchingRecipes.map(recipe => {
      const drop = recipe.recipe.drops.find(d => d?.id?.split(":")?.[0] === item.internalname);
      if (!drop) return;
      const monsterItem = SBUtils.neuItemToCt(type[recipe.ownerName], 1);
      let lore = monsterItem.getLore().slice(1);
      lore.unshift("§c§lDrop Chance §7" + drop.chance);
      if (drop.extra) {
        drop.extra.forEach(line => lore.unshift(line));
      }
      monsterItem.setLore(lore);
      return {
        name: type[recipe.ownerName].displayname,
        content: [monsterItem, SBUtils.neuItemToCt(item, 1)]
      }
    });
  }

  const getRecipeUsages = (usageItem) => {
    let recipes = [];
    for (let item of Object.values(data.items)) {
      if (!item.recipe) continue;
      if (!Object.values(item.recipe).slice(0, 9).map(i => i?.split(":")?.[0]).includes(usageItem.internalname)) continue;
      recipes.push({
        name: "§6Recipe",
        command: `recipe ${ChatLib.removeFormatting(item.displayname)}`, 
        content: neuInputToCt(Object.values(item.recipe).slice(0, 9)).concat(SBUtils.neuItemToCt(item, item.recipe.count?? 1))
      });
    }
    return recipes;
  }

  const getCostUsages = (usageItem) => {
    let costs = [];
    
    for (let item of Object.values(data.items)) {
      for (let recipe of (item.recipes?? [])) {
        switch (recipe?.type) {
          case "forge":
            if (!recipe.inputs.map(i => i?.split(":")?.[0]).includes(usageItem.internalname)) break;
            costs.push({
              name: "§9Forge",
              command: "warp forge",
              content: 
                neuInputToCt(recipe.inputs).concat(
                  getTimeInCtItems(recipe.duration),
                  SBUtils.neuItemToCt(item, recipe.count)
              )
            });
  
            break;
          case "katgrade":
            if (usageItem.internalname !== "KAT_NPC" && !recipe.items.map(i => i?.split(":")?.[0]).concat(recipe.input).includes(usageItem.internalname)) break;
            costs.push({
              name: "§dKat",
              command: "warp hub",
              content: 
                [SBUtils.neuItemToCt(data.npcs["KAT_NPC"], 1), SBUtils.neuItemToCt(data.items["SKYBLOCK_COIN"], recipe.coins)]
                  .concat(getTimeInCtItems(recipe.time))
                  .concat(neuInputToCt(recipe.items.concat(recipe.input)))
                  .concat(SBUtils.neuItemToCt(item, 1))
            })
            break;
          default: 
            break;
        }
      }
    }

    return costs
  }

  const getDropUsages = (usageItem) => {
    if (!usageItem.recipes) return [];
    let ctUsageItem = SBUtils.neuItemToCt(usageItem);
    let drops = [];
    for (let recipe of usageItem.recipes) {
      switch (recipe.type) {
        case "drops":
          if (!recipe.drops) break;
          let command = data.islands.find(is => is.locraw == recipe.panorama)?.command;
          for (let drop of recipe.drops) {
            let item = SBUtils.neuItemToCt(getFromData(drop.id.split(":")[0]), drop.id.split(":")[1]?? 1);
            let lore = item.getLore().slice(1);
            lore.unshift("§c§lDrop Chance §7" + drop.chance);
            if (drop.extra) {
              drop.extra.forEach(line => lore.unshift(line));
            }
            item.setLore(lore);
            drops.push({
              name: usageItem.displayname,
              command: command,
              content: [ctUsageItem, item]
            })
          }
          break;
        case "npc_shop":
          if (!recipe.cost) break;
          drops.push({
            name: usageItem.displayname, 
            command: data.islands.find(is => is.locraw == usageItem.island)?.command, 
            content: neuInputToCt(recipe.cost.concat(recipe.result))
          })
        default:
          break;
      }
    }
    return drops;
  }

})

class RecipeGui {

  _book = new Item("minecraft:book");

  constructor() {
    register("guiClosed", () => {
      this.isOpen = false;
      this.progress = -100;
      this.slide = 0;
    })
  }

  open = () => {
    this.progress = -100;
    this.slide = 0;
    this.isOpen = true;
  }
  
  isOpen = false;
  progress = -100;
  slide = 0;

  draw = (craftingTableTexture, currentPages, currentPageIndex, RenderUtils, SBUtils, MathUtils, selectArrows, beacon) => {
    if (!this.isOpen) return;

    let h = 80;

    this.slide = Math.min(this.slide + 3*(300/Client.getFPS()), 100);
    this.progress = Math.floor(MathUtils.easeInOut(this.slide/100)*h - h);

    let [x, y] = this.getCraftingPos(RenderUtils);
    RenderUtils.draw2dResourceLocation(craftingTableTexture, x-30, y-17,               175, h+this.progress, 0, 175/256, -this.progress/256, 80/256 );
    RenderUtils.draw2dResourceLocation(craftingTableTexture, x-30, y+63+this.progress, 175, 6,               0, 175/256, 159/256,            165/256);

    let items = currentPages[currentPageIndex].content.slice();
    this.itemsForEach((rX, rY, item) => {
      if (rY < y-24) return;
      RenderUtils.drawItem(item, rX, rY, 1, 100);
      RenderUtils.drawStackSize(item, rX, rY, 210);
      RenderUtils.drawSlotHighlightAndTooltip(SBUtils.getLore(item), rX, rY);
    }, x, y, items)

    let leftV = 5;
    let rightV = 5;
    if (MathUtils.isMouseOver(x+60, y+42, 10, 16)) leftV += 32;
    if (MathUtils.isMouseOver(x+75, y+42, 10, 16)) rightV += 32;
    RenderUtils.draw2dResourceLocation(selectArrows, x+75, y+42+this.progress, 10, 16, 16/256, 30/256, (rightV)/256, (rightV+22)/256);
    RenderUtils.draw2dResourceLocation(selectArrows, x+60, y+42+this.progress, 10, 16, 34/256, 48/256, (leftV)/256, (leftV+22)/256);

    if (this.progress > -10) Renderer.drawString(`§7(${currentPageIndex+1}/${currentPages.length}) §f${currentPages[currentPageIndex].name}`,x-26, y-10+this.progress, true);

    if (!currentPages[currentPageIndex].command) return;
    let actionButtonPos = this.getActionButtonPos(x, y);
    let beaconU = 0;
    if (MathUtils.isMouseOver(actionButtonPos[0], actionButtonPos[1], 22, 22)) {
      beaconU += 66;
    }
    RenderUtils.draw2dResourceLocation(beacon, actionButtonPos[0], actionButtonPos[1], 22, 22, beaconU/256, (beaconU+22)/256, 219/256, 241/256);
    if (this.progress > -60) RenderUtils.drawItem(this._book, actionButtonPos[0]+3, actionButtonPos[1]+3, 1, 100);

  }

  clicked = (currentPages, currentPageIndex, SBUtils, MathUtils, setPages, getFromData, RenderUtils, mb) => {
    if (!this.isOpen) return;
    let [x, y] = this.getCraftingPos(RenderUtils);
    let items = currentPages[currentPageIndex].content.slice();
    this.itemsForEach((rX, rY, item) => {
      if (!MathUtils.isMouseOver(rX, rY, 16, 16)) return;
      let newItem = getFromData(SBUtils.getSkyblockId(item));
      setPages(newItem, false, mb);
    }, x, y, items)

    let actionButtonPos = this.getActionButtonPos(x, y);
    if (currentPages[currentPageIndex].command && MathUtils.isMouseOver(actionButtonPos[0], actionButtonPos[1], 22, 22)) {
      ChatLib.command(currentPages[currentPageIndex].command);
      WorldUtils.playSound("gui.button.press", 1, 1);
    }

    let pageIndexOffset = 0;
    if (MathUtils.isMouseOver(x+60, y+42, 10, 16)) {
      if (currentPageIndex > 0) pageIndexOffset = -1;
      WorldUtils.playSound("gui.button.press", 1, 1);
    }
    else if (MathUtils.isMouseOver(x+75, y+42, 10, 16)) {
      if (currentPageIndex < currentPages.length-1) pageIndexOffset = 1;
      WorldUtils.playSound("gui.button.press", 1, 1);
    }
    return pageIndexOffset;
  }

  itemsForEach = (cb, x, y, items) => {
    let popped = items.pop();
    cb(x+94, y+18+this.progress, popped);
    for (let i = 0; i < items.length; i++) {
      let item = items[i];
      if (!item) continue;
      let xI = i % 3;
      let yI = Math.floor(i/3);
      let rX = x + xI*18;
      let rY = y + yI*18+this.progress;
      if (rY < y) continue;
      cb(rX, rY, item);
    }
  }

  getCraftingPos = (RenderUtils) => {
    let topLeft = RenderUtils.getInventoryTopLeftCorner();
    let x = Renderer.screen.getWidth() - topLeft[0]+40;
    let y = topLeft[1]+46+128;
    return [x, y];
  }

  getActionButtonPos = (x, y) => {
    return [x-25, y+43+this.progress];
  }

}