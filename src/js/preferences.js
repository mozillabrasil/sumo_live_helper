// version
var version = document.getElementById("version");
version.textContent = " (v" + browser.runtime.getManifest().version + ")";

// store option UI elements
var language = document.getElementById("chooseLanguage");
var timer = document.getElementById("frequencySeekNewQuestions");
var notifications = document.getElementById("showNotifications");
var products = document.getElementsByClassName("product-selection");

// load data
var data = browser.storage.local.get();
data.then(loadSettings);

// insert settings into UI
function loadSettings(data) {
    // load language
    if (typeof data.chooseLanguage !== 'undefined' && data.chooseLanguage !== null) {
        language.value = data.chooseLanguage;
    } else {
        language.value = "en-US";
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
        var temp = data.chooseProduct;
        for (i = 0; i < temp.length; i++) {
            document.getElementById(temp[i].toLowerCase()).checked = true;
        }
    } else {
        document.getElementById('firefox').checked = true;
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
    for (i = 0; i < products.length; i++) {
        products[i].addEventListener('change', function() {
            saveProducts();
        });
    }
}

// Saves user product selection
function saveProducts() {
    var temp = [];
    for (i = 0; i < products.length; i++) {
        if (products[i].checked) {
            temp.push(products[i].value);
        }
    }
    browser.storage.local.set({chooseProduct: temp});
}