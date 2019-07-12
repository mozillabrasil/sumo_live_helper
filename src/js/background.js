var locale = navigator.language;
var numberOfQuestionsOpened = 0;

setInterval(function () {
    request.onload();
}, 900000);

// click at toolbar icon and open page SUMO
browser.browserAction.onClicked.addListener(openPageSUMO);

function initAPICall() {
  // request questions opened without any answer
  requestAPI = "https://support.mozilla.org/api/2/question/?format=json&ordering=-id&is_spam=False&is_locked=False&is_taken=False",
  request.open('GET', requestAPI, true);
  request.responseType = 'json';
  request.send();
}

var requestAPI = "";
var request = new XMLHttpRequest();

initAPICall();

// fetch the new questions
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
        console.log("Questions opened "+numberOfQuestionsOpened);

        browser.browserAction.setBadgeText({text: localStorage.getItem('numberOfQuestionsOpened')});
        numberOfQuestionsOpened = 0;
}

// when click at toolbar icon will open the Firefox questions on the Forum
function openPageSUMO() {
    browser.tabs.create({
        url: 'https://support.mozilla.org/'+locale+'/questions/firefox'
    });
    localStorage.setItem('numberOfQuestionsOpened', '');
    browser.browserAction.setBadgeText({text: localStorage.getItem('numberOfQuestionsOpened')});
}