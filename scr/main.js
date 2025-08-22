import { RegionBehaviorCards } from "./region.js";
import { registerEvents } from "./event.mjs";

const MODULE_ID = "regional-deck-draw";
const TYPE = `${MODULE_ID}.spawnCards`;

Hooks.once("init", () => {
  CONFIG.RegionBehavior.dataModels[TYPE] = RegionBehaviorCards;
  CONFIG.RegionBehavior.typeIcons[TYPE] = RegionBehaviorCards.icon;
  CONFIG.RegionBehavior.typeLabels[TYPE] = "RDD.newBehavior";
  registerEvents();

  console.log(`Registered region behavior ${TYPE} via registerBehavior`);
});

Hooks.on("renderJournalEntrySheet", (sheet, element) => {
  const flag = sheet.document?.flags["regional-deck-draw"];
  if (flag !== undefined) {
    const useElements = element.querySelectorAll(".useCard");

    useElements.forEach((btn) => {
      btn.addEventListener("click", async (ev) => {
        ev.preventDefault();

        const pageName = btn.dataset.pagename;
        const img = btn.dataset.img;

        const page = sheet.document.pages.find((p) => p.name === pageName);
        if (!page) return ui.notifications.warn("Page not found");

        const pageId = page.id;

        await page.delete();

        ChatMessage.create({
          content: `<div class="card-played">
                      <p><strong>${game.i18n.localize("RDD.cardWasUsed")}</strong></p>
                      <img src="${img}" style="max-width:200px; height:auto;">
                    </div>`,
          speaker: ChatMessage.getSpeaker({ user: game.user })
        });


        const notes = canvas.notes.placeables;
        for (let note of notes) {
          const noteFlags = note.document.getFlag("regional-deck-draw", "jurnalPageID");
          if (noteFlags === pageId) {
            await note.document.delete();
          }
        }

        if (sheet.document.pages.size === 0) {
          await sheet.document.delete();
        }
      });
    });
  }
});

Hooks.on("renderRegionBehaviorConfig", (config, element) => {
  if (config.options.document.type === "regional-deck-draw.spawnCards") {

    const cardPattern = /Cards\./;
    const numberOrDice = /^(\d+|d\d+|\d+d\d+)$/;

    const deckInput = element.querySelector('input[name="system.deckId"]');
    const cardCountInput = element.querySelector('input[name="system.cardCount"]');
    const submitButton = element.querySelector('button[type="submit"]');

    // Helper function to check validity
    const validateInputs = () => {
      const deckValid = deckInput ? cardPattern.test(deckInput.value) : true;
      const countValid = cardCountInput ? numberOrDice.test(cardCountInput.value) : true;
      if (submitButton) submitButton.disabled = !(deckValid && countValid);
    };

    // Initial check
    validateInputs();

    // Deck input blur
    if (deckInput) {
      deckInput.addEventListener('blur', (ev) => {
        const valid = cardPattern.test(ev.target.value);
        ev.target.style.border = valid ? "" : "2px solid red";
        if (!valid) ui.notifications.warn(game.i18n.localize("RDD.pleaseInsertCorrectUUid"));
        validateInputs();
      });

      // Also validate while typing
      deckInput.addEventListener('input', validateInputs);
    }

    // Card count input blur
    if (cardCountInput) {
      cardCountInput.addEventListener('blur', (ev) => {
        const valid = numberOrDice.test(ev.target.value);
        ev.target.style.border = valid ? "" : "2px solid red";
        if (!valid) ui.notifications.warn(game.i18n.localize("RDD.inncorectNumberOfCard"));
        validateInputs();
      });

      // Also validate while typing
      cardCountInput.addEventListener('input', validateInputs);
    }
  }
});

Hooks.on("renderJournalEntrySheet",(jurnal, element)=>{
  const flagExist = jurnal.options.document.flags["regional-deck-draw"];
  if(flagExist !== undefined){
    const jurnalSideBar = element.querySelector(".sidebar.journal-sidebar.flexcol");
    jurnalSideBar.style.display = "none";
        const sectionPage = element.querySelector(".journal-page-content");
    sectionPage.style.width = "360px";
    element.style.setProperty("width", "680px", "important");
  }
  console.log(jurnal)
} )
