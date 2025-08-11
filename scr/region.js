const MODULE_ID = "regional-deck-draw";

/**
 * Tworzy pole wyboru talii z aktualnej listy kart w grze
 */
function createDeckSelectField() {
  return new foundry.data.fields.StringField({
    required: false,
    label: "RDD.Regions.spawnCards.FIELDS.deckId.label",
    hint: "RDD.Regions.spawnCards.FIELDS.deckId.hint",
    choices: () => {
      const decks = {};
      for (const deck of game.cards) {
        decks[deck.id] = deck.name;
      }
      return decks;
    }
  });
}


const cardsSchema = {
  deckId: createDeckSelectField(),
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
        events: [
          CONST.REGION_EVENTS.TOKEN_ENTER
        ],
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
    if (!event.user.isSelf) return;

    const token = event.data?.token;
    if (!token) return;

    const deckId = this.deckId ?? this.data.deckId;
    const count = this.cardCount ?? this.data.cardCount;

    console.log(`Token ${token.name} triggered card spawn in region: ${this.region.name}`);
    console.log(`Deck ID: ${deckId}, cards to draw: ${count}`);

    const fullyCoveredSquares = this.getFullyContainedGridSquares(this.region);
    console.log("Squares fully inside region:", fullyCoveredSquares);
  }
  _getTerrainEffects() {
    return []; // lub inna odpowiednia wartość zgodnie z API Foundry
  }
  async getFullyContainedGridSquares(region) {
  const grid = canvas.grid;
  const shape = region.shapes; 
  console.log(shape)
  const bounds = shape.bounds;  // prostokąt ograniczający region

  // Pobierz zakres krat w siatce zawartych w bounding box
  const offsetRange = grid.getOffsetRange(bounds);

  const containedCells = [];

  // offsetRange to {x, y, width, height} (kolumny i rzędy)
  for (let row = offsetRange.y; row < offsetRange.y + offsetRange.height; row++) {
    for (let col = offsetRange.x; col < offsetRange.x + offsetRange.width; col++) {
      // pobierz wierzchołki kratki
      const verts = grid.getVertices({x: col, y: row});
      // sprawdź, czy każdy wierzchołek jest w regionie
      const fullyInside = verts.every(pt => shape.contains(pt));
      if (fullyInside) {
        containedCells.push({x: col, y: row});
      }
    }
  }

  return containedCells;
}

}
