const MODULE_ID = "regional-deck-draw";

const cardPattern =  /Cards\./;
const numberOrDice = /^(\d+|d\d+|\d+d\d+)$/;
const cardsSchema = {
  deckId: new foundry.data.fields.StringField({
      required: true,
      initial: "", 
      validator: (value) => {
        if (!cardPattern.test(value)) {
          ui.notifications.warn(
          game.i18n.localize("RDD.pleaseInsertCorrectUUid"),
          );
        }
        return true;
      },
      label: "RDD.Regions.spawnCards.FIELDS.deckId.label",
      hint: "RDD.Regions.spawnCards.FIELDS.deckId.hint"
    }
  ),
  cardCount: new foundry.data.fields.StringField({
    required: true,
         validator: (value) => {
        if (!numberOrDice.test(value)) {
          ui.notifications.warn(
          game.i18n.localize("RDD.inncorectNumberOfCard"),
          );
        }
        return true;
      },
    placeholder: "Insert number or roll formula eg. 1d6, d3 ",
    initial: "",
    label: "RDD.Regions.spawnCards.FIELDS.cardCount.label",
  })
};

export class RegionBehaviorCards extends foundry.data.regionBehaviors.RegionBehaviorType {
  static type = `${MODULE_ID}.spawnCards`;
  static LOCALIZATION_PREFIXES = ["RDD.Regions.spawnCards"];

  static defineSchema() {
    return {
      events: this._createEventsField({
        value: 'combatStarted',
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
  console.log(event);

  // Get deck
  const deckId = this.deckId ?? this.data.deckId;
  const deck = await fromUuid(deckId);    

  // Determine card count
  let count = this.cardCount ?? this.data.cardCount;
  if (count.includes("d")) {
    const newRoll = await new Roll(count).evaluate();
    await newRoll.toMessage({
      flavor: game.i18n.format("RDD.thereWillBeDrownXCard", { roll: newRoll.total, deck: deck.name }),
    });
    count = newRoll.total;
  }

  // Shuffle and draw cards
  await deck.shuffle({ chatNotification: false, updateCards: {} });
  const cards = await deck._drawCards(count, foundry.CONST.CARD_DRAW_MODES.TOP);

  // Get region cells
  const region = this.region;
  const cells = await this.getFullyContainedGridCells(region);
  const cellsCount = cells.length;

  // Generate unique random positions
  let range = [];
  for (let i = 0; i <= cellsCount-1; i++) range.push(i);
  for (let i = range.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [range[i], range[j]] = [range[j], range[i]];
  }
  let randomLocalization = range.slice(0, count);

  // Permissions for everyone
  const permission = { default: CONST.DOCUMENT_OWNERSHIP_LEVELS.OBSERVER };
   const journal = await JournalEntry.create({
    name: `Deck: ${deck.name}`,
    ownership: permission,
    pages: cards.map((card, i) => ({
      name: `Card ${i + 1}`,
      type: "text",
      img: card.faces[0].img,
      content: `<img src="${card.faces[0].img}" style="width:100%; height:auto;">`
    }))
  });

  // Create a journal entry for each card

   const pages = journal.pages; // EmbeddedCollection of JournalEntryPage

// Create a map note for each card pointing to its page
for (let i = 0; i < cards.length; i++) {
  const cellIndex = randomLocalization[i]; // array index
  const cell = cells[cellIndex];

  const page = pages.contents[i]; // get the JournalEntryPage document

  await NoteDocument.create({
    x: cell.x,
    y: cell.y,
    icon: cards[i].faces[0].img,
    entryId: journal.id,
    pageId: page.id,           // reference the embedded page
    label: `Card ${i + 1}`,
    iconSize: canvas.grid.size,
    iconTint: "#FFFFFF",
    textColor: "#000000",
    fontSize: 12,
    fontFamily: "Signika",
  });
  }
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
