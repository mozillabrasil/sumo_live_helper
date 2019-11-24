// create connection to background.js
var connection = browser.runtime.connect();
connection.onMessage.addListener(handleMessage);

// load previously saved questions
connection.postMessage({
    code: 'popup_open'
});

// load locale
var locale;

// popup menu items
var refresh = document.getElementById('refresh');
var settings = document.getElementById('settings');
var openTab = document.getElementById('open_tab');
var load = document.getElementById('load');
var empty = document.getElementById('empty');
var questions = document.getElementById('questions');
var clear = document.getElementById('clear');

// title i18n
clear.title = browser.i18n.getMessage('clear_notifications');
refresh.title = browser.i18n.getMessage('refresh');
settings.title = browser.i18n.getMessage('open_preferences');

// clear notifications button
clear.addEventListener('click', clearNotifications, false);

// refresh button
refresh.addEventListener('click', function(){
    location.reload();
}, false);

// open preferences button
settings.addEventListener('click', function() {
    browser.tabs.create({
        url: 'preferences.html'
    });
}, false);

// view button
questions.addEventListener('click', function(e) {
    if (e.target.id) {
        changeStatus(e.target.id);
    }
}, false);

// handle messages from background.js
function handleMessage(message) {
    switch (message.code){
        case 'new_questions':
            addQuestions(message.questions);
            break;
        case 'sync_questions':
            savedQuestions = message.questions;
            locale = message.language;
            break;
        case 'hide_question':
            removeQuestion(message.id);
            break;
        case 'popup_open':
            savedQuestions = message.questions;
            locale = message.language;
            loaded();
            break;
        default:
            return;
    }
}

// runs when the browser loads the saved questions
function loaded() {
    // loads items from saved data
    for (var i = 0; i < savedQuestions.length; i++) {
        var product = savedQuestions[i].product.toLowerCase();
        var title = savedQuestions[i].title;
        var id = savedQuestions[i].id;
        var isNew = savedQuestions[i].new;
        createItem(product, title, id, isNew);
    }
    
    toggleScreen();
    callAPI();
}

// asks background.js to use SUMO API
function callAPI() {
    connection.postMessage({
        code: 'call_api'
    });
}

// add new questions to the list
function addQuestions(questions) {
    for (i = 0; i < questions.length; i++) {
        createItem(questions[i].product, 
                   questions[i].title, 
                   questions[i].id, true);
    }
    toggleScreen();
    load.style.display = 'none';
}

function createItem(product, title, id, isNew) {
  var items = document.getElementById('items');
  var item = document.createElement('li');
  var itemProduct = document.createElement('div');
  var itemTitle = document.createElement('div');
  var itemButton = document.createElement('div');
  var iconProduct = document.createElement('img');
  var button = document.createElement('a');
  var buttonIcon = document.createElement('img');
  var url = 'https://support.mozilla.org/'+locale+'/questions/'+id;

  // Generate question's elements
  browser.storage.local.get().then(res => {
    iconProduct.src = '../res/products/' + product + '.png';
    iconProduct.title = browser.i18n.getMessage('product_' + product);
  });
  iconProduct.className = 'item__icon';
  itemProduct.appendChild(iconProduct);

  itemTitle.textContent = title;
  
  button.className = 'button button-icon primary';
  button.id = id;
  //button.text = browser.i18n.getMessage('open_tab');
  button.href = url;
  browser.storage.local.get().then(res => {
    buttonIcon.src = '../res/icons/light/preferences.svg';
  });
  button.appendChild(buttonIcon);
  itemButton.appendChild(button);

  // Merge question's elements together
  item.appendChild(itemProduct);
  item.appendChild(itemTitle);
  item.appendChild(itemButton);

  items.appendChild(item);
}

// creates question item
//function createItem(product, title, id, isNew) {
//    // create elements
//    var questionOrder = document.createElement('div');
//    var questionTitle = document.createElement('label');
//    var iconProduct = document.createElement('img');
//    var zeroDiv = document.createElement('div');
//    var firstDiv = document.createElement('div');
//    var secondDiv = document.createElement('div');
//    var buttonOpen = document.createElement('a');
//    var section = document.querySelector('section');
//    var container = document.createElement('div');
//    var verticalContainer = document.createElement('div');
//    var spacer = document.createElement('div');
//    
//    // url of question
//    var url = 'https://support.mozilla.org/'+locale+'/questions/'+id;
//
//    // marks the question as read
//    if (isNew) {
//        questionOrder.className = 'new';
//    } else {
//        questionOrder.className = 'old';
//    }
//    
//    zeroDiv.className = 'margin-and-top-distance';
//    firstDiv.className = 'margin-and-top-distance';
//    secondDiv.className = 'panel-section-separator'
//    questionTitle.className = 'question-settings';
//    questionTitle.textContent = title;
//    iconProduct.className = 'popup-icon';
//
//    browser.storage.local.get().then(res => {
//        iconProduct.src = '../res/products/' + product + '.png';
//        iconProduct.title = browser.i18n.getMessage('product_' + product);
//    });
//
//    buttonOpen.className = 'button primary open-question';
//    buttonOpen.id = id;
//    buttonOpen.text = browser.i18n.getMessage('open_tab');
//    buttonOpen.href = url;
//    container.className = 'question-container';
//    verticalContainer.className = 'vertical-container';
//
//    var verticalContainer2 = verticalContainer.cloneNode(true);
//    var spacer2 = spacer.cloneNode(true);
//    var spacer3 = spacer.cloneNode(true);
//    var spacer4 = spacer.cloneNode(true);
//
//    questionOrder.appendChild(zeroDiv);
//
//    container.appendChild(verticalContainer);
//    verticalContainer.appendChild(spacer);
//    verticalContainer.appendChild(iconProduct);
//    verticalContainer.appendChild(spacer2);
//
//    container.appendChild(questionTitle);
//
//    container.appendChild(verticalContainer2);
//    verticalContainer2.appendChild(spacer3);
//    verticalContainer2.appendChild(buttonOpen);
//    verticalContainer2.appendChild(spacer4);
//
//    questionOrder.appendChild(container);
//    questionOrder.appendChild(firstDiv);
//    questionOrder.appendChild(firstDiv);
//    questionOrder.appendChild(secondDiv);
//
//    var buttons = document.getElementsByClassName('open-question');
//    var i = 0;
//    while (buttons[i] && buttons[i].id > id) {
//        i++;
//    }
//
//    if (i >= buttons.length) {
//        var pos = null;
//    } else {
//        var pos = section.childNodes[i];
//    }
//
//    section.insertBefore(questionOrder, pos);
//}

// shows/hides the question list
function toggleScreen() {
    if (savedQuestions.length > 0) {
        questions.style.display = 'block';
        empty.style.display = 'none';
    } else {
        questions.style.display = 'none';
        empty.style.display = 'block';
    }
}

// marks question as read
function changeStatus(id) {
    document.getElementById(id).parentNode.parentNode.parentNode.className = 'old';
    connection.postMessage({
        code: 'change_status',
        id: id
    });
}

// remove a question
function removeQuestion(id) {
    document.getElementById(id).parentNode.parentNode.parentNode.style.display = 'none';
}

// clears the notification and sets the title
function clearNotifications() {
    for (var i = 0; i < savedQuestions.length; i++) {
        changeStatus(savedQuestions[i].id);
    }
}
