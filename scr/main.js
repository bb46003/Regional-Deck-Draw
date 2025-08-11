import { RegionBehaviorCards } from "./region.js";

const MODULE_ID = "regional-deck-draw";
const TYPE = `${MODULE_ID}.spawnCards`;

Hooks.once("ready", () => {
 

  CONFIG.RegionBehavior.dataModels[TYPE] = RegionBehaviorCards;
  CONFIG.RegionBehavior.typeIcons[TYPE] = RegionBehaviorCards.icon;
  CONFIG.RegionBehavior.typeLabels[TYPE] = "RDD.newBehavior";

  console.log(`Registered region behavior ${TYPE} via registerBehavior`);
});



