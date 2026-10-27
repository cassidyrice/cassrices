(function () {
  var form = document.getElementById("sample-form");
  if (!form || !window.fetch) return;
  var status = document.getElementById("form-status");
  var button = form.querySelector("button[type=submit]");

  function say(msg, kind) {
    status.textContent = msg;
    status.className = "form-status" + (kind ? " " + kind : "");
  }

  form.addEventListener("submit", function (e) {
    e.preventDefault();
    var bad = null;
    Array.prototype.forEach.call(form.querySelectorAll("[required]"), function (el) {
      var ok = el.value.trim() !== "" && (el.type !== "email" || /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(el.value.trim()));
      el.setAttribute("aria-invalid", ok ? "false" : "true");
      if (!ok && !bad) bad = el;
    });
    if (bad) {
      say("Please fill in every field" + (bad.type === "email" ? " with a valid email." : "."), "err");
      bad.focus();
      return;
    }
    button.disabled = true;
    say("Sending…");
    var data = {};
    new FormData(form).forEach(function (v, k) { data[k] = v; });
    fetch(form.action, {
      method: "POST",
      headers: { "Content-Type": "application/json", "Accept": "application/json" },
      body: JSON.stringify(data)
    })
      .then(function (r) { return r.json().catch(function () { return {}; }).then(function (j) { return { ok: r.ok, j: j }; }); })
      .then(function (res) {
        if (res.ok && res.j.ok) {
          form.reset();
          say("Thanks! Your request is in. I’ll email you with your custom Option A & Option B preview links.", "ok");
        } else {
          say((res.j && res.j.error) || "Something went wrong. Please try again.", "err");
        }
      })
      .catch(function () { say("Couldn’t send. Check your connection and try again.", "err"); })
      .then(function () { button.disabled = false; });
  });
})();
