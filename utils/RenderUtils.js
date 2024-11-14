const letters = [
  'a', 'b', 'c', 'd', 'e', 'f',
  'g', 'h', 'i', 'j', 'k',
  'l', 'm', 'n', 'o', 'p', 'q',
  'r', 's', 't', 'u', 'v', 'w',
  'x', 'y', 'z', '_', ' ', '-', '+', '.', ',', '[', ']', '{', '}', '(', ')', '&', "'", '"',
  '0', '1', '2', '3', '4', '5', '6', '7', '8', '9'
]

class TextInput {

  isCtrlDown = false;
  selection = [0, 0];

  constructor(singleUse, placeholderText) {

    this.placeholderText = placeholderText;

    let regs = [

      register("guiKey", (char, keyCode, gui, event) => {
        if (!this.isActive) return;
        cancel(event);
        switch (keyCode) {
          case 28:
            this._onEnter.forEach(cb => cb(this.text));
            if (!singleUse) break;
            regs.forEach(reg => reg.unregister());
            return;
          case 1:
            this.isActive = false;
            Client.currentGui.close();
            break;
          case 14:
            this.text = this.text.slice(this.selection[1], this.text.length);
            this.selection = [0, 0];
            if (this.pointerIndex < this.text.length) {
              this.text = this.text.slice(0, this.text.length-this.pointerIndex - 1) + this.text.slice(this.text.length-this.pointerIndex, this.text.length);
            }
            if (this.isCtrlDown) {
              for (let i = this.text.length-1; i > -1 && this.text[i] !== " "; i--) {
                this.text = this.text.slice(0, i);
              }
            }
            this._onGuiKeys.forEach(cb => {cb(this.text)});
            break;
          case 211:
            if (this.pointerIndex > 0) {
              this.text = this.text.slice(0, this.text.length-this.pointerIndex) + this.text.slice(this.text.length-this.pointerIndex + 1, this.text.length);
              this.pointerIndex--;
              this._onGuiKeys.forEach(cb => {cb(this.text)});
            }
            break;
          case 203:
            this.selection = [0, 0];
            if (this.pointerIndex < this.text.length) {
              this.pointerIndex++;
            }
            break;
          case 205:
            this.selection = [0, 0];
            if (this.pointerIndex > 0) {
              this.pointerIndex--;
            }
            break;
          case 30:
            if (!this.isCtrlDown) break;
            this.selection = [0, this.text.length];
            break;
          default:
            break;
        }
        if (!letters.includes(ChatLib.removeFormatting(char).toLowerCase())) return;
        this.text = this.text.slice(this.selection[1], this.text.length);
        this.selection = [0, 0];
        this.text = this.text.slice(0, this.text.length-this.pointerIndex) + char + this.text.slice(this.text.length-this.pointerIndex, this.text.length);
        this._onGuiKeys.forEach(cb => {cb(this.text)});
      }),

      register("guiClosed", () => {
        this.isActive = false;
        this.isCtrlDown = false;
      })

    ]

  }

  draw(x, y, w, h) {
    if (this.text.trim() == "" && this.placeholderText) {
      Renderer.drawString(this.placeholderText, x+2, y+2, true);
    }
    else {
      Renderer.drawString(this.text, x+2, y+2, true);
    }
    if (!this.isActive) return;
    this.isCtrlDown = Keyboard.isKeyDown(29);
    let width = Renderer.getStringWidth(this.text.slice(0, this.text.length - this.pointerIndex));
    let beginning = Renderer.getStringWidth(this.text.slice(0, this.selection[0]));
    let mid = Renderer.getStringWidth(this.text.slice(this.selection[0], this.selection[1]));
    Renderer.drawRect(Renderer.color(50, 150, 50, 100), x+2+beginning, y+2, mid, 10);
    Renderer.drawLine(Renderer.color(220, 220, 220), x+width+2, y+h-1.5, x+width+8, y+h-1.5, 1.5);
  }

