const MODULE_ID = "regional-deck-draw";

const cardsSchema = {
  deckId: new foundry.data.fields.ArrayField(new foundry.data.fields.StringField({ required: true }),{
    required: true,
    initial:[],
    label: "RDD.Regions.spawnCards.FIELDS.deckId.label",
    hint: "RDD.Regions.spawnCards.FIELDS.deckId.hint"
  }),
  cardCount: new foundry.data.fields.NumberField({
    required: true,
    integer: true,
    min: 1,
    initial: 1,
    label: "RDD.Regions.spawnCards.FIELDS.cardCount.label",
  }),
};

export class RegionBehaviorCards extends foundry.data.regionBehaviors.RegionBehaviorType {
  static type = `${MODULE_ID}.spawnCards`;

  static LOCALIZATION_PREFIXES = ["RDD.Regions.spawnCards"];
  
  static defineSchema() {
    const allWorldDeck = game.cards; // This is a Collection of Card documents
    const decks = {};
    for (const deck of allWorldDeck) {
      decks[deck.id] = [deck.name];
    }
   cardsSchema.deckId.initial = decks;
    return {
      events: this._createEventsField({
        events: [
          CONST.REGION_EVENTS.TOKEN_ENTER,
          // dodaj inne eventy, jeśli chcesz
        ],
      }),
      ...cardsSchema,
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

  get system() {
    return {
      ...super.system,
      type: this.constructor.type,
    };
  }

  async _handleRegionEvent(event) {
    if (!event.user.isSelf) return;

    const token = event.data?.token;
    if (!token) return;

    // Użyj bezpośrednio this.deckId lub fallback na this.data.deckId
    const deckId = this.deckId ?? this.data.deckId;
    const count = this.cardCount ?? this.data.cardCount;

    console.log(`Token ${token.name} triggered card spawn in region: ${this.region.document.name}`);
    console.log(`Deck ID: ${deckId}, cards to draw: ${count}`);

    // Tu dodaj logikę losowania kart i efektów
  }
  static  getDeck() {
  const allWorldDeck = game.cards; // This is a Collection of Card documents

  const decks = {};

  for (const deck of allWorldDeck) {
    decks[deck.id] = deck.name;
  }

  return decks;
}
}
