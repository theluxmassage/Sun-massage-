(function () {
  function isLeaf(el) {
    return el && el.children && el.children.length === 0 && (el.textContent || "").trim().length > 0;
  }

  function findExtrasList() {
    // Find the "Extras" heading
    const headings = Array.from(document.querySelectorAll("h1,h2,h3,h4"));
    const extrasHeading = headings.find(h => (h.textContent || "").trim().toLowerCase() === "extras");
    if (!extrasHeading) return null;

    const card = extrasHeading.closest("section,div");
    if (!card) return null;

    // Find a container that contains ALL existing items
    const containers = Array.from(card.querySelectorAll("div,section,ul,ol"));
    const list = containers.find(c => {
      const t = (c.textContent || "");
      return t.includes("Body Scrub") && t.includes("Table Shower") && t.includes("Cupping");
    });

    return list || null;
  }

  function getLeafByExactText(root, exact) {
    const leaves = Array.from(root.querySelectorAll("*")).filter(isLeaf);
    return leaves.find(el => (el.textContent || "").trim().toLowerCase() === exact.toLowerCase()) || null;
  }

  function getPriceLeafNear(root, amount) {
    const leaves = Array.from(root.querySelectorAll("*")).filter(isLeaf);
    return leaves.find(el => (el.textContent || "").replace(/\s+/g, "").toLowerCase() === amount.replace(/\s+/g, "").toLowerCase()) || null;
  }

  function forceGridLayout(list) {
    // Make it look like your Kimi preview: 2 items per row (label+price, label+price)
    list.style.display = "grid";
    list.style.gridTemplateColumns = "1fr auto 1fr auto";
    list.style.columnGap = "24px";
    list.style.rowGap = "16px";
    list.style.alignItems = "center";

    // Align prices to the right
    Array.from(list.children).forEach(ch => {
      const txt = (ch.textContent || "").trim();
      if (/^\+\$\d+/.test(txt)) ch.style.justifySelf = "end";
      else ch.style.justifySelf = "start";
    });
  }

  function run() {
    const list = findExtrasList();
    if (!list) return false;

    // Already added?
    if ((list.textContent || "").toLowerCase().includes("coconut oil")) {
      forceGridLayout(list);
      return true;
    }

    // Find existing nodes (so we keep exact same styling)
    const bodyScrubLabel = getLeafByExactText(list, "Body Scrub");
    const tableShowerLabel = getLeafByExactText(list, "Table Shower");
    const cuppingLabel = getLeafByExactText(list, "Cupping");

    // Find prices (your page uses +$10 and +$20)
    const any10 = getPriceLeafNear(list, "+$10");
    const any20 = getPriceLeafNear(list, "+$20");

    if (!bodyScrubLabel || !tableShowerLabel || !cuppingLabel || !any10 || !any20) return false;

    // Clone a label + a price for Coconut Oil
    const coconutLabel = bodyScrubLabel.cloneNode(true);
    coconutLabel.textContent = "Coconut Oil";

    const coconutPrice = any10.cloneNode(true);
    coconutPrice.textContent = "+$10";

    // Get the correct prices for each item (use the ones already on the page)
    // We’ll pick prices by looking near each label (fallback: any10/any20)
    function findPriceFor(label, fallback) {
      // try next siblings first
      let n = label.nextElementSibling;
      while (n) {
        if (isLeaf(n) && /^\+\$\d+/.test((n.textContent || "").trim())) return n;
        n = n.nextElementSibling;
      }
      return fallback;
    }

    const bodyScrubPrice = findPriceFor(bodyScrubLabel, any10);
    const tableShowerPrice = findPriceFor(tableShowerLabel, any10);
    const cuppingPrice = findPriceFor(cuppingLabel, any20);

    // Rebuild order EXACTLY like your preview:
    const desired = [
      coconutLabel, coconutPrice,
      bodyScrubLabel, bodyScrubPrice,
      tableShowerLabel, tableShowerPrice,
      cuppingLabel, cuppingPrice
    ];

    // Move everything into the right order (appendChild moves the node)
    desired.forEach(node => {
      if (node && node.parentNode) list.appendChild(node);
      else if (node) list.appendChild(node);
    });

    forceGridLayout(list);
    return true;
  }

  const obs = new MutationObserver(() => {
    if (run()) obs.disconnect();
  });

  obs.observe(document.body, { childList: true, subtree: true });
  run();
})();
