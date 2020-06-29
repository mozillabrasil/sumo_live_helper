// Create message handler
browser.runtime.onMessage.addListener(handleMessage);

// Insert version number
let versionUI = document.getElementById("version");
versionUI.textContent = " (v" + browser.runtime.getManifest().version + ")";

// Detect operating system
let isMobile;
let detectOS = browser.runtime.getPlatformInfo();
detectOS.then(setOS);

// Load data
let data = browser.storage.local.get();
data.then(loadSettings);
document.settings.addEventListener('change', saveChange);

/**
 * Set the UI theme
 * @param {string} theme
 */
function setCurrentTheme(theme) {
    document.body.classList.remove('theme-dark', 'theme-light');

    if (theme == 'auto') {
        let isSystemThemeDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
        let isSystemThemeLight = window.matchMedia('(prefers-color-scheme: light)').matches;

        if (isSystemThemeDark == true) {
            document.body.classList.add('theme-dark');
        } else if (isSystemThemeLight == true) {
            document.body.classList.add('theme-light');
        } else {
            document.body.classList.add('theme-light');
        }
    } else {
        document.body.classList.add('theme-' + theme);
    }
}

/**
 * Handle incoming messages
 * @param {object} message
 */
function handleMessage(message) {
    switch(message.task) {
        case 'update_theme':
            setCurrentTheme(message.theme);
            return;
    }
}

/**
 * Inject settings into options UI from Storage API
 * @param {object} data
 */
function loadSettings(data) {
    setCurrentTheme(data.chooseTheme);

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

    if (data.chooseLanguage) {
        let languages = data.chooseLanguage;
        for (i = 0; i < languages.length; i++) {
            document.getElementById(languages[i]).checked = true;
        }
    }
    
    if (data.chooseTheme) {
        document.settings.chooseTheme.value = data.chooseTheme;
    }
    
    document.getElementById('page-loader').style.display = 'none';
}

/**
 * Save a setting
 * @param {object} e
 */
function saveChange(element) {
    let preference;
    let preferenceObject = {};

    if (element.target.name == 'chooseProduct' || element.target.name == 'chooseLanguage') {
        preference = getList(element.target.name);
    } else if (element.target.type == 'checkbox') {
        preference = element.target.checked;
    } else {
        preference = element.target.value;
    }

    preferenceObject[element.target.name] = preference;
    browser.storage.local.set(preferenceObject);
}

/**
 * Generate preference array
 * @return {Array.<string>}
 */
function getList(option) {
    let preference = [];

    for (i = 0; i < document.settings[option].length; i++) {
        if (document.settings[option][i].checked) {
            preference.push(document.settings[option][i].value);
        }
    }

    return preference;
}

/**
 * Sets the OS information variable
 * @param {object} info
 */
function setOS(info) {
    isMobile = info.os == browser.runtime.PlatformOs.ANDROID;
    if (isMobile) {
        document.body.classList.add('mobile');
    }
}
