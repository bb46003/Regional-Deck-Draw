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
    const region = this.region;
    const cells = await this.getFullyContainedGridCells(region);
    console.log(cells);

  }
  _getTerrainEffects() {
    return []; // lub inna odpowiednia wartość zgodnie z API Foundry
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
        { x: gx, y: gy, elevation: 1},
        { x: gx + gridSize, y: gy, elevation: 1},
        { x: gx, y: gy + gridSize , elevation:1},
        { x: gx + gridSize, y: gy + gridSize , elevation: 1}
      ];
      const allCornersInside = corners.every(corner => region.testPoint(corner));
      if (allCornersInside) {
        results.push({ x: gx, y: gy });
      }
    }
  }
  return results;
}

}
