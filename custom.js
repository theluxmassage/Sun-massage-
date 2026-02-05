(function () {
  function isLeaf(el) {
    return el && el.children && el.children.length === 0;
  }

  function findExtrasCard() {
    const headings = Array.from(document.querySelectorAll("h1,h2,h3,h4"));
    const extrasHeading = headings.find(
      h => h.textContent.trim().toLowerCase() === "extras"
    );
    if (!extrasHeading) return null;

    const card = extrasHeading.closest("section,div");
    if (!card) return null;

    const containers = Array.from(card.querySelectorAll("div,ul"));
    const list = containers.find(d =>
      d.textContent.includes("Body Scrub") &&
      d.textContent.includes("Table Shower") &&
      d.textContent.includes("Cupping")
    );

    return list || null;
  }

  function run() {
    const list = findExtrasCard();
    if (!list) return false;

    // Stop if Coconut Oil already exists
    if (list.textContent.toLowerCase().includes("coconut oil")) return true;

    const items = Array.from(list.querySelectorAll("*")).filter(isLeaf);

    const bodyScrub = items.find(n => n.textContent.trim() === "Body Scrub");
    const tableShower = items.find(n => n.textContent.trim() === "Table Shower");
    const cupping = items.find(n => n.textContent.trim() === "Cupping");

    const price10 = items.find(n => n.textContent.trim() === "+$10");
    const price20 = items.find(n => n.textContent.trim() === "+$20");

    if (!bodyScrub || !tableShower || !cupping || !price10 || !price20) return false;

    const coconutLabel = bodyScrub.cloneNode(true);
    coconutLabel.textContent = "Coconut Oil";

    const coconutPrice = price10.cloneNode(true);
    coconutPrice.textContent = "+$10";

    // Insert Coconut Oil before Body Scrub
    list.insertBefore(coconutLabel, bodyScrub);
    list.insertBefore(coconutPrice, bodyScrub);

    return true;
  }

  const obs = new MutationObserver(() => {
    if (run()) obs.disconnect();
  });

  obs.observe(document.body, { childList: true, subtree: true });
  run();
})();
