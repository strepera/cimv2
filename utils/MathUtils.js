class ArraySet {
  constructor(array = []) {
    this.array = array;
  }

  add(newArray) {
    const existingArrays = this.array.filter(arr => 
      arr.length === newArray.length && 
      arr.every((element, index) => element === newArray[index])
    );

    if (existingArrays.length === 0) {
      this.array.push(newArray);
    }
  }

  forEach(callbackfn) {
    return this.array.forEach(callbackfn);
  }
}

export class MathUtils {

  static arraySet = ArraySet;

  static isPointInTriangle(point, v1, v2, v3) {
    const EPSILON = 0.000001;
  
    function sign(p1, p2, p3) {
      return (p1[0] - p3[0]) * (p2[1] - p3[1]) - (p2[0] - p3[0]) * (p1[1] - p3[1]);
    }
  
    const b1 = sign(point, v1, v2) < EPSILON;
    const b2 = sign(point, v2, v3) < EPSILON;
    const b3 = sign(point, v3, v1) < EPSILON;
  
    return ((b1 === b2) && (b2 === b3));
  }

  static forwards3d(x, y, distance, angleInDegrees) {
    const angleInRadians = (angleInDegrees * Math.PI) / 180;
    const newX = x + distance * Math.cos(angleInRadians);
    const newY = y + distance * Math.sin(angleInRadians);
    return { x: newX, y: newY };
  }

  static closeEnough(num1, num2, dist = 0.01) {
    return Math.abs(num1 - num2) < dist;
  }

  static isMouseOver(x, y, w, h) {
    let mx = Client.getMouseX();
    let my = Client.getMouseY();
    return mx > x && mx < x + w && my > y && my < y + h;
  }

  static clamp(num, min, max) {
    return Math.max(Math.min(num, max), min);
  }

  static easeInOut(t) {
    return t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2;
  }

  static getTimeLeft(time) {
    let sign = "";
    if (time < 0) {
      time = -time;
      sign = ' ago';
    }
  
    let weeks = Math.floor(time / 604800);
    let days = Math.floor((time % 604800) / 86400);
    let hours = Math.floor(((time % 604800) % 86400) / 3600);
    let minutes = Math.floor((((time % 604800) % 86400) % 3600) / 60);
    let seconds = Math.floor((((time % 604800) % 86400) % 3600) % 60);
  
    if (weeks >= 1) return `${weeks}w ${days}d${sign}`;
    if (days >= 1) return `${days}d ${hours}h${sign}`;
    if (hours >= 1) return `${hours}h ${minutes}m${sign}`;
    if (minutes >= 1) return `${minutes}m ${seconds}s${sign}`
    return `${seconds}s${sign}`
  }

}