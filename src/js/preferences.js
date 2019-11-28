// Insert version number
var version = document.getElementById("version");
version.textContent = " (v" + browser.runtime.getManifest().version + ")";

// Load data
var data = browser.storage.local.get();
data.then(loadSettings);
document.settings.addEventListener('change', saveChange);

// Load data from storage
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
    
    if (data.preferSidebar) {
        document.settings.preferSidebar.checked = data.preferSidebar;
    }
    
    if (data.chooseProduct) {
        var temp = data.chooseProduct;
        for (i = 0; i < temp.length; i++) {
            document.getElementById(temp[i].toLowerCase()).checked = true;
        }
    } else {
        document.settings.chooseProduct[i].checked = true;
    }
}

// Save a setting
function saveChange(e) {
    if (e.target.name == 'chooseProduct') {
        var pref = saveProducts();
    } else if (e.target.type == 'checkbox') {
        var pref = e.target.checked;
    } else {
        var pref = e.target.value;
    }
    var preference = {};
    preference[e.target.name] = pref;
    browser.storage.local.set(preference);
}

// Saves products
function saveProducts() {
    var pref = [];
    for (i = 0; i < document.settings.chooseProduct.length; i++) {
        if (document.settings.chooseProduct[i].checked) {
            pref.push(document.settings.chooseProduct[i].value);
        }
    }
    return pref;
}