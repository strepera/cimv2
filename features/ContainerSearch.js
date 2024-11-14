import { createFeature } from "../config.js";

createFeature((data, settings, RegUtils, WorldUtils, MathUtils, RenderUtils, ItemUtils, SBUtils) => {

  const getSearchBarPos = () => {
    let renderX = Renderer.screen.getWidth()/2;
    let renderY = (Renderer.screen.getHeight() + 10)/2 - (Player.getContainer()?.getSize()?? 0) - 44;
    if (Client.currentGui?.getClassName() == "GuiChest") renderY += 18;
    return [renderX, renderY];
  }

  const setFoundItems = (term) => {
    found = [];
    if (term.trim() == "") return;
    term = term.toLowerCase();
    new Thread(() => {
      let items = Player.getContainer()?.getItems()?? [];
      for (let i = 0; i < items.length; i++) {
        let item = items[i];
        if (!item) continue;
        if (item.getRawNBT().toLowerCase().includes(term)) found.push(i);
      }
    }).start();
  }

  let found = [];
  const searchBar = new RenderUtils.textInput(false, "&8Search...");
  searchBar.onGuiKey(setFoundItems)
  const w = 72;

  RegUtils.whenContainerNameOpen((name) => (name == "GuiInventory" || name == "GuiChest") && settings.containerSearch && WorldUtils.locraw.gametype == "SKYBLOCK", 
    [

      register("guiRender", () => {
        let [x, y] = getSearchBarPos();
        Renderer.translate(0, 0, 300);
        searchBar.draw(x, y, 0, 10);
        for (let i of found) {
          if (!i) continue;
          RenderUtils.drawIndexedHighlight(i, Renderer.GREEN);
        }
      }),

      register("guiMouseClick", (mx, my) => {
        let [x, y] = getSearchBarPos();
        searchBar.isActive = mx > x && mx < x+w && my > y && my < y+10;
      }),

      register("step", () => {
        setFoundItems(searchBar.text);
      }).setDelay(1)

    ]
  )

  RegUtils.onGuiLoad(() => {
    setFoundItems(searchBar.text);
  })

})