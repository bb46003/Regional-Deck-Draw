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

    useElements.forEach(btn => {
      btn.addEventListener("click", async ev => {
        ev.preventDefault();

        const pageName = btn.dataset.pagename;
        const img = btn.dataset.img;

        // 1. Find page by name
        const page = sheet.document.pages.find(p => p.name === pageName);
        if (!page) return ui.notifications.warn("Page not found");

        // Keep ID before delete
        const pageId = page.id;

        // 2. Delete the page
        await page.delete();

        // 3. Send chat message
        ChatMessage.create({
          content: `<div class="card-played">
                      <p><strong>${game.i18n.localize("RDD.cardWasUsed")}</strong></p>
                      <img src="${img}" style="max-width:200px; height:auto;">
                    </div>`,
          speaker: ChatMessage.getSpeaker({ user: game.user })
        });

        // 4. Remove any canvas note linked to this page
        const notes = canvas.notes.placeables;
        for (let note of notes) {
          const noteFlags = note.document.getFlag("regional-deck-draw", "jurnalPageID");
          if (noteFlags === pageId) {
            await note.document.delete();
          }
        }

        // 5. If journal is empty → delete the whole journal
        if (sheet.document.pages.size === 0) {
          await sheet.document.delete();
        }
      });
    });
  }
});



