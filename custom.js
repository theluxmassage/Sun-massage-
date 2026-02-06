(function () {
  function isLeaf(el) {
    return el && el.children && el.children.length === 0 && (el.textContent || "").trim().length > 0;
  }

  function findExtrasList() {
    const headings = Array.from(document.querySelectorAll("h1,h2,h3,h4"));
    const extrasHeading = headings.find(h => (h.textContent || "").trim().toLowerCase() === "extras");
    if (!extrasHeading) return null;

    const card = extrasHeading.closest("section,div");
    if (!card) return null;

    const containers = Array.from(card.querySelectorAll("div,section,ul,ol"));
    const list = containers.find(c => {
      const t = (c.textContent || "");
      return t.includes("Body Scrub") && t.includes("Table Shower") && t.includes("Cupping");
    });

    return list || null;
  }

  function makeGrid(list) {
    list.style.display = "grid";
    list.style.gridTemplateColumns = "1fr auto 1fr auto"; // label, price, label, price
    list.style.columnGap = "24px";
    list.style.rowGap = "16px";
    list.style.alignItems = "center";
  }

  function run() {
    const list = findExtrasList();
    if (!list) return false;

    // Find templates to clone styling
    const leaves = Array.from(list.querySelectorAll("*")).filter(isLeaf);
    const labelTemplate = leaves.find(el => /Body Scrub|Table Shower|Cupping/i.test(el.textContent || ""));
    const priceTemplate10 = leaves.find(el => (el.textContent || "").replace(/\s+/g, "") === "+$10");
    const priceTemplate20 = leaves.find(el => (el.textContent || "").replace(/\s+/g, "") === "+$20");

    if (!labelTemplate || !priceTemplate10 || !priceTemplate20) return false;

    // Prevent re-running forever (if we already rebuilt)
    if ((list.getAttribute("data-extras-fixed") || "") === "1") {
      makeGrid(list);
      // align prices right
      Array.from(list.children).forEach(ch => {
        const txt = (ch.textContent || "").trim();
        ch.style.justifySelf = /^\+\$\d+/.test(txt) ? "end" : "start";
      });
      return true;
    }

    // Build brand-new nodes (same styling)
    const mkLabel = (text) => {
      const n = labelTemplate.cloneNode(true);
      n.textContent = text;
      n.style.justifySelf = "start";
      return n;
    };

    const mkPrice = (text, template) => {
      const n = template.cloneNode(true);
      n.textContent = text;
      n.style.justifySelf = "end";
      return n;
    };

    // Clear list and rebuild exact layout:
    // Row 1: Coconut Oil +$10 | Body Scrub +$10
    // Row 2: Table Shower +$10 | Cupping +$20
    list.innerHTML = "";
    makeGrid(list);

    list.appendChild(mkLabel("Coconut Oil"));
    list.appendChild(mkPrice("+$10", priceTemplate10));

    list.appendChild(mkLabel("Body Scrub"));
    list.appendChild(mkPrice("+$10", priceTemplate10));

    list.appendChild(mkLabel("Table Shower"));
    list.appendChild(mkPrice("+$10", priceTemplate10));

    list.appendChild(mkLabel("Cupping"));
    list.appendChild(mkPrice("+$20", priceTemplate20));

    list.setAttribute("data-extras-fixed", "1");
    return true;
  }

  const obs = new MutationObserver(() => {
    if (run()) obs.disconnect();
  });

  obs.observe(document.body, { childList: true, subtree: true });
  run();
})();
// --- HERO LINE: "walk-ins..." under Couples Room + Gift Certificates ---
(function () {
  function addHeroLine() {
    // Find the two pill buttons by text
    const pills = Array.from(document.querySelectorAll("a,button,div,span"))
      .filter(el => el && el.textContent && el.textContent.trim());

    const couples = pills.find(el => el.textContent.trim().toLowerCase() === "couples room");
    const gifts = pills.find(el => el.textContent.trim().toLowerCase() === "gift certificates");

    if (!couples || !gifts) return false;

    // The row that contains both pills
    const row = couples.closest("div");
    if (!row) return false;

    // Prevent duplicates
    if (document.getElementById("walkins-line")) return true;

    // Insert a nice centered line under the pill row
    const line = document.createElement("div");
    line.id = "walkins-line";
    line.textContent = "Walk-ins or appointments accepted • Call us";
    line.style.marginTop = "12px";
    line.style.textAlign = "center";
    line.style.fontSize = "14px";
    line.style.letterSpacing = "0.3px";
    line.style.opacity = "0.9";
    line.style.color = "rgba(255,255,255,0.75)";

    row.after(line);
    return true;
  }

  const obs = new MutationObserver(() => {
    if (addHeroLine()) obs.disconnect();
  });
  obs.observe(document.body, { childList: true, subtree: true });

  addHeroLine();
})();
