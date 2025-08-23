export function registerHandlebarsHelpers() {
  Handlebars.registerHelper({
    eq: (v1, v2) => v1 === v2,
    ne: (v1, v2) => v1 !== v2,
    lt: (v1, v2) => v1 < v2,
    gt: (v1, v2) => v1 > v2,
    lte: (v1, v2) => v1 <= v2,
    gte: (v1, v2) => v1 >= v2,
    and() {
      return Array.prototype.every.call(arguments, Boolean);
    },
    or() {
      return Array.prototype.slice.call(arguments, 0, -1).some(Boolean);
    },
    range: (v1, v2, v3) => checkRange(v1, v2, v3)
  });
  Handlebars.registerHelper("lowercase", function (str) {
    return str.toLowerCase();
  });

  function checkRange(v1, v2, v3) {
    const ouput = v1 >= v2 && v1 <= v3;
    return ouput;
  }

  Handlebars.registerHelper("localizeWithParams", function (key, options) {
    return game.i18n.format(key, options.hash);
  });
  Handlebars.registerHelper("getWartosc", function (actor, actorID, rollingData) {
    const wartoscWiezi = actor.system.wiezi[actorID] ? actor.system.wiezi[actorID].wartosc : null;
    const KM = rollingData.KM;
    const tag = rollingData.wartoscTagu;
    let dopuszczalnaWartoscWiezi;
    const cecha = rollingData.wartoscCechy;
    if (KM === 0 && tag === 0) {
      dopuszczalnaWartoscWiezi = 6 - cecha;
      if (dopuszczalnaWartoscWiezi >= wartoscWiezi) {
        return wartoscWiezi;
      } else {
        return dopuszczalnaWartoscWiezi;
      }
    }
    if (KM !== 0 && tag !== 0) {
      dopuszczalnaWartoscWiezi = 6 - tag;
      if (dopuszczalnaWartoscWiezi >= wartoscWiezi) {
        return wartoscWiezi;
      } else {
        return dopuszczalnaWartoscWiezi;
      }
    }
    if (KM === 0 && tag !== 0) {
      dopuszczalnaWartoscWiezi = 6 - cecha;
      if (dopuszczalnaWartoscWiezi >= wartoscWiezi) {
        return wartoscWiezi;
      } else {
        return dopuszczalnaWartoscWiezi;
      }
    }
  });
  Handlebars.registerHelper("zakres", function (start, end) {
    var result = [];
    const ends = Number(end);
    for (var i = start; i <= ends; i++) {
      result.push(i);
    }
    return result;
  });

  Handlebars.registerHelper("czywiezi", function (rollingData) {
    const KM = rollingData.KM;
    const tag = rollingData.wartoscTagu;
    if (KM === 0 || tag !== 0) {
      const buttonTile = game.i18n.localize("chlopcy.czat.uzyjWiezi");
      const button = ` <h3></h3><div class="rectangle" id="6">${buttonTile}</div>`;
      return button;
    }
  });

  Handlebars.registerHelper("czyextraXP", function (rollingData) {
    const KB = rollingData.KB;
    const dodanoXP = rollingData?.dodanoXP;
    if ((KB === 20 || KB === 10) && dodanoXP === undefined) {
      const buttonTile = game.i18n.localize("chlopcy.czat.dodajXP");
      const button = ` <h3></h3><div class="rectangle" id="7">${buttonTile}</div>`;
      return button;
    }
  });

  Handlebars.registerHelper("wybierzObrazKurtki", function (actor) {
    let obrazKurtki = "systems/chlopcy/art/kurtka-pusta.png";
    const html = `<img class="obraz-kurtki" src="${obrazKurtki}" />`;
    return html;
  });

  Handlebars.registerHelper("czyJestTykacz", function (rollingData) {
    const zegarTykacza = game.chlopcy.zegarTykacza?.instances.size;
    if (zegarTykacza !== 0 && rollingData.iloscOsiagow !== 0) {
      const buttonTile = game.i18n.localize("chlopcy.czat.wykorzystajOsiagiNaTykacz");
      const html = `<div class="rectangle" id="8">${buttonTile}</div> `;
      return html;
    }
  });

  Handlebars.registerHelper("json", function (context) {
    return JSON.stringify(context);
  });

  Handlebars.registerHelper("log", function (log) {
    console.log(log);
  });

  Handlebars.registerHelper("isUserGM", function () {
    const isGM = game.user.isGM;
    return isGM;
  });
  Handlebars.registerHelper("range", function (start, end, options) {
    let result = [];
    for (let i = start; i <= end; i++) {
      result.push(i);
    }
    return result;
  });
}