  onGuiKey(cb) {
    this._onGuiKeys.push(cb);
  }

  onEnter(cb) {
    this._onEnter.push(cb);
  }

  _onGuiKeys = [];
  _onEnter = [];

  pointerIndex = 0;

  text = "";

  isActive = false;
}

export class RenderUtils {

  static pushPop(cb) {
    Tessellator.pushMatrix();
    cb();
    Tessellator.popMatrix();
  }

  static draw3dTriangle(x, y, z, xrot, yrot, zrot, baseLength, height, lineWidth) {
    Tessellator.pushMatrix();
    GL11.glLineWidth(lineWidth);
    Tessellator.blendFunc(770, 771);
    Tessellator.enableBlend();
    Tessellator.disableTexture2D();
  
    Tessellator.rotate(xrot, 1, 0, 0);
    Tessellator.rotate(yrot, 0, 1, 0);
    Tessellator.rotate(zrot, 0, 0, 1);
    Tessellator.begin(GL11.GL_LINE_STRIP);
    Tessellator.pos(x, y, z).tex(0, 0);
    Tessellator.pos(x+baseLength, y, z+height).tex(0, 0);
    Tessellator.pos(x-baseLength, y, z+height).tex(0, 0);
    Tessellator.pos(x, y, z).tex(0, 0);
    Tessellator.draw();
  
    Tessellator.enableTexture2D();
    Tessellator.disableBlend();
    Tessellator.popMatrix();
  }

  static drawEspBox(x, y, z, w, h, red, green, blue, alpha, phase, thickness) {
    Tessellator.pushMatrix();
    GL11.glLineWidth(thickness);
    GlStateManager.func_179129_p(); // disableCullFace
    Tessellator.enableBlend();
    Tessellator.blendFunc(770, 771);
    Tessellator.depthMask(false);
    Tessellator.disableTexture2D();
  
    if (phase) {
      Tessellator.disableDepth();
    }
  
    const locations = [
      //    x, y, z    x, y, z
      [
          [0, 0, 0],
          [w, 0, 0],
      ],
      [
          [0, 0, 0],
          [0, 0, w],
      ],
      [
          [w, 0, w],
          [w, 0, 0],
      ],
      [
          [w, 0, w],
          [0, 0, w],
      ],
    
      [
          [0, h, 0],
          [w, h, 0],
      ],
      [
          [0, h, 0],
          [0, h, w],
      ],
      [
          [w, h, w],
          [w, h, 0],
      ],
      [
          [w, h, w],
          [0, h, w],
      ],
    
      [
          [0, 0, 0],
          [0, h, 0],
      ],
      [
          [w, 0, 0],
          [w, h, 0],
      ],
      [
          [0, 0, w],
          [0, h, w],
      ],
      [
          [w, 0, w],
          [w, h, w],
      ],
    ];
  
    locations.forEach((loc) => {
      Tessellator.begin(3).colorize(red, green, blue, alpha);
  
      Tessellator.pos(x + loc[0][0] - w / 2, y + loc[0][1], z + loc[0][2] - w / 2).tex(0, 0);
  
      Tessellator.pos(x + loc[1][0] - w / 2, y + loc[1][1], z + loc[1][2] - w / 2).tex(0, 0);
  
      Tessellator.draw();
    });
  
    GlStateManager.func_179089_o(); // enableCull
    Tessellator.disableBlend();
    Tessellator.depthMask(true);
    Tessellator.enableTexture2D();
  
    if (phase) {
      Tessellator.enableDepth();
    }
    
    Tessellator.popMatrix();
  }

