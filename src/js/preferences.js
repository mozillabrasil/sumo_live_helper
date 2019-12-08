// Insert version number
let versionUI = document.getElementById("version");
versionUI.textContent = " (v" + browser.runtime.getManifest().version + ")";

// Load data
let data = browser.storage.local.get();
data.then(loadSettings);
document.settings.addEventListener('change', saveChange);

// Get theme
let getCurrentTheme = browser.storage.local.get("chooseTheme");
getCurrentTheme.then(setCurrentTheme);

// Set theme
function setCurrentTheme(data) {
  let addClassTheme = document.getElementsByTagName('body');

  if (data.chooseTheme == "auto") {
    let isSystemThemeDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    let isSystemThemeLight = window.matchMedia('(prefers-color-scheme: light)').matches;
    if (isSystemThemeDark == true) {
      addClassTheme[0].className = "theme-dark";
    } else if (isSystemThemeLight == true) {
      addClassTheme[0].className = "theme-light";
    } else {
      addClassTheme[0].className = "theme-light";
    }
  } else {
    addClassTheme[0].className = "theme-" + data.chooseTheme;
  }
}

/**
 * Inject settings into options UI from Storage API
 * @param {object} data
 */
function loadSettings(data) {
    if (data.chooseLanguage) {
        document.settings.chooseLanguage.value = data.chooseLanguage;
    }

    if (data.frequencySeekNewQuestions) {
        document.settings.frequencySeekNewQuestions.value = data.frequencySeekNewQuestions;
    }

    if (data.showNotifications) {
        document.settings.showNotifications.checked = data.showNotifications;
    }

    if (data.onlySidebar) {
        document.settings.onlySidebar.checked = data.onlySidebar;
    }

    if (data.chooseProduct) {
        let products = data.chooseProduct;
        for (i = 0; i < products.length; i++) {
            document.getElementById(products[i].toLowerCase()).checked = true;
        }
    } else {
        document.settings.chooseProduct[i].checked = true;
    }
    
    if (data.chooseTheme) {
        document.settings.chooseTheme.value = data.chooseTheme;
    }
}

/**
 * Save a setting
 * @param {object} e
 */
function saveChange(element) {
    let preference;
    let preferenceObject = {};

    if (element.target.name == 'chooseProduct') {
        preference = getProductList();
    } else if (element.target.type == 'checkbox') {
        preference = element.target.checked;
    } else {
        preference = element.target.value;
    }

    preferenceObject[element.target.name] = preference;
    browser.storage.local.set(preferenceObject);
}

/**
 * Generate list of products to watch
 * @return {Array.<string>}
 */
function getProductList() {
    let preference = [];

    for (i = 0; i < document.settings.chooseProduct.length; i++) {
        if (document.settings.chooseProduct[i].checked) {
            preference.push(document.settings.chooseProduct[i].value);
        }
    }

    return preference;
}
