// version
var version = document.getElementById("version");
version.textContent = browser.runtime.getManifest().name + " (v"+ browser.runtime.getManifest().version + ")";

// store option UI elements
var language = document.getElementById("chooseLanguage");
var timer = document.getElementById("frequencySeekNewQuestions");
var notifications = document.getElementById("showNotifications");
var product = document.getElementById("chooseProduct");

// load data
var data = browser.storage.local.get();
data.then(loadSettings);

// insert settings into UI
function loadSettings(data) {
    // load language
    if (typeof data.chooseLanguage !== 'undefined' && data.chooseLanguage !== null) {
        language.value = data.chooseLanguage;
    } else {
        language.value = navigator.language;
    }
    
    // load check frequency
    if (typeof data.frequencySeekNewQuestions !== 'undefined' && data.frequencySeekNewQuestions !== null) {
        timer.value = data.frequencySeekNewQuestions;
    } else {
        timer.value = 15;
    }
    
    // load show notifications
    if (typeof data.showNotifications !== 'undefined' && data.showNotifications !== null) {
        notifications.checked = data.showNotifications;
    } else {
        notifications.checked = false;
    }

    // load product
    if (typeof data.chooseProduct !== 'undefined' && data.chooseProduct !== null) {
        product.value = data.chooseProduct;
    } else {
        product.value = "Firefox";
    }

    language.addEventListener('change', function() {
        browser.storage.local.set({chooseLanguage: language.value});
    });
    timer.addEventListener('change', function() {
        browser.storage.local.set({frequencySeekNewQuestions: timer.value});
    });
    notifications.addEventListener('change', function() {
        browser.storage.local.set({showNotifications: showNotifications.checked});
    });
    product.addEventListener('change', function() {
        browser.storage.local.set({chooseProduct: product.value});
    });
}