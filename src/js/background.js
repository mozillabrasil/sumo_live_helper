let request = new XMLHttpRequest();
let savedQuestions = browser.storage.local.get('questions');
savedQuestions.then(loaded);
var requestAPI = "";
var numberOfQuestionsOpened = 0;
var isPopup = isPopup();

// stored values
var frequencySeekNewQuestions = localStorage.getItem("frequencySeekNewQuestions");
var locale = localStorage.getItem("chooseLanguage");
var showNotifications = localStorage.getItem("showNotifications");

// set the preferences settings
if (typeof frequencySeekNewQuestions === 'undefined' || frequencySeekNewQuestions === null){
    frequencySeekNewQuestions = 15;
    localStorage.setItem("frequencySeekNewQuestions", frequencySeekNewQuestions);
}

if (typeof locale === 'undefined' || locale === null){
    locale = navigator.language;
    localStorage.setItem("chooseLanguage", locale);
}

// settings to search questions using the Kitsune API
var product = "Firefox";
var is_solved = "False";
var is_spam = "False";
var is_locked = "False";
var is_taken = "False";
var is_archived = "False";

// popup menu
var refresh = document.getElementById('refresh');
var openTab = document.getElementById('open_tab');
var load = document.getElementById('load');
var empty = document.getElementById('empty');
var questions = document.getElementById('questions');
var clear = document.getElementById('clear');
var questionOpened = '';

// title i18n
clear.title = browser.i18n.getMessage("clear_notifications");
refresh.title = browser.i18n.getMessage("refresh");

// Event Listener
clear.addEventListener('click', function(){
    clearNotifications();
}, false);

refresh.addEventListener('click', function(){
    location.reload();
}, false);

questions.addEventListener('click', function(e) {
    if (e.target.id) {
        changeStatus(e.target.id);
    }
}, false);

// API limitations prevent this
/*browser.notifications.onClicked.addListener(function() {
    browser.browserAction.openPopup();
});*/

// automatically refresh
browser.alarms.create('checkSUMO',{delayInMinutes: parseInt(frequencySeekNewQuestions)}); // checks every X minutes
browser.alarms.onAlarm.addListener(function(){
    request.onload();
});

// loads questions from SUMO
function initAPICall() {
    // request for questions not solved, not spam, not locked, product Firefox, not taken, not archived
    // and using the language based of the Firefox used
    requestAPI = "https://support.mozilla.org/api/2/question/?format=json&ordering=-id&is_solved="+is_solved+"&is_spam="+
                is_spam+"&is_locked="+is_locked+"&product="+product+"&is_taken="+is_taken+"&is_archived="+is_archived+"&locale="+locale,
    request.open('GET', requestAPI, true);
    request.responseType = 'json';
    request.send();
}

// runs when the browser loads the saved questions
function loaded(data) {
    if (data.questions) {
        savedQuestions = data.questions;
    } else {
        savedQuestions = [];
    }
    
    // loads items from saved data
    for (var i = 0; i < savedQuestions.length; i++) {
        var title = savedQuestions[i].title;
        var id = savedQuestions[i].id;
        var isNew = savedQuestions[i].new;
        createItem(title, id, isNew);
    }
    questionCount();
    toggleScreen();
    initAPICall();
}

// adds a question to the popup
function createItem(title, id, isNew) {
    // create elements
    var questionOrder = document.createElement("div");
    var questionTitle = document.createElement("label");
    var iconProduct = document.createElement("img");
    var zeroDiv = document.createElement("div");
    var firstDiv = document.createElement("div");
    var secondDiv = document.createElement("div");
    var buttonOpen = document.createElement("a");
    var section = document.querySelector("section");
    var container = document.createElement("div");
    var verticalContainer = document.createElement("div");
    var spacer = document.createElement("div");
    
    // url of question
    var url = "https://support.mozilla.org/"+locale+"/questions/"+id;

    if (isNew) {
        questionOrder.className = 'new';
    } else {
        questionOrder.className = 'old';
    }
    
    //
    zeroDiv.className = "col-md-12 margin-and-top-distance";
    firstDiv.className = "col-md-12 margin-and-top-distance";
    secondDiv.className = "panel-section-separator"
    questionTitle.className = "text-justify question-settings";
    questionTitle.textContent = title;
    iconProduct.className = "icon-size-and-distance";
    iconProduct.title = browser.i18n.getMessage("firefox_for_desktop");
    iconProduct.src = "../res/icons/firefox.png";
    buttonOpen.className = "btn btn-primary btn-settings";
    buttonOpen.id = id;
    buttonOpen.text = browser.i18n.getMessage("open_tab");
    buttonOpen.href = url;
    container.className = "question-container";
    verticalContainer.className = "vertical-container";

    //
    var verticalContainer2 = verticalContainer.cloneNode(true);
    var spacer2 = spacer.cloneNode(true);
    var spacer3 = spacer.cloneNode(true);
    var spacer4 = spacer.cloneNode(true);

    //
    questionOrder.appendChild(zeroDiv);

    container.appendChild(verticalContainer);
    verticalContainer.appendChild(spacer);
    verticalContainer.appendChild(iconProduct);
    verticalContainer.appendChild(spacer2);

    container.appendChild(questionTitle);

    container.appendChild(verticalContainer2);
    verticalContainer2.appendChild(spacer3);
    verticalContainer2.appendChild(buttonOpen);
    verticalContainer2.appendChild(spacer4);

    questionOrder.appendChild(container);
    questionOrder.appendChild(firstDiv);
    questionOrder.appendChild(firstDiv);
    questionOrder.appendChild(secondDiv);

    section.appendChild(questionOrder);
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
        browser.browserAction.setTitle({title: numberOfQuestionsOpened+browser.i18n.getMessage("more_than_one_question_without_answer")});
    }else if (numberOfQuestionsOpened == 1){
        browser.browserAction.setTitle({title: numberOfQuestionsOpened+browser.i18n.getMessage("one_question_without_answer")});
    }else{
        browser.browserAction.setBadgeText({text: ''});
    }
}

