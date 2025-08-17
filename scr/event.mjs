import { libWrapper } from './libWrapper/shim.js';

export const registerEvents = () => {
  // --- Event combatStarted ---
  Hooks.on("combatStart", async (combat) => {
  if (!canvas?.scene) return;

  for (const region of canvas.scene.regions) {
    const behavior = region.behaviors.find(b => b.type === "regional-deck-draw.spawnCards");
    if (!behavior) continue;

    if (typeof behavior._handleRegionEvent === "function") {
      try {
        await behavior._handleRegionEvent({
          name: "combatStarted",
          data: {start:true,
            combatID: combat.id},
          region,
          user: game.user ?? (() => { throw new Error("No active user found."); })(),
        });
      } catch (err) {
        console.error("Error calling _handleRegionEvent:", err);
      }
    }
  }
});

Hooks.on("deleteCombat", async (combat) => {
  if (!canvas?.scene) return;

  for (const region of canvas.scene.regions) {
    const behavior = region.behaviors.find(b => b.type === "regional-deck-draw.spawnCards");
    if (!behavior) continue;

    if (typeof behavior._handleRegionEvent === "function") {
      try {
        await behavior._handleRegionEvent({
          name: "combatStarted",
          data:  {start:false,
            combatID: combat.id},
          region,
          user: game.user ?? (() => { throw new Error("No active user found."); })(),
        });
      } catch (err) {
        console.error("Error calling _handleRegionEvent:", err);
      }
    }
  }
});


  // --- Dodanie combatStarted do listy eventów (opcjonalne, jeśli masz UI wyboru eventów) ---
  libWrapper.register(
    'regional-deck-draw',
    'foundry.data.regionBehaviors.RegionBehaviorType._createEventsField',
    function (wrapped, ...args) {
      const field = wrapped(...args);

      if (
        field.element.choices &&
        typeof field.element.choices === 'object' &&
        !Array.isArray(field.element.choices)
      ) {
        field.element.choices['combatStarted'] =
          game.i18n.localize('RDD.combatStartedLabel');
      }
      return field;
    },
    'WRAPPER'
  );
};
