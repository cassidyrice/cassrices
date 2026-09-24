(function (root, factory) {
  if (typeof module === "object" && module.exports) {
    module.exports = factory();
  } else {
    root.QuotePricing = factory();
  }
})(typeof self !== "undefined" ? self : this, function () {
  var SERVICES = {
    lawn: {
      id: "lawn",
      name: "Lawn care",
      summary: "Mow, edge, and leave the yard neat.",
      holds: "This is the visit price when the yard matches your answers.",
      boundary: "Haul-away, overgrowth, and storm debris are priced before any extra work starts.",
      questions: [
        {
          id: "size",
          prompt: "How big is the yard?",
          hint: "A rough size is enough.",
          options: [
            { id: "small", label: "Small", detail: "Courtyard or townhouse", amount: 55, line: "Small yard" },
            { id: "medium", label: "Medium", detail: "Typical suburban lot", amount: 85, line: "Medium yard" },
            { id: "large", label: "Large", detail: "Big lot or corner property", amount: 125, line: "Large yard" },
            { id: "xl", label: "Extra large", detail: "Over about half an acre", amount: 185, line: "Extra-large yard" }
          ]
        },
        {
          id: "level",
          prompt: "What should the visit include?",
          hint: "Pick the finish you want.",
          options: [
            { id: "mow", label: "Mow and edge", detail: "Grass cut and edges trimmed", amount: 0, line: "Mow and edge", includes: "Mowing and string-trimming the edges" },
            { id: "blow", label: "Mow, edge, and blow", detail: "Also clear walks and the driveway", amount: 15, line: "Blow off hard surfaces", includes: "Mowing, edging, and blowing clippings off walks and the driveway" },
            { id: "tidy", label: "Full yard tidy", detail: "Beds included", amount: 40, line: "Bed tidy", includes: "Mowing, edging, blowing, and a tidy pass on planted beds" }
          ]
        },
        {
          id: "frequency",
          prompt: "How often?",
          hint: "Weekly visits cost less per stop.",
          options: [
            { id: "weekly", label: "Weekly", detail: "Same route each week", multiplier: 0.9, line: "Weekly route", unit: "per visit" },
            { id: "biweekly", label: "Every two weeks", detail: "The usual cadence", multiplier: 1, line: "Every two weeks", unit: "per visit" },
            { id: "once", label: "Just this once", detail: "A single visit", multiplier: 1.25, line: "One-time visit", unit: "for this visit" }
          ]
        }
      ]
    },
    cleaning: {
      id: "cleaning",
      name: "House cleaning",
      summary: "A priced clean for the home you described.",
      holds: "This is the price when the home matches the size and condition you chose.",
      boundary: "Heavy restoration, biohazards, and exterior work are priced before they start.",
      questions: [
        {
          id: "size",
          prompt: "How big is the home?",
          hint: "Count bedrooms the way you would in a listing.",
          options: [
            { id: "studio", label: "Studio", detail: "Or a one-bath place", amount: 89, line: "Studio or one bath" },
            { id: "small", label: "1–2 bedrooms", detail: "Apartment or small house", amount: 139, line: "1–2 bedrooms" },
            { id: "mid", label: "3 bedrooms", detail: "A typical family home", amount: 189, line: "3 bedrooms" },
            { id: "large", label: "4+ bedrooms", detail: "A larger house", amount: 249, line: "4 or more bedrooms" }
          ]
        },
        {
          id: "type",
          prompt: "What kind of clean?",
          hint: "Deeper cleans take longer.",
          options: [
            { id: "regular", label: "Regular upkeep", detail: "A maintained home", multiplier: 1, line: "Regular upkeep", includes: "Kitchen, baths, floors, and surfaces" },
            { id: "deep", label: "Deep clean", detail: "Detail work included", multiplier: 1.45, line: "Deep clean", includes: "A full upkeep clean plus baseboards, inside appliances, and detail work" },
            { id: "move", label: "Move-in or move-out", detail: "Empty-home clean", multiplier: 1.7, line: "Move-in / move-out", includes: "An empty-home clean, inside cabinets, and appliances" }
          ]
        },
        {
          id: "condition",
          prompt: "What will we walk into?",
          hint: "This sets the time, not a penalty.",
          options: [
            { id: "tidy", label: "Already tidy", detail: "Just needs a full clean", multiplier: 1, line: "Already tidy" },
            { id: "normal", label: "Lived-in", detail: "Everyday clutter", multiplier: 1.12, line: "Lived-in condition" },
            { id: "heavy", label: "Needs extra time", detail: "Built-up mess or neglect", multiplier: 1.28, line: "Extra time" }
          ]
        }
      ]
    },
    handyman: {
      id: "handyman",
      name: "Handyman",
      summary: "Labor for a small repair visit.",
      holds: "This quote covers labor for the job you described.",
      boundary: "Parts and materials are billed at cost if we supply them, and only after you approve them.",
      questions: [
        {
          id: "job",
          prompt: "What kind of job?",
          hint: "Choose the closest match.",
          options: [
            { id: "mount", label: "Hang or mount", detail: "TVs, shelves, art, curtains", amount: 85, line: "Hang or mount", includes: "Mounting or hanging the items you listed" },
            { id: "assembly", label: "Assemble furniture", detail: "Flat-pack and similar", amount: 99, line: "Furniture assembly", includes: "Assembly of the furniture you listed" },
            { id: "drywall", label: "Patch drywall", detail: "Holes and small repairs", amount: 159, line: "Drywall patch", includes: "Patching the drywall you described" },
            { id: "fixture", label: "Swap a fixture", detail: "A light, faucet, or similar", amount: 129, line: "Fixture swap", includes: "Swapping the fixture you described" },
            { id: "repair", label: "Small repair", detail: "A straightforward fix", amount: 109, line: "Small repair", includes: "The small repair you described" }
          ]
        },
        {
          id: "quantity",
          prompt: "How much is there?",
          hint: "A half-day list is priced as a block of labor.",
          options: [
            { id: "one", label: "One item", detail: "A single task", multiplier: 1, line: "One item" },
            { id: "few", label: "Two or three", detail: "A short list", multiplier: 1.8, line: "Two or three items" },
            { id: "half", label: "A half-day list", detail: "Several tasks, one visit", multiplier: 2.75, line: "Half-day list" }
          ]
        },
        {
          id: "access",
          prompt: "Anything that makes it harder?",
          hint: "Say so now so the price stays honest.",
          options: [
            { id: "easy", label: "Easy access", detail: "Ground level, one person", amount: 0, line: "Easy access" },
            { id: "ladder", label: "Needs a ladder", detail: "High work, still one person", amount: 29, line: "Ladder work" },
            { id: "crew", label: "Needs two people", detail: "Heavy, awkward, or safer with two", amount: 69, line: "Two-person visit" }
          ]
        }
      ]
    }
  };

  var PRESETS = {
    lawn: { size: "small", level: "mow", frequency: "weekly" },
    cleaning: { size: "studio", type: "regular", condition: "tidy" },
    handyman: { job: "mount", quantity: "one", access: "easy" }
  };

  function option(service, questionId, optionId) {
    var question = service.questions.filter(function (q) { return q.id === questionId; })[0];
    if (!question) return null;
    return question.options.filter(function (item) { return item.id === optionId; })[0] || null;
  }

  function requireAnswers(service, answers) {
    service.questions.forEach(function (question) {
      if (!option(service, question.id, answers[question.id])) {
        throw new Error("Missing answer: " + question.id);
      }
    });
  }

  function linesFrom(parts) {
    return parts.filter(function (part) { return part && part.amount !== 0; });
  }

  function priceLawn(service, answers) {
    var size = option(service, "size", answers.size);
    var level = option(service, "level", answers.level);
    var frequency = option(service, "frequency", answers.frequency);
    var subtotal = size.amount + level.amount;
    var total = Math.round(subtotal * frequency.multiplier);
    return {
      total: total,
      unit: frequency.unit,
      title: service.name,
      subtitle: [size.label, level.label, frequency.label].join(" · "),
      lines: linesFrom([
        { label: size.line, amount: size.amount },
        { label: level.line, amount: level.amount },
        { label: frequency.line, amount: total - subtotal }
      ]),
      includes: [level.includes],
      holds: service.holds,
      boundary: service.boundary
    };
  }

  function priceCleaning(service, answers) {
    var size = option(service, "size", answers.size);
    var type = option(service, "type", answers.type);
    var condition = option(service, "condition", answers.condition);
    var typed = Math.round(size.amount * type.multiplier);
    var total = Math.round(typed * condition.multiplier);
    return {
      total: total,
      unit: "for this clean",
      title: service.name,
      subtitle: [size.label, type.label, condition.label].join(" · "),
      lines: linesFrom([
        { label: size.line, amount: size.amount },
        { label: type.line, amount: typed - size.amount },
        { label: condition.line, amount: total - typed }
      ]),
      includes: [type.includes],
      holds: service.holds,
      boundary: service.boundary
    };
  }

  function priceHandyman(service, answers) {
    var job = option(service, "job", answers.job);
    var quantity = option(service, "quantity", answers.quantity);
    var access = option(service, "access", answers.access);
    var labor = Math.round(job.amount * quantity.multiplier);
    var total = labor + access.amount;
    return {
      total: total,
      unit: "for this visit",
      title: service.name,
      subtitle: [job.label, quantity.label, access.label].join(" · "),
      lines: linesFrom([
        { label: job.line, amount: job.amount },
        { label: quantity.line, amount: labor - job.amount },
        { label: access.line, amount: access.amount }
      ]),
      includes: [job.includes],
      holds: service.holds,
      boundary: service.boundary
    };
  }

  var PRICERS = {
    lawn: priceLawn,
    cleaning: priceCleaning,
    handyman: priceHandyman
  };

  function quote(serviceId, answers) {
    var service = SERVICES[serviceId];
    if (!service) throw new Error("Unknown service: " + serviceId);
    var pricer = PRICERS[serviceId];
    if (!pricer) throw new Error("Unknown service: " + serviceId);
    requireAnswers(service, answers || {});
    var priced = pricer(service, answers);
    var sum = priced.lines.reduce(function (total, line) { return total + line.amount; }, 0);
    if (sum !== priced.total) {
      throw new Error("Quote lines do not add up for " + serviceId);
    }
    return priced;
  }

  function startingPrice(serviceId) {
    return quote(serviceId, PRESETS[serviceId]).total;
  }

  function formatMoney(amount) {
    var sign = amount < 0 ? "−" : "";
    return sign + "$" + Math.abs(amount);
  }

  function serviceList() {
    return ["lawn", "cleaning", "handyman"].map(function (id) {
      var service = SERVICES[id];
      return {
        id: service.id,
        name: service.name,
        summary: service.summary,
        from: startingPrice(id)
      };
    });
  }

  return {
    SERVICES: SERVICES,
    PRESETS: PRESETS,
    quote: quote,
    startingPrice: startingPrice,
    formatMoney: formatMoney,
    serviceList: serviceList
  };
});
