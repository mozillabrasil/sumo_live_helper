let request = new XMLHttpRequest();
var frequencySeekNewQuestions, locale, showNotifications;
let savedQuestions = browser.storage.local.get();
savedQuestions.then(loaded);
var numberOfQuestionsOpened = 0;
var popup = null;
var popupOpen = false;
browser.runtime.onConnect.addListener(connected);
browser.alarms.onAlarm.addListener(callAPI);

// detects changes to the settings
function settingsUpdated(changes, area) {
    var changedItems = Object.keys(changes);
    for (var item of changedItems) {
        switch (item) {
            case 'frequencySeekNewQuestions':
                frequencySeekNewQuestions = changes[item].newValue;
                createAlarm(changes[item].newValue);
                break;
            case 'chooseLanguage':
                locale = changes[item].newValue;
                callAPI();
                break;
            case 'showNotifications':
                showNotifications = changes[item].newValue;
                break;
            case 'chooseProduct':
                product = changes[item].newValue;
                break;
            default:
                return;
        }
    }
    callAPI();
}

// settings to search questions using the Kitsune API
var product;
var is_solved = 'false';
var is_spam = 'false';
var is_locked = 'false';
var is_taken = 'false';
var is_archived = 'false';
var questionOpened = '';

var data = browser.storage.local.get();

if(data.chooseProduct == 'undefined' || data.chooseProduct == null){
    product = ['Firefox'];
    browser.storage.local.set({chooseProduct: product});
}else if (typeof data.chooseProduct === 'string'){
    product = [data.chooseProduct];
}else {
    product = data.chooseProduct;
}

// API limitations prevent this
/*browser.notifications.onClicked.addListener(function() {
    browser.browserAction.openPopup();
});*/

// creates API check
function createAlarm(time) {
    browser.alarms.create('checkSUMO', {periodInMinutes: parseInt(time)}); // checks every X minutes
}

// creates connection to popup
function connected(connection) {
    popupOpen = true;
    popup = connection;
    popup.onMessage.addListener(messageListener);
    popup.onDisconnect.addListener(closeConnection);
}

// closes connection to popup
function closeConnection() {
    popupOpen = false;
    popup.onMessage.removeListener(messageListener);
    popup.onDisconnect.removeListener(closeConnection);
    popup = null;
}

// handles messages from popup
function messageListener(message) {
    switch (message.code) {
        case 'call_api':
            callAPI();
            break;
        case 'change_status':
            changeStatus(message.id);
            break;
        case 'popup_open':
            if (popup != null) {
                popup.postMessage({
                    code: 'popup_open',
                    questions: savedQuestions,
                    language: locale
                });
            }
            break;
        default:
            return;
    }
}

// loads questions from SUMO
function callAPI() {
    // request for questions not solved, not spam, not locked, product Firefox, not taken, not archived
    // and using the language based of the Firefox used
    for (i = 0; i < product.length; i++) {
        var requestAPI = 'https://support.mozilla.org/api/2/question/?format=json&ordering=-id&is_solved='+is_solved+'&is_spam='+is_spam+'&is_locked='+is_locked+'&product='+product[i]+'&is_taken='+is_taken+'&is_archived='+is_archived+'&locale='+locale;
        request.open('GET', requestAPI, true);
        request.responseType = 'json';
        request.send();
    }
}

// runs when the browser loads the saved questions
function loaded(data) {
    if (data.questions) {
        savedQuestions = data.questions;
    } else {
        savedQuestions = [];
    }
    
    if (typeof data.frequencySeekNewQuestions === 'undefined' || data.frequencySeekNewQuestions === null){
        frequencySeekNewQuestions = 15;
        browser.storage.local.set({frequencySeekNewQuestions: frequencySeekNewQuestions});
    } else {
        frequencySeekNewQuestions = data.frequencySeekNewQuestions;
    }

    if (typeof data.chooseLanguage === 'undefined' || data.chooseLanguage === null){
        locale = "en-US";
        browser.storage.local.set({chooseLanguage: locale});
    } else {
        locale = data.chooseLanguage;
    }
    
    if (typeof data.showNotifications === 'undefined' || data.showNotifications === null){
        showNotifications = false;
        browser.storage.local.set({showNotifications: showNotifications});
    } else {
        showNotifications = data.showNotifications;
    }

    if (typeof data.chooseProduct === 'undefined' || data.chooseProduct === null){
        product = "Firefox";
        browser.storage.local.set({chooseProduct: product});
    } else {
        product = data.chooseProduct;
    }

    browser.storage.onChanged.addListener(settingsUpdated);
    createAlarm(frequencySeekNewQuestions);
    questionCount();
    callAPI();
}

// updates the question notification counter
function questionCount() {
    numberOfQuestionsOpened = 0;
    for (var i = 0; i < savedQuestions.length; i++) {
        if (savedQuestions[i].new) {
            numberOfQuestionsOpened++;
        }
    }
    
    // verifies if have any questions opened
    if (numberOfQuestionsOpened > 0) {
        browser.browserAction.setBadgeText({text: numberOfQuestionsOpened.toString()});
    } else {
        browser.browserAction.setBadgeText({text: ''});
    }

    // changes the title
    if(numberOfQuestionsOpened >= 2){
        browser.browserAction.setTitle({title: numberOfQuestionsOpened+browser.i18n.getMessage('more_than_one_question_without_answer')});
    }else if (numberOfQuestionsOpened == 1){
        browser.browserAction.setTitle({title: numberOfQuestionsOpened+browser.i18n.getMessage('one_question_without_answer')});
    }else{
        browser.browserAction.setBadgeText({text: ''});
    }
}

// removes old questions from storage
function removeOld(list, prod) {
    var temp = product.map(function(value) {
        return value.toLowerCase();
    });
    var i = 0;
    while (i < savedQuestions.length) {
        var x = 0;
        var found = false;
        var skip = false;
        var matchesList = (savedQuestions[i].product.toLowerCase() == prod);
        var isPossible = temp.includes(savedQuestions[i].product.toLowerCase());
        
        if (isPossible && !matchesList) {
            found = true;
        }
        
        while (x < list.length && !found && matchesList) {
            if (savedQuestions[i].id == list[x].id) {
                found = true;
            }
            x++;
        }
        
        if (!found) {
            if (popup != null) {
                popup.postMessage({
                    code: 'hide_question',
                    id: savedQuestions[i].id
                });
            }
            savedQuestions.splice(i,1);
        } else {
            i++;
        }
    }
    
    savedQuestions.sort(function(a, b) {return b.id - a.id});
    
    browser.storage.local.set({'questions':savedQuestions});
    syncQuestions();
}

// search for new questions
request.onload = function() {
    var responseSUMO = request.response;
    var newQuestionList = [];
    for(var i = 0; i < 20; i++){
        if(responseSUMO.results[i].num_answers == 0){
                    var id = responseSUMO.results[i].id;
                    var title = responseSUMO.results[i].title;

                    var x = 0;
                    var questionExists = false;
                    while (x < savedQuestions.length && !questionExists) {
                        questionExists = (id == savedQuestions[x].id);
                        x++;
                    }

                    if (!questionExists) {
                        var newItem = {
                            product: responseSUMO.results[i].product,
                            title: responseSUMO.results[i].title,
                            id: id,
                            new: true
                        }
                        newQuestionList.push(newItem);
            }
        }
    }

    removeOld(responseSUMO.results, responseSUMO.results[0].product);
    savedQuestions = newQuestionList.concat(savedQuestions);
    browser.storage.local.set({'questions':savedQuestions});

    if (!popupOpen && showNotifications && newQuestionList.length > 0) {
        showNotification(newQuestionList);
    }

    questionCount();
    
    if (popup) {
        syncQuestions();
        popup.postMessage({
            code: 'new_questions',
            questions: newQuestionList
        });
    }
}

// marks question as read
function changeStatus(id) {
    var i = 0;
    var found = false;
    while (i < savedQuestions.length && !found) {
        if (savedQuestions[i].id == id) {
            found = true;
        }
        i++;
    }
    i--;
    savedQuestions[i].new = false;
    browser.storage.local.set({'questions':savedQuestions});
    syncQuestions();
    questionCount();
}

function syncQuestions() {
    if (popup != null) {
        popup.postMessage({
            code: 'sync_questions',
            questions: savedQuestions,
            language: locale
        });
    }
}

function showNotification(questions) {
    var num = questions.length;
    var title = num + ' ';
    var message = '"' + questions[0].title + '"';
    
    if (num == 1) {
        title += browser.i18n.getMessage('notification_title_single');
    } else {
        title += browser.i18n.getMessage('notification_title_multiple');
        message += ' & ' + (num - 1) + ' ' + browser.i18n.getMessage('notification_message_more');
    }
    message += '\n\n' + browser.i18n.getMessage('notification_message_click');
    browser.notifications.create({
        type: 'basic',
        iconUrl: chrome.extension.getURL('/res/icons/icon-32.png'),
        title: title,
        message: message
    });
}
