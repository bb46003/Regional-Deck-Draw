const MODULE_ID = "regional-deck-draw";

const cardsSchema = {
  deckId: new foundry.data.fields.StringField({
    required: true,
    initial: "",
    label: "RDD.Regions.spawnCards.FIELDS.deckId.label",
    hint: "RDD.Regions.spawnCards.FIELDS.deckId.hint"
  }),
  cardCount: new foundry.data.fields.StringField({
    required: true,
    initial: "",
    label: "RDD.Regions.spawnCards.FIELDS.cardCount.label"
  }),
  pickUpCard: new foundry.data.fields.BooleanField({
    required: true,
    initial: false,
    label: "RDD.Regions.spawnCards.FIELDS.pickUpCard.label"
  })
};
import { SelectCardDialog } from "./select-card.mjs";
export class RegionBehaviorCards extends foundry.data.regionBehaviors.RegionBehaviorType {
  static type = `${MODULE_ID}.spawnCards`;
  static LOCALIZATION_PREFIXES = ["RDD.Regions.spawnCards"];

  static defineSchema() {
    return {
      events: this._createEventsField({ events: "combatStarted" }),
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
    const isGM = game.user.isGM;
    if (isGM) {
      if (event.data.start) {
        const deckId = this.deckId ?? this.data.deckId;
        const deck = await fromUuid(deckId);

        // Determine card count
        let count = this.cardCount ?? this.data.cardCount;
        if (count.includes("d")) {
          const newRoll = await new Roll(count).evaluate();
          await newRoll.toMessage({
            flavor: game.i18n.format("RDD.thereWillBeDrawnXCard", {
              roll: newRoll.total,
              deck: deck.name
            })
          });
          count = newRoll.total;
        }

        // Shuffle and draw cards
        await deck.shuffle({ chatNotification: false, updateCards: {} });
        let cards;
        if (this.pickUpCard) {
          const selectedCardIds = await SelectCardDialog.pick(deck, count);
          cards = deck.cards.filter((c) => selectedCardIds.includes(c.id));
        } else {
          cards = await deck._drawCards(count, foundry.CONST.CARD_DRAW_MODES.TOP);
        }

        // Get region cells
        const region = this.region;
        const cells = await this.getFullyContainedGridCells(region);
        const cellsCount = cells.length;

        // Generate unique random positions
        let range = [];
        for (let i = 0; i <= cellsCount - 1; i++) range.push(i);
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
          flags: {
            "regional-deck-draw": {
              combat: event.data.combatID
            }
          },
          pages: cards.map((card, i) => ({
            name: `Card ${i + 1}`,
            type: "text",
            text: {
              content: `<section style="display: flex; flex-direction: column; align-items: center;">
  <a class="useCard" style="font-size:40px" data-pageName="Card ${i + 1}"
     data-img="${card.faces[0].img}">${game.i18n.localize("RDD.useCard")}</a><br>
  <img src="${card.faces[0].img}" style="width:360px; height:auto;">
</section>`
            },
            sort: i,
            ownership: permission,
            flags: {
              "regional-deck-draw": {
                cardId: card.id,
                index: i
              }
            },
            system: {}
          }))
        });

        // Create a journal entry for each card

        const pages = journal.pages; // EmbeddedCollection of JournalEntryPage

        // Create a map note for each card pointing to its page
        for (let i = 0; i < cards.length; i++) {
          const cellIndex = randomLocalization[i]; // array index
          const cell = cells[cellIndex];
          const page = pages.contents[i]; // JournalEntryPage document

          await NoteDocument.create(
            {
              flags: {
                "regional-deck-draw": {
                  jurnalPageID: page.id,
                  combat: event.data.combatID
                }
              },
              x: cell.x + canvas.grid.size / 2,
              y: cell.y + canvas.grid.size / 2,
              icon: cards[i].faces[0].img,
              entryId: journal.id,
              pageId: page.id,
              label: `Card ${i + 1}`,
              iconSize: canvas.grid.size,
              iconTint: "#FFFFFF",
              textColor: "#000000",
              fontSize: 12,
              fontFamily: "Signika",
              texture: { src: deck.img }
            },
            { parent: canvas.scene }
          );
        }
      } else {
        const notes = canvas.notes.placeables;

        // Filter notes that match the combat ID
        const notesToDelete = notes.filter(
          (note) => note.document.getFlag("regional-deck-draw", "combat") === event.data.combatID
        );

        // Delete all matching notes in parallel
        await Promise.all(notesToDelete.map((note) => note.document.delete()));
        const jurnals = game.journal;
        for (let jurnal of jurnals) {
          const combatFlag = jurnal.getFlag("regional-deck-draw", "combat");
          if (combatFlag === event.data.combatID) {
            await jurnal.delete();
          }
        }
      }
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
          { x: gx, y: gy, elevation: 1 },
          { x: gx + gridSize, y: gy, elevation: 1 },
          { x: gx, y: gy + gridSize, elevation: 1 },
          { x: gx + gridSize, y: gy + gridSize, elevation: 1 }
        ];
        const allCornersInside = corners.every((corner) => region.testPoint(corner));
        if (allCornersInside) {
          results.push({ x: gx, y: gy });
        }
      }
    }
    return results;
  }
}
