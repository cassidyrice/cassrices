(function () {
  var pricing = window.QuotePricing;
  var app = document.querySelector("#app");
  var STORAGE_KEY = "cassrices-quote";
  var WINDOWS = [
    { id: "morning", label: "Weekday morning" },
    { id: "afternoon", label: "Weekday afternoon" },
    { id: "saturday", label: "Saturday" }
  ];

  var state = load() || fresh();

  function fresh() {
    return {
      screen: "home",
      serviceId: null,
      step: 0,
      answers: {},
      contact: { name: "", phone: "", zip: "", window: "" },
      request: null,
      errors: {}
    };
  }

  function load() {
    try {
      var raw = sessionStorage.getItem(STORAGE_KEY);
      return raw ? JSON.parse(raw) : null;
    } catch (error) {
      return null;
    }
  }

  function save() {
    try {
      sessionStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch (error) {
      /* private mode can block storage; the flow still works in memory */
    }
  }

  function go(patch, replace) {
    state = Object.assign({}, state, patch);
    save();
    var snapshot = JSON.parse(JSON.stringify(state));
    if (replace) history.replaceState({ state: snapshot }, "");
    else history.pushState({ state: snapshot }, "");
    render();
  }

  function h(tag, props) {
    var node = document.createElement(tag);
    var children = Array.prototype.slice.call(arguments, 2);
    Object.keys(props || {}).forEach(function (key) {
      var value = props[key];
      if (value == null || value === false) return;
      if (key === "class") node.className = value;
      else if (key === "value" && "value" in node) node.value = String(value);
      else node.setAttribute(key, value === true ? "" : String(value));
    });
    children.flat().forEach(function (child) {
      if (child == null || child === false) return;
      node.append(child instanceof Node ? child : document.createTextNode(String(child)));
    });
    return node;
  }

  function money(amount) {
    return pricing.formatMoney(amount);
  }

  function service() {
    return state.serviceId ? pricing.SERVICES[state.serviceId] : null;
  }

  function currentQuestion() {
    var current = service();
    return current ? current.questions[state.step] : null;
  }

  function quoteReady() {
    var current = service();
    if (!current) return false;
    return current.questions.every(function (question) {
      return Boolean(state.answers[question.id]);
    });
  }

  function priced() {
    return pricing.quote(state.serviceId, state.answers);
  }

  function progress() {
    if (state.screen === "home") return null;
    if (state.screen === "service") return { index: 1, total: 4 };
    if (state.screen === "question") return { index: state.step + 2, total: 4 };
    return { index: 4, total: 4 };
  }

  function topbar(showBack) {
    var prog = progress();
    return h("header", { class: "topbar" },
      showBack
        ? h("button", { class: "back", type: "button", "data-action": "back", "aria-label": "Back" }, "Back")
        : h("p", { class: "brand" }, "Cassrices"),
      prog
        ? h("p", { class: "step", "aria-hidden": "true" }, "Step " + prog.index + " of " + prog.total)
        : h("p", { class: "brand-mark" }, "Quotes")
    );
  }

  function progressBar() {
    var prog = progress();
    if (!prog) return null;
    var pct = Math.round((prog.index / prog.total) * 100);
    return h("div", {
      class: "progress",
      role: "progressbar",
      "aria-valuemin": "1",
      "aria-valuemax": String(prog.total),
      "aria-valuenow": String(prog.index),
      "aria-label": "Step " + prog.index + " of " + prog.total
    }, h("span", { style: "width:" + pct + "%" }));
  }

  function choiceButton(action, value, label, detail, extra) {
    var props = {
      class: "choice",
      type: "button",
      "data-action": action,
      "data-value": value
    };
    if (extra) Object.keys(extra).forEach(function (key) { props[key] = extra[key]; });
    return h("button", props,
      h("span", { class: "choice-copy" },
        h("span", { class: "choice-label" }, label),
        detail ? h("span", { class: "choice-detail" }, detail) : null
      ),
      h("span", { class: "choice-go", "aria-hidden": "true" }, "›")
    );
  }

  function dock(label, action) {
    return h("div", { class: "dock" },
      h("button", { class: "btn btn-primary", type: "button", "data-action": action }, label)
    );
  }

  function homeScreen() {
    var from = pricing.serviceList().map(function (item) {
      return item.name.replace(" care", "").replace("House ", "") + " from " + money(item.from);
    }).join(" · ");
    var saved = state.request
      ? h("button", { class: "text-link", type: "button", "data-action": "view-request" },
          "View saved request " + state.request.id)
      : null;
    var resume = state.serviceId && !state.request
      ? h("button", { class: "text-link", type: "button", "data-action": "resume" },
          "Continue your " + service().name.toLowerCase() + " quote")
      : null;
    return h("section", { class: "screen" },
      topbar(false),
      h("div", { class: "screen-body" },
        h("p", { class: "kicker" }, "Instant quotes"),
        h("h1", {}, "Know the price before you book."),
        h("p", { class: "lede" }, "Lawn care, house cleaning, and handyman visits. Three short questions, then a clear number."),
        h("ul", { class: "trust" },
          h("li", {}, "See your price first"),
          h("li", {}, "Rates follow the size of the job"),
          h("li", {}, "Book only if the number looks right")
        ),
        h("p", { class: "from-row" }, from),
        resume,
        saved
      ),
      dock("See my price", "start")
    );
  }

  function serviceScreen() {
    return h("section", { class: "screen" },
      progressBar(),
      topbar(true),
      h("div", { class: "screen-body" },
        h("h1", {}, "What should we quote?"),
        h("p", { class: "lede" }, "Choose one job. You can start over any time."),
        h("div", { class: "choices" },
          pricing.serviceList().map(function (item) {
            return choiceButton(
              "pick-service",
              item.id,
              item.name,
              item.summary + " From " + money(item.from) + "."
            );
          })
        )
      )
    );
  }

  function questionScreen() {
    var question = currentQuestion();
    return h("section", { class: "screen" },
      progressBar(),
      topbar(true),
      h("div", { class: "screen-body" },
        h("p", { class: "kicker" }, service().name),
        h("h1", {}, question.prompt),
        h("p", { class: "lede" }, question.hint),
        h("div", { class: "choices" },
          question.options.map(function (option) {
            var selected = state.answers[question.id] === option.id;
            return choiceButton("answer", option.id, option.label, option.detail, {
              "aria-pressed": selected ? "true" : "false",
              class: selected ? "choice is-selected" : "choice"
            });
          })
        )
      )
    );
  }

  function quoteScreen() {
    var result = priced();
    return h("section", { class: "screen" },
      progressBar(),
      topbar(true),
      h("div", { class: "screen-body" },
        h("p", { class: "kicker" }, result.title),
        h("h1", { class: "price" }, money(result.total)),
        h("p", { class: "unit" }, result.unit),
        h("p", { class: "lede" }, result.subtitle),
        h("div", { class: "receipt" },
          h("ul", { class: "lines" },
            result.lines.map(function (line) {
              return h("li", {},
                h("span", {}, line.label),
                h("span", {}, money(line.amount))
              );
            }),
            h("li", { class: "total" },
              h("span", {}, "Quote"),
              h("span", {}, money(result.total))
            )
          )
        ),
        h("h2", {}, "Included"),
        h("p", {}, result.includes[0]),
        h("p", { class: "note" }, result.holds + " " + result.boundary),
        h("button", { class: "text-link", type: "button", "data-action": "restart" }, "Start over")
      ),
      dock("Request this visit", "details")
    );
  }

  function field(id, label, opts) {
    var error = state.errors[id];
    return h("label", { class: "field" + (error ? " is-invalid" : ""), for: id },
      h("span", {}, label),
      h("input", {
        id: id,
        name: id,
        type: opts.type || "text",
        inputmode: opts.inputmode || null,
        autocomplete: opts.autocomplete || null,
        maxlength: opts.maxlength || null,
        value: state.contact[id] || "",
        required: true
      }),
      error ? h("span", { class: "field-error", role: "alert" }, error) : null
    );
  }

  function detailsScreen() {
    var result = priced();
    return h("section", { class: "screen" },
      topbar(true),
      h("form", { class: "screen-body", id: "details-form" },
        h("p", { class: "kicker" }, money(result.total) + " " + result.unit),
        h("h1", {}, "Where should we confirm?"),
        h("p", { class: "lede" }, result.title + " · " + result.subtitle),
        field("name", "Name", { autocomplete: "name", maxlength: "80" }),
        field("phone", "Mobile", { type: "tel", inputmode: "tel", autocomplete: "tel", maxlength: "20" }),
        field("zip", "ZIP code", { inputmode: "numeric", autocomplete: "postal-code", maxlength: "5" }),
        h("fieldset", { class: "windows" },
          h("legend", {}, "Preferred window"),
          h("div", { class: "choices choices-compact" },
            WINDOWS.map(function (item) {
              var selected = state.contact.window === item.id;
              return choiceButton("window", item.id, item.label, null, {
                "aria-pressed": selected ? "true" : "false",
                class: selected ? "choice is-selected" : "choice"
              });
            })
          ),
          state.errors.window ? h("p", { class: "field-error", role: "alert" }, state.errors.window) : null
        )
      ),
      dock("Send request", "submit")
    );
  }

  function requestText(request) {
    var quoteResult = request.quote;
    var lines = quoteResult.lines.map(function (line) {
      return line.label + ": " + money(line.amount);
    }).join("\n");
    return [
      "Cassrices quote " + request.id,
      quoteResult.title + " — " + quoteResult.subtitle,
      money(quoteResult.total) + " " + quoteResult.unit,
      "",
      lines,
      "Quote: " + money(quoteResult.total),
      "",
      "Name: " + request.contact.name,
      "Phone: " + request.contact.phone,
      "ZIP: " + request.contact.zip,
      "Window: " + request.contact.windowLabel
    ].join("\n");
  }

  function doneScreen() {
    var request = state.request;
    var text = requestText(request);
    return h("section", { class: "screen" },
      topbar(false),
      h("div", { class: "screen-body" },
        h("p", { class: "done-mark", "aria-hidden": "true" }, "✓"),
        h("h1", {}, "Request saved"),
        h("p", { class: "quote-id" }, request.id),
        h("p", { class: "lede" },
          money(request.quote.total) + " " + request.quote.unit + " for " + request.quote.subtitle + "."
        ),
        h("p", {}, "Saved on this phone. Text or email it to lock the visit."),
        h("pre", { class: "summary", id: "request-summary" }, text),
        h("div", { class: "stack" },
          h("a", { class: "btn btn-primary", href: smsHref(text) }, "Text this request"),
          h("a", { class: "btn btn-secondary", href: mailHref(text, request.id) }, "Email this request"),
          h("button", { class: "btn btn-secondary", type: "button", "data-action": "copy", id: "copy-request" }, "Copy summary"),
          h("button", { class: "text-link", type: "button", "data-action": "restart" }, "New quote")
        )
      )
    );
  }

  function smsHref(text) {
    return "sms:?&body=" + encodeURIComponent(text);
  }

  function mailHref(text, id) {
    return "mailto:?subject=" + encodeURIComponent("Cassrices quote " + id) + "&body=" + encodeURIComponent(text);
  }

  function render() {
    var screen = state.screen;
    var screenChanged = render.current !== screen;
    var view = homeScreen();
    if (screen === "service") view = serviceScreen();
    else if (screen === "question") view = questionScreen();
    else if (screen === "quote") view = quoteReady() ? quoteScreen() : serviceScreen();
    else if (screen === "details") view = quoteReady() ? detailsScreen() : serviceScreen();
    else if (screen === "done" && state.request) view = doneScreen();
    app.replaceChildren(view);
    document.title = documentTitle();
    render.current = screen;
    if (!screenChanged) return;
    var heading = app.querySelector("h1");
    if (heading) {
      heading.tabIndex = -1;
      heading.focus({ preventScroll: true });
    }
    window.scrollTo(0, 0);
  }

  function documentTitle() {
    if (state.screen === "question" && currentQuestion()) {
      return currentQuestion().prompt + " · Cassrices";
    }
    var titles = {
      home: "Instant quotes",
      service: "Choose a job",
      quote: "Your quote",
      details: "Request the visit",
      done: "Request saved"
    };
    return (titles[state.screen] || "Instant quotes") + " · Cassrices";
  }

  function digits(value) {
    return String(value || "").replace(/\D/g, "");
  }

  function readContactFromForm() {
    var form = document.querySelector("#details-form");
    if (!form) return;
    ["name", "phone", "zip"].forEach(function (key) {
      var input = form.querySelector("#" + key);
      if (input) state.contact[key] = input.value;
    });
  }

  function validateContact() {
    readContactFromForm();
    var errors = {};
    if (state.contact.name.trim().length < 2) errors.name = "Enter the name for the visit.";
    var phone = digits(state.contact.phone);
    var phoneOk = phone.length === 10 || (phone.length === 11 && phone.charAt(0) === "1");
    if (!phoneOk) errors.phone = "Enter a 10-digit mobile number.";
    if (!/^\d{5}$/.test(state.contact.zip.trim())) errors.zip = "Enter a 5-digit ZIP code.";
    if (!WINDOWS.some(function (item) { return item.id === state.contact.window; })) {
      errors.window = "Choose a time window.";
    }
    return errors;
  }

  function makeId() {
    var alphabet = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
    var id = "CR-";
    for (var i = 0; i < 4; i += 1) {
      id += alphabet.charAt(Math.floor(Math.random() * alphabet.length));
    }
    return id;
  }

  function formatPhone(value) {
    var phone = digits(value);
    if (phone.length === 11 && phone.charAt(0) === "1") phone = phone.slice(1);
    if (phone.length !== 10) return value.trim();
    return "(" + phone.slice(0, 3) + ") " + phone.slice(3, 6) + "-" + phone.slice(6);
  }

  function windowLabel(id) {
    var match = WINDOWS.filter(function (item) { return item.id === id; })[0];
    return match ? match.label : id;
  }

  function onClick(event) {
    var button = event.target.closest("[data-action]");
    if (!button) return;
    var action = button.getAttribute("data-action");
    var value = button.getAttribute("data-value");

    if (action === "back") {
      history.back();
      return;
    }
    if (action === "start" || action === "restart") {
      go({
        screen: "service",
        serviceId: null,
        step: 0,
        answers: {},
        contact: { name: "", phone: "", zip: "", window: "" },
        errors: {},
        request: action === "restart" ? null : state.request
      });
      return;
    }
    if (action === "view-request" && state.request) {
      go({ screen: "done", errors: {} });
      return;
    }
    if (action === "resume" && state.serviceId) {
      var current = service();
      var missing = current.questions.findIndex(function (question) {
        return !state.answers[question.id];
      });
      if (missing === -1) go({ screen: "quote", errors: {} });
      else go({ screen: "question", step: missing, errors: {} });
      return;
    }
    if (action === "pick-service") {
      go({ screen: "question", serviceId: value, step: 0, answers: {}, errors: {} });
      return;
    }
    if (action === "answer") {
      var question = currentQuestion();
      var answers = Object.assign({}, state.answers);
      answers[question.id] = value;
      var next = state.step + 1;
      if (next < service().questions.length) {
        go({ answers: answers, step: next, screen: "question", errors: {} });
      } else {
        go({ answers: answers, screen: "quote", errors: {} });
      }
      return;
    }
    if (action === "details") {
      go({ screen: "details", errors: {} });
      return;
    }
    if (action === "window") {
      readContactFromForm();
      state.contact.window = value;
      state.errors.window = "";
      save();
      render();
      return;
    }
    if (action === "submit") {
      var errors = validateContact();
      if (Object.keys(errors).length) {
        state.errors = errors;
        save();
        render();
        var invalid = app.querySelector(".is-invalid input, .field-error");
        if (invalid && invalid.focus) invalid.focus();
        return;
      }
      var windowName = windowLabel(state.contact.window);
      go({
        screen: "done",
        errors: {},
        request: {
          id: makeId(),
          createdAt: new Date().toISOString(),
          serviceId: state.serviceId,
          answers: Object.assign({}, state.answers),
          contact: {
            name: state.contact.name.trim(),
            phone: formatPhone(state.contact.phone),
            zip: state.contact.zip.trim(),
            window: state.contact.window,
            windowLabel: windowName
          },
          quote: priced()
        }
      });
      return;
    }
    if (action === "copy") {
      var summary = document.querySelector("#request-summary");
      var text = summary ? summary.textContent : "";
      if (!navigator.clipboard || !navigator.clipboard.writeText) return;
      navigator.clipboard.writeText(text).then(function () {
        button.textContent = "Copied";
        window.setTimeout(function () {
          button.textContent = "Copy summary";
        }, 1600);
      }).catch(function () {
        button.textContent = "Copy summary";
      });
    }
  }

  app.addEventListener("click", onClick);

  window.addEventListener("popstate", function (event) {
    if (event.state && event.state.state) {
      state = event.state.state;
      save();
      render();
    }
  });

  history.replaceState({ state: JSON.parse(JSON.stringify(state)) }, "");
  render();
})();
