const assert = require("assert");
const pricing = require("../assets/js/pricing.js");

function combinations(serviceId) {
  const service = pricing.SERVICES[serviceId];
  const sets = [[]];
  service.questions.forEach(function (question) {
    const next = [];
    sets.forEach(function (partial) {
      question.options.forEach(function (option) {
        const answers = Object.assign({}, partial);
        answers[question.id] = option.id;
        next.push(answers);
      });
    });
    sets.length = 0;
    next.forEach(function (item) { sets.push(item); });
  });
  return sets;
}

["lawn", "cleaning", "handyman"].forEach(function (serviceId) {
  combinations(serviceId).forEach(function (answers) {
    const priced = pricing.quote(serviceId, answers);
    const sum = priced.lines.reduce(function (total, line) { return total + line.amount; }, 0);
    assert.strictEqual(sum, priced.total, serviceId + " " + JSON.stringify(answers));
    assert.ok(priced.total > 0);
    assert.ok(priced.lines.length > 0);
    assert.ok(priced.includes[0]);
  });
});

assert.strictEqual(
  pricing.quote("lawn", { size: "medium", level: "blow", frequency: "biweekly" }).total,
  100
);
assert.ok(
  pricing.quote("lawn", pricing.PRESETS.lawn).total <
    pricing.quote("lawn", { size: "small", level: "mow", frequency: "once" }).total
);
assert.ok(
  pricing.quote("cleaning", { size: "studio", type: "deep", condition: "tidy" }).total >
    pricing.quote("cleaning", pricing.PRESETS.cleaning).total
);
assert.ok(
  pricing.quote("handyman", { job: "mount", quantity: "half", access: "easy" }).total >
    pricing.quote("handyman", pricing.PRESETS.handyman).total
);

assert.throws(function () { pricing.quote("roofing", {}); }, /Unknown service/);
assert.throws(function () { pricing.quote("lawn", { size: "small" }); }, /Missing answer/);

assert.strictEqual(pricing.formatMoney(100), "$100");
assert.strictEqual(pricing.formatMoney(-8), "−$8");
assert.strictEqual(pricing.startingPrice("lawn"), pricing.quote("lawn", pricing.PRESETS.lawn).total);

console.log("pricing tests passed");