// shows/hides the question list
function toggleScreen() {
    if (savedQuestions.length > 0) {
        questions.style.display = "block";
        empty.style.display = "none";
    } else {
        questions.style.display = "none";
        empty.style.display = "block";
    }
}

// marks a question as viewed
function changeStatus(id) {
    document.getElementById(id).parentNode.parentNode.parentNode.className = 'old';
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
    questionCount();
}

// removes old questions from storage
function removeOld(list) {
    var i = 0;
    while (i < savedQuestions.length) {
        var x = 0;
        var found = false;
        while (x < list.length && !found) {
            if (savedQuestions[i].id == list[x].id) {
                found = true;
            }
            x++;
        }
        if (!found) {
            document.getElementById(savedQuestions[i].id).parentNode.parentNode.parentNode.style.display = 'none';
            savedQuestions.splice(i,1);
        } else {
            i++;
        }
   }
}

// search for new questions
request.onload = function() {
        var responseSUMO = request.response;
        var newQuestionList = [];
        for(var i = 0; i < 20; i++){
            if(responseSUMO.results[i].num_answers == 0){
                for(var j = 0; j < responseSUMO.results[i].tags.length; j++){
                    if(responseSUMO.results[i].tags[j].name == "desktop" && responseSUMO.results[i].tags[j].slug == "desktop"){
                        var id = responseSUMO.results[i].id;
                        var title = responseSUMO.results[i].title;
                        
                        var x = 0;
                        var questionExists = false;
                        while (x < savedQuestions.length && !questionExists) {
                            questionExists = (id == savedQuestions[x].id);
                            x++;
                        }

                        if (!questionExists) {
                            createItem(title, id, true);
                            var newItem = {
                                product: 'firefox_for_desktop',
                                title: responseSUMO.results[i].title,
                                id: id,
                                new: true
                            }
                            newQuestionList.push(newItem);
                        }
                    }
                }
            }
        }
        
        removeOld(responseSUMO.results);
        savedQuestions = newQuestionList.concat(savedQuestions);
        browser.storage.local.set({'questions':savedQuestions});
        
        if (!isPopup && showNotifications && newQuestionList.length > 0) {
            showNotification(newQuestionList);
        }

        toggleScreen();
        questionCount();
        load.style.display = 'none';
}

function showNotification(questions) {
    var num = questions.length;
    var title = num + ' ';
    var message = '"' + questions[0].title + '"';
    
    if (num == 1) {
        title += browser.i18n.getMessage("notification_title_single");
    } else {
        title += browser.i18n.getMessage("notification_title_multiple");
        message += ' & ' + (num - 1) + ' ' + browser.i18n.getMessage("notification_message_more");
    }
    message += '\n\n' + browser.i18n.getMessage("notification_message_click");
    browser.notifications.create({
        "type": "basic",
        "iconUrl": chrome.extension.getURL("/res/icons/icon-32.png"),
        "title": title,
        "message": message
    });
}

// clears the notification and sets the title
function clearNotifications() {
    for (var i = 0; i < savedQuestions.length; i++) {
        changeStatus(savedQuestions[i].id);
    }
    browser.browserAction.setBadgeText({text: ''});
    browser.browserAction.setTitle({title: localStorage.getItem('extensionName')});
}