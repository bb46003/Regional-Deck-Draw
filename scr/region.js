const MODULE_ID = "regional-deck-draw";





const cardsSchema = {
  deckId: new foundry.data.fields.StringField({
      required: true,
      initial: "", 
      label: "RDD.Regions.spawnCards.FIELDS.deckId.label",
      hint: "RDD.Regions.spawnCards.FIELDS.deckId.hint"
    }
  ),
  cardCount: new foundry.data.fields.NumberField({
    required: true,
    integer: true,
    min: 1,
    initial: 1,
    label: "RDD.Regions.spawnCards.FIELDS.cardCount.label",
  })
};

export class RegionBehaviorCards extends foundry.data.regionBehaviors.RegionBehaviorType {
  static type = `${MODULE_ID}.spawnCards`;
  static LOCALIZATION_PREFIXES = ["RDD.Regions.spawnCards"];

  static defineSchema() {
    return {
      events: this._createEventsField({
        events: 'combatStarted',
      }),
      ...cardsSchema
    };
  }

  get label() {
    return game.i18n.localize("RDD.newBehavior");
  }

  get description() {
    return game.i18n.localize("RDD.settingTooltip");
  }

  get icon() {
    return "fa-solid fa-cards";
  }

  async _handleRegionEvent(event) {
    console.log(event)
    const deckId = this.deckId ?? this.data.deckId;
    const count = this.cardCount ?? this.data.cardCount;
    console.log(`Deck ID: ${deckId}, cards to draw: ${count}`);

    // Przykład użycia
const region = this.region;
const cells = await this.getFullyContainedGridCells(region);
console.log(cells);

  }
  _getTerrainEffects() {
    return []; // lub inna odpowiednia wartość zgodnie z API Foundry
  }
/**
 * Sprawdza, czy punkt [x,y] jest wewnątrz regionu, uwzględniając dziury
 * @param {Region} region 
 * @param {number} x 
 * @param {number} y 
 * @returns {boolean}
 */
async pointInPolygon(point, polygon) {
  const [x, y] = point;
  let inside = false;
  for (let i = 0, j = polygon.length - 2; i < polygon.length; j = i, i += 2) {
    const xi = polygon[i].X, yi = polygon[i + 1].Y;
    const xj = polygon[j].X, yj = polygon[j + 1].Y;
    const intersect = ((yi < y) && (yj > y)) &&
                      ((xi < x) && (xj > x));
    if (intersect) inside = !inside;
  }
  return inside;
}

/**
 * Sprawdza, czy punkt jest w regionie (w głównych kształtach i poza dziurami)
 * @param {Region} region 
 * @param {number} x 
 * @param {number} y 
 * @returns {boolean}
 */
async isPointInRegion(region, x, y) {
  const shapes = region.shapes.map(s => foundry.data.regionShapes.RegionShape.create(s));

  // Pomocnicza funkcja do wyliczenia skali
  function calculateScale(path, x, y) {
    if (path.length === 0) return 1;
    // Szukamy pierwszego punktu z X i Y != 0 by uniknąć dzielenia przez zero
    for (const p of path) {
      if (x !== 0 && p.X !== 0) {
        return p.X / x;
      }
      if (y !== 0 && p.Y !== 0) {
        return p.Y / y;
      }
    }
    return 1; // fallback skala 1, jeśli nic nie znaleźliśmy
  }
/**
   * Oblicza skalę na podstawie polygonu i punktu
   * @param {Array<{X:number, Y:number}>} path 
   * @param {number} x 
   * @param {number} y 
   * @returns {number} skala (liczba)
   */
  function calculateScale(path, x, y) {
    if (path.length === 0) return 1;
    for (const p of path) {
      if (x !== 0 && p.X !== 0) {
        return p.X / x;
      }
      if (y !== 0 && p.Y !== 0) {
        return p.Y / y;
      }
    }
    return 1; // fallback
  }
  // Pomocnicza funkcja do skalowania punktu
  function scalePoint(x, y, scale) {
    return [x * scale, y * scale];
  }

  // Sprawdzamy, czy punkt jest w którymś z głównych kształtów (nie dziur)
  const inMain = shapes
  .filter(s => !s.isHole)
  .every(shape => {
    return shape.clipperPaths.every(path => {
      const scale = calculateScale(path, region.bounds.x, region.bounds.y);
      const scaledPoint = scalePoint(x, y, scale);
      return     this.pointInPolygon(scaledPoint, path);
    
     
    });
  });
console.log(inMain)
  if (!inMain) return false;

  // Sprawdzamy, czy punkt jest w dziurze (nie może być)
  const inHole = shapes
    .filter(s => s.isHole)
    .some(shape => {
      return shape.clipperPaths.some(path => {
        const scale = calculateScale(path, x, y);
        const scaledPoint = scalePoint(x, y, scale);
        return this.pointInPolygon(scaledPoint, path);
      });
    });

  return !inHole;
}


/**
 * Zwraca tablicę pól siatki {x, y} (górny lewy róg), które w całości mieszczą się w regionie
 * @param {Region} region 
 * @returns {Array<{x:number, y:number}>}
 */
async getFullyContainedGridCells(region) {
  if (!region?.shapes?.length || !canvas?.scene) return [];

  const results = [];
  const gridSize = canvas.grid.size;
  const bounds = region.bounds;

  const startX = Math.floor(bounds.x / gridSize) * gridSize;
  const startY = Math.floor(bounds.y / gridSize) * gridSize;
  const endX = Math.ceil((bounds.x + bounds.width) / gridSize) * gridSize;
  const endY = Math.ceil((bounds.y + bounds.height) / gridSize) * gridSize;

  for (let gx = startX; gx < endX; gx += gridSize) {
    for (let gy = startY; gy < endY; gy += gridSize) {
      // 4 rogi pola
      const corners = [
        { x: gx, y: gy },
        { x: gx + gridSize, y: gy },
        { x: gx, y: gy + gridSize },
        { x: gx + gridSize, y: gy + gridSize }
      ];

      // sprawdzamy czy wszystkie rogi są w regionie
      const inside =await corners.every(async corner => await this.isPointInRegion(region, corner.x, corner.y));

      if (inside) {
        results.push({ x: gx, y: gy });
      }
    }
  }

  return results;
}

}
