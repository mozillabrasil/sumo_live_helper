// Insert version number
let versionUI = document.getElementById("version");
versionUI.textContent = " (v" + browser.runtime.getManifest().version + ")";

// Load data
let data = browser.storage.local.get();
data.then(loadSettings);
document.settings.addEventListener('change', saveChange);

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
