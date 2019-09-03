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

// temporary solution to issue #60
var ios = document.getElementById("ios");
var firefoxEnterprise = document.getElementById("firefox-enterprise");
var android = document.getElementById("mobile");
var thunderbird = document.getElementById("thunderbird");

language.addEventListener("click", function(){
    if (language.value == "fr") {
        ios.style.display = "none";
        firefoxEnterprise.style.display = "none";
        android.style.display = "none";
        thunderbird.style.display = "none";
        product.value = "Firefox";
        browser.storage.local.set({chooseProduct: product.value});
    }else {
         ios.style.display = "block";
         firefoxEnterprise.style.display = "block";
         android.style.display = "block";
         thunderbird.style.display = "block";
    }
}, false);
//

// insert settings into UI
function loadSettings(data) {
    // load language
    if (typeof data.chooseLanguage !== 'undefined' && data.chooseLanguage !== null) {
        language.value = data.chooseLanguage;
    } else {
        language.value = "en-US";
    }

// temporary solution to issue #60
    if (language.value == "fr") {
        ios.style.display = "none";
        firefoxEnterprise.style.display = "none";
        android.style.display = "none";
        thunderbird.style.display = "none";
        product.value = "Firefox";
        browser.storage.local.set({chooseProduct: product.value});
    }else {
         ios.style.display = "block";
         firefoxEnterprise.style.display = "block";
         android.style.display = "block";
         thunderbird.style.display = "block";
    }
//

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