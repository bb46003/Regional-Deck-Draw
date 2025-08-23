export class SelectCardDialog extends foundry.applications.api.ApplicationV2 {
  static DEFAULT_OPTIONS = {
    window: { title: "RDD.cardSelector" },
    position: {
      width: 600,
      height: 700
    }
  };
  constructor(deck, count) {
    super();
    this.deck = deck;
    this.count = count;
    this.selectedCards = [];
  }

  static pick(deck, count) {
    return new Promise((resolve) => {
      const dialog = new SelectCardDialog(deck, count);
      dialog._resolve = resolve;
      dialog.render(true);
    });
  }

  async _renderHTML(context, options) {
    const cards = this.deck.cards.map((c) => ({
      id: c.id,
      name: c.name,
      img: c.faces?.[0]?.img ?? c.img
    }));

    return await foundry.applications.handlebars.renderTemplate(
      "modules/regional-deck-draw/templates/select-card-dialog.hbs",
      {
        deck: this.deck,
        count: this.count,
        cards
      }
    );
  }

  async _replaceHTML(result, content, options) {
    content.innerHTML = result;

    const submitButton = document.createElement("button");
    submitButton.type = "button";
    submitButton.textContent = game.i18n.localize("RDD.dialogSubmit");
    submitButton.disabled = true;
    submitButton.style.marginTop = "10px";
    content.appendChild(submitButton);

    const checkboxes = content.querySelectorAll('input[name="selectedCards"]');
    const selectedNumberSpan = content.querySelector("#selected-number");
    const defaultColor = getComputedStyle(selectedNumberSpan).color;

    const updateButtonState = () => {
      const selectedCount = Array.from(checkboxes).filter((c) => c.checked).length;
      selectedNumberSpan.textContent = selectedCount;
      if (selectedCount > this.count) {
        selectedNumberSpan.style.color = "red";
      } else {
        selectedNumberSpan.style.color = defaultColor;
      }

      // przycisk Submit
      submitButton.disabled = selectedCount !== this.count;
    };
    checkboxes.forEach((c) => c.addEventListener("change", updateButtonState));
    checkboxes.forEach((c) => c.addEventListener("change", updateButtonState));
    submitButton.addEventListener("click", async (event) => {
      const selected = Array.from(checkboxes)
        .filter((c) => c.checked)
        .map((c) => c.value);

      await this._onSubmit(event, selected);
    });
  }

  async _onSubmit(event, selectedCards) {
    event.preventDefault();
    this.selectedCards = selectedCards;
    if (this._resolve) this._resolve(this.selectedCards);
    this.close();
  }
}
