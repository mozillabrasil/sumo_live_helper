let textElements = document.querySelectorAll("[data-manifest]");
let Manifest = [];

for (let element of textElements) {
  element.textContent = Manifest[element.dataset.manifest];
}

textElements = document.querySelectorAll("[data-i18n]");
for (let element of textElements) {
  element.textContent = browser.i18n.getMessage(element.dataset.i18n);
}