  static drawFilledBox(x, y, z, w, h, red, green, blue, alpha, phase) {
    Tessellator.pushMatrix();
    GL11.glLineWidth(2.0);
    GlStateManager.func_179129_p(); // disableCullFace
    Tessellator.enableBlend();
    Tessellator.blendFunc(770, 771);
    Tessellator.depthMask(false);
    Tessellator.disableTexture2D();

    if (phase) {
        Tessellator.disableDepth();
    }

    w /= 2;

    Tessellator.begin(GL11.GL_QUADS, false);
    Tessellator.colorize(red, green, blue, alpha);

    Tessellator.translate(x, y, z)
        .pos(w, 0, w)
        .pos(w, 0, -w)
        .pos(-w, 0, -w)
        .pos(-w, 0, w)

        .pos(w, h, w)
        .pos(w, h, -w)
        .pos(-w, h, -w)
        .pos(-w, h, w)

        .pos(-w, h, w)
        .pos(-w, h, -w)
        .pos(-w, 0, -w)
        .pos(-w, 0, w)

        .pos(w, h, w)
        .pos(w, h, -w)
        .pos(w, 0, -w)
        .pos(w, 0, w)

        .pos(w, h, -w)
        .pos(-w, h, -w)
        .pos(-w, 0, -w)
        .pos(w, 0, -w)

        .pos(-w, h, w)
        .pos(w, h, w)
        .pos(w, 0, w)
        .pos(-w, 0, w)
        .draw();

    GlStateManager.func_179089_o(); // enableCull
    Tessellator.disableBlend();
    Tessellator.depthMask(true);
    Tessellator.enableTexture2D();
    if (phase) {
        Tessellator.enableDepth();
    }

    Tessellator.popMatrix();
  }

  static ResourceLocation = Java.type("net.minecraft.util.ResourceLocation");

  static textureManager = Client.getMinecraft().func_110434_K();

  static bindTexture(resource) {
    this.textureManager.func_110577_a(resource);
  }

  static _locationBlocksTexture = net.minecraft.client.renderer.texture.TextureMap.field_110575_b;

  static draw2dResourceLocation(resource, x, y, w, h, uMin, uMax, vMin, vMax) {

    this.bindTexture(resource);

    GL11.glBegin(GL11.GL_QUADS);
    GL11.glTexCoord2f(uMin, vMax)
    GL11.glVertex2f(x, y + h);
    GL11.glTexCoord2f(uMax, vMax)
    GL11.glVertex2f(x + w, y + h);
    GL11.glTexCoord2f(uMax, vMin)
    GL11.glVertex2f(x + w, y);
    GL11.glTexCoord2f(uMin, vMin)
    GL11.glVertex2f(x, y);
    GL11.glEnd();

    this.bindTexture(this._locationBlocksTexture);

  }

  static getInventoryTopLeftCorner() {
    let renderX = Renderer.screen.getWidth()/2 - 84;
    let renderY = (Renderer.screen.getHeight() + 10)/2 - (Player.getContainer()?.getSize()?? 0) - 71;
    if (Client.currentGui?.getClassName() == "GuiChest") renderY += 17;
    return [renderX, renderY];
  }

  static textInput = TextInput;

  static drawItem(item, x, y, scale, z) {
    if (!scale) scale = 1;
    if (!z) z = 200;
    item.draw(x, y, scale, z);
  }

  static _getSuffix(num) {
    num = Math.abs(num);
    if (num >= 1000000000000) return "T";
    else if (num >= 1000000000) return "B";
    else if (num >= 1000000) return "M";
    else if (num >= 1000) return "k";
    return "";
  }
  
  static _suffixes = {
    "T": 1000000000000,
    "B": 1000000000,
    "M": 1000000,
    "k": 1000,
    "": 1
  }

  static formatNumber(num, decimals = 2) {
    num = parseFloat(num);
    if (!num) return 0;
    if (num < 1000 && num > -1000) return Math.floor(num);
  
    const suffix = this._getSuffix(num);
    num /= this._suffixes[suffix];
  
    if (num.toFixed(decimals).endsWith(("0".repeat(decimals)))) {
      return Math.floor(num) + suffix;
    }
    return num.toFixed(decimals) + suffix;
  }

