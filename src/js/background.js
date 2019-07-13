let locale = navigator.language;
let requestAPI = "";
let request = new XMLHttpRequest();
var numberOfQuestionsOpened = 0;

setInterval(function () {
    request.onload();
}, 900000); // check every 15 minutes

// clicking the toolbar icon opens the Firefox for Desktop Support Forum page with new questions
browser.browserAction.onClicked.addListener(openPageSUMO);

function initAPICall() {
  // request questions opened without any answer, no locked and no spam
  requestAPI = "https://support.mozilla.org/api/2/question/?format=json&ordering=-id&is_spam=False&is_locked=False&is_taken=False",
  request.open('GET', requestAPI, true);
  request.responseType = 'json';
  request.send();
}

initAPICall();

// search for new questions
request.onload = function() {
        var responseSUMO = request.response;
        for(var i = 0; i < 20; i++){
            if(responseSUMO.results[i].locale == locale){
                browser.browserAction.setBadgeTextColor({color: "white"});
                numberOfQuestionsOpened = numberOfQuestionsOpened + 1;
                localStorage.setItem('numberOfQuestionsOpened', numberOfQuestionsOpened);
            }
        }

        // how many questions
        console.log("Questions opened = "+numberOfQuestionsOpened);

        browser.browserAction.setBadgeText({text: localStorage.getItem('numberOfQuestionsOpened')});

        // changes the title
        if(localStorage.getItem('numberOfQuestionsOpened') >= 2){
            browser.browserAction.setTitle({title: localStorage.getItem('numberOfQuestionsOpened')+browser.i18n.getMessage("number_of_questions")});
        }else{
            browser.browserAction.setTitle({title: localStorage.getItem('numberOfQuestionsOpened')+browser.i18n.getMessage("one_question")});
        }
        numberOfQuestionsOpened = 0;
}

// when click at toolbar icon will open the Firefox questions on the Forum
function openPageSUMO() {
    browser.tabs.create({
        url: 'https://support.mozilla.org/'+locale+'/questions/firefox?filter=new'
    });

    // clears the notification of the Add-on icon in the toolbar
    localStorage.setItem('numberOfQuestionsOpened', '');
    browser.browserAction.setBadgeText({text: localStorage.getItem('numberOfQuestionsOpened')});

    // changes the title to default
    browser.browserAction.setTitle({title: browser.i18n.getMessage("extensionName")});
}