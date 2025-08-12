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