  static drawStackSize(item, x, y, z) {
    if (!z) z = 400;
    let stackSize = item.getStackSize();
    if (stackSize <= 1) return;
    if (stackSize > 999) {
      stackSize = this.formatNumber(stackSize, 0);
    }
    Tessellator.pushMatrix();
    Renderer.translate(0, 0, z);
    Renderer.drawString(stackSize, x + (3 - stackSize.toString().length) * 5 + 1, y + 9, true);
    Tessellator.popMatrix();
  }

  static fontRenderer = Renderer.getFontRenderer();
  static GuiUtils = net.minecraftforge.fml.client.config.GuiUtils;

  static drawTooltip(lines, x, y) {
    this.tooltips.push({lines: lines, x: x, y: y});
  }

  static drawSlotHighlight(x, y) {
    Renderer.drawRect(Renderer.color(255, 255, 255, 150), x, y, 16, 16);
  }

  static tooltips = [];

  static init() {
    register("postGuiRender", () => {

      Tessellator.pushMatrix();
      let i = this.tooltips.length;
      while (i--) {
        let tooltip = this.tooltips[i];
        this.GuiUtils.drawHoveringText(
          tooltip.lines,
          tooltip.x,
          tooltip.y,
          Renderer.screen.getWidth(),
          Renderer.screen.getHeight(),
          500,
          this.fontRenderer
        );
      }
      this.tooltips = [];
      Tessellator.popMatrix();

    })
  }

  static drawSlotHighlightAndTooltip(lore, rX, rY) {
    let mx = Client.getMouseX();
    let my = Client.getMouseY();
    if (mx > rX && mx < rX+18 && my > rY && my < rY+18) {
      RenderUtils.drawSlotHighlight(rX, rY);
      RenderUtils.drawTooltip(lore, mx, my);
      return true;
    }
    return false;
  }

  static tabsResource = new net.minecraft.util.ResourceLocation("textures/gui/container/creative_inventory/tabs.png");

  static drawTab(x, y, index, w, h) {

    let vIndex = Math.floor(index/9);
    let hIndex = index % 9;

    let uMin = hIndex * w / 256;
    let uMax = (hIndex + 1) * w / 256;
    let vMin = vIndex * h / 256;
    let vMax = (vIndex + 1) * h / 256;

    this.draw2dResourceLocation(this.tabsResource, x, y, w, h, uMin, uMax, vMin, vMax);

  }

  static getInventoryPosIndexFromIndex(index) {
    let maxSlot = Player.getContainer().getSize();
    let name = Client.currentGui.getClassName();
    let x = index % 9;
    let y = Math.floor(index / 9);
    if (name == "GuiInventory") {
      if (index < 5) return;
      if (index < 9) {
        x = 8 - x;
        y -= x + 0.2;
        x = 0;
      }
      if (index > 35) y += 1.93;
      else y += 1.72;
    }
    else {
      if (index > maxSlot - 37) {
        y += 0.71;
        if (maxSlot - index < 10) {
          y += 0.23;
        }
      }
    }
    return [x, y];
  }
  
  static getRenderPosFromInventoryIndex(x, y) {
    let maxSlot = Player.getContainer().getSize();
    let renderX = Renderer.screen.getWidth() / 2 + ((x - 4) * 18) - 8;
    let renderY = (Renderer.screen.getHeight() + 10) / 2 + ((y - maxSlot / 18) * 18) - 8;
    return [renderX, renderY];
  }
  
  static drawIndexedHighlight(index, colour) {
    let [x, y] = RenderUtils.getInventoryPosIndexFromIndex(index);
    if (!x || !y) return;
  
    let [renderX, renderY] = RenderUtils.getRenderPosFromInventoryIndex(x, y);
  
    Renderer.translate(0, 0, 200);
    Renderer.drawRect(colour, renderX, renderY, 16, 16);
  }
  
}