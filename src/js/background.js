let locale = navigator.language;
let request = new XMLHttpRequest();
var requestAPI = "";
var numberOfQuestionsOpened = 0;
var idToRemoveFromArray;

// Array of id's
var questionsIds = [];

// settings to search questions using the Kitsune API
var product = "Firefox";
var is_solved = "False";
var is_spam = "False";
var is_locked = "False";
var is_taken = "False";
var is_archived = "False";

setInterval(function () {
    request.onload();
}, 900000); // checks every 15 minutes

// clicking the toolbar icon opens the questions on new tabs
browser.browserAction.onClicked.addListener(openPageSUMO);

function initAPICall() {
  // request for questions not solved, not spam, not locked, product Firefox, not taken, not archived
  // and using the language based of the Firefox used
  requestAPI = "https://support.mozilla.org/api/2/question/?format=json&ordering=-id&is_solved="+is_solved+"&is_spam="+
                is_spam+"&is_locked="+is_locked+"&product="+product+"&is_taken="+is_taken+"&is_archived="+is_archived+"&locale="+locale,
  request.open('GET', requestAPI, true);
  request.responseType = 'json';
  request.send();
}

initAPICall();

// search for new questions
request.onload = function() {
        var responseSUMO = request.response;
        for(var i = 0; i < 20; i++){
                if(responseSUMO.results[i].num_answers == 0){
                    for(var j = 0; j < responseSUMO.results[i].tags.length; j++){
                        if(responseSUMO.results[i].tags[j].name == "desktop" && responseSUMO.results[i].tags[j].slug == "desktop"){
                            numberOfQuestionsOpened = numberOfQuestionsOpened + 1;
                            // saves the number of questions opened
                            localStorage.setItem('numberOfQuestionsOpened', numberOfQuestionsOpened);
                            // saves the id of the question in the Array
                            questionsIds.push(responseSUMO.results[i].id);
                        }
                    }
                }
        }

        // number of questions opened
        console.log("Questions opened = "+numberOfQuestionsOpened);

        // verifies if have any questions opened
        if(localStorage.getItem('numberOfQuestionsOpened') >= 1){
            browser.browserAction.setBadgeText({text: localStorage.getItem('numberOfQuestionsOpened')});
        }else{
            browser.browserAction.setBadgeText({text: ''});
        }

        // changes the title
        if(localStorage.getItem('numberOfQuestionsOpened') >= 2){
            browser.browserAction.setTitle({title: localStorage.getItem('numberOfQuestionsOpened')+browser.i18n.getMessage("more_than_one_question_without_answer")});
        }else if (localStorage.getItem('numberOfQuestionsOpened') == 1){
            browser.browserAction.setTitle({title: localStorage.getItem('numberOfQuestionsOpened')+browser.i18n.getMessage("one_question_without_answer")});
        }else{
            browser.browserAction.setBadgeText({text: ''});
        }

        // clears the number of questions
        numberOfQuestionsOpened = 0;
}

// when click at toolbar icon will open the Firefox questions on new tabs
function openPageSUMO() {
    // opens each question in a separate tab
    for (var i = 0; i < questionsIds.length; i++){
        browser.tabs.create({
            url: 'https://support.mozilla.org/'+locale+'/questions/'+questionsIds[i]
        });
        // removes the id's from the Array
        idToRemoveFromArray = i;
        questionsIds.shift(idToRemoveFromArray);
    }
    // clears the notification and sets the title
    browser.browserAction.setBadgeText({text: ''});
    browser.browserAction.setTitle({title: localStorage.getItem('extensionName')});
}