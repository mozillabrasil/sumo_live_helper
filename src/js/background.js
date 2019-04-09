/*set up timings*/
function codeloop() {
    liveHelper = timer.setInterval(function(){
        getLoginstate();
        timer.setTimeout(fetchQuestion, 37000);
        timer.setTimeout(fetchInvolved, 9000);
    }, PollingTime());
}

/*toggle button*/
var button = ToggleButton({
    id: "sumo-live-helper-button",
    label: "SUMO Live Helper",
    icon: {
        "16": "../res/icons/icon-16.png",
        "32": "../res/icons/icon-32.png",
        "64": "../res/icons/icon.png"
    },
    onChange: function(state) {
        if (state.checked === true) {
            prefs.helper_enabled = true;
            button.label = "SUMO Live Helper: on";
            getLoginstate();
            timer.clearInterval(liveHelper);
            codeloop();
            console.log("Helper on");
        }
        else if (state.checked === false) {
            prefs.helper_enabled = false;
            button.label = "SUMO Live Helper: off";
            timer.clearInterval(liveHelper);
            console.log("Helper off");
        }
    }
});

/*set initial state*/
if (prefs.helper_enabled === false) {
    button.label = "SUMO Live Helper: off";
    button.checked = false;
    timer.clearInterval(liveHelper);
}
else {
    prefs.helper_enabled = true;
    button.label = "SUMO Live Helper: on";
    button.checked = true;
    getLoginstate();
    timer.clearInterval(liveHelper);
    codeloop();
    console.log("Helper on");
}

/*listen for changes to settings*/
require("sdk/simple-prefs").on("", prefsChange);

function prefsChange(Prefname) {
    console.log(Prefname + " changed state to: " + require('sdk/simple-prefs').prefs[Prefname]);
    if (prefs.helper_enabled === true) {
        timer.clearInterval(liveHelper);
        codeloop();
    }
}

/*convert polling interval from minutes to ms*/
function PollingTime() {
    return prefs.polling * 60000;
}

/*looking for new questions*/
function fetchQuestion() {
    var questionRequest = Request({
        url: "https://support.mozilla.org/api/2/question/?format=json&ordering=-id&is_spam=False&is_locked=False&is_taken=False",
        onComplete: function(response) {
        var latestsumoquestionid = response.json.results[0].id;
            var sumoquestionid, sumoquestioncreator, sumoquestiontitle, sumoquestioncontent, sumoquestionproduct, sumoquestionlocale;
            
            if (ss.storage.lastpage == latestsumoquestionid) {
                console.log("Question " + latestsumoquestionid + " has already been seen, no action required...");
            }

            else if (latestsumoquestionid === undefined) {
                console.log("Last known question was " + ss.storage.lastpage + ". Couldn't fetch update now, try again later...");
            }
            
            else if (ss.storage.lastpage > latestsumoquestionid) {
                console.log("timewarp - waiting for future questions to catch up with the past present");
            }
            
            else {
                /*find the oldest thread not looked at yet and increase id by one*/
                if (ss.storage.lastpage < latestsumoquestionid && (latestsumoquestionid - ss.storage.lastpage) < 7) {
                    cyclethrough_questions:
                    for (var i = latestsumoquestionid - ss.storage.lastpage; i >= 0; i--) {
                        if (response.json.results[i].id > ss.storage.lastpage) {
                            sumoquestionid = response.json.results[i].id;
                            sumoquestioncreator = response.json.results[i].creator.username;
                            sumoquestiontitle = response.json.results[i].title;
                            sumoquestioncontent = response.json.results[i].content;
                            sumoquestionproduct = response.json.results[i].product;
                            sumoquestionlocale = response.json.results[i].locale;
                            break cyclethrough_questions;
                        }
                    }
                }
                /*start fresh if no prior threads were looked at or they are too out of date*/
                else {
                    sumoquestionid = response.json.results[0].id;
                    sumoquestioncreator = response.json.results[0].creator.username;
                    sumoquestiontitle = response.json.results[0].title;
                    sumoquestioncontent = response.json.results[0].content;
                    sumoquestionproduct = response.json.results[0].product;
                    sumoquestionlocale = response.json.results[0].locale;
                }
                
                /*looking for keywords in question first*/
                var alertexisting = 0;
                if (prefs.notify_keywords === true && RegExp(prefs.keywords, "i").test(sumoquestiontitle+sumoquestioncontent) === true) {
                    alertexisting = 1;
                    notifications.notify({
                        title: "SUMO - Question matches one of keyword alerts:",
                        text: sumoquestiontitle,
                        data: "",
                        iconURL: ss.storage.avatar,
                        onClick: function() {
                            tabs.open("https://support.mozilla.org/questions/" + sumoquestionid);
                        }
                    });
                    
                    if (prefs.notify_opentab === true){
                        var duplicateexisting = 0;
                        for (var n = 0; n < tabs.length; n++) {
                            var url = require("sdk/url").URL(tabs[n].url);
                            if ((url.path).indexOf("/questions/" + sumoquestionid) > -1){
                                tabs[n].reload();
                                tabs[n].activate();
                                duplicateexisting = 1;
                            }
                        }
                        if (duplicateexisting !== 1) {
                            tabs.open({
                                url: "https://support.mozilla.org/questions/" + sumoquestionid,
                                inBackground: true,
                            });
                        }
                    }
                }

                /*only notify for languages/products set in the addons-panel*/
                if (alertexisting !== 1 && (true === true && sumoquestionlocale === "en-US" || prefs.watch_es === true && sumoquestionlocale === "es" || prefs.watch_pt === true && sumoquestionlocale === "pt-BR"))  {
                    if (prefs.watch_firefox === true && sumoquestionproduct === "firefox" || prefs.watch_mobile === true && sumoquestionproduct === "mobile" || prefs.watch_thunderbird === true && sumoquestionproduct === "thunderbird" ){
                        var classifyResult = classifyQuestion(sumoquestiontitle, sumoquestioncontent);

                        /*show notification only if not suspected spammy*/
                        if (classifyResult == "clear") {
                            var icon = self.data.url(sumoquestionproduct + ".png");
                            notifications.notify({
                                title: "SUMO - " + sumoquestioncreator + " asked:",
                                text: sumoquestiontitle,
                                data: "",
                                iconURL: icon,
                                onClick: function() {
                                    tabs.open("https://support.mozilla.org/questions/" + sumoquestionid);
                                }
                            });
                        }
                        else {
                            console.log("Maybe spammy - leave it to mods...");
                        }
                    }    
                }
                
                ss.storage.lastpage = sumoquestionid;
                if (ss.storage.lastpage < latestsumoquestionid) {
                    timer.setTimeout(fetchQuestion, 7000);
            }
            }  
        }
    });
    questionRequest.get();
}

/*test if user is logged in*/
function getLoginstate(){
    var getAuth = Request({
        url: "https://support.mozilla.org/api/1/users/test_auth?format=json",
        onComplete: function(authresponse) {
            var sumouser = authresponse.json.username;
            if (sumouser === undefined){
                button.label = "SUMO Live Helper: on \n\nnot logged in at support.mozilla.org yet";
            }
            else {
                /*show first time login welcome note*/
                if (ss.storage.username !== sumouser){
                    notifications.notify({
                        title: "Welcome to SUMO, " + sumouser + "!",
                        text: "Do you want to answer some questions?",
                        data: "",
                        onClick: function() {
                            tabs.open("https://support.mozilla.org/questions/all?filter=recently-unanswered&show=all");
                        }
                    });
                }
                ss.storage.username = sumouser;
                
                /*retrieve user data*/
                var getUserdetails = Request({
                    url: "https://support.mozilla.org/api/2/user/" + sumouser + "/?format=json",
                    onComplete: function(userresponse) {
                        
                        /*notification if solved questions have gone up from previously recorded high*/
                        if (ss.storage.solution_count !== undefined && (userresponse.json.solution_count - ss.storage.solution_count)>0){
                            notifications.notify({
                                iconURL: ss.storage.avatar,
                                title: "You've just solved another question!",
                                text: "Thank you for helping out on SUMO, " + sumouser + "...",
                            });
                            ss.storage.solution_count = userresponse.json.solution_count;
                        }
                        else if (ss.storage.solution_count === undefined) {
                            ss.storage.solution_count = userresponse.json.solution_count;
                        }
                        
                        /*store various indicators in simple storage db*/
                        ss.storage.displayname = userresponse.json.displayname;
                        ss.storage.answer_count = userresponse.json.answer_count;
                        ss.storage.helpfulness = userresponse.json.helpfulness;
                        ss.storage.avatar = userresponse.json.avatar;
                        
                        /*adjust button tooltip label with statistics*/
                        var labeltext;
                        if (userresponse.json.solution_count === 0){
                            labeltext = "Just starting...\n" + ss.storage.answer_count + " questions answered so far";}
                        else {
                            labeltext = ss.storage.answer_count + " answers\n" + ss.storage.solution_count + " solutions (" + (ss.storage.solution_count/ss.storage.answer_count*100).toFixed(1) + "%)\n" + ss.storage.helpfulness +  " helpful votes (" + (ss.storage.helpfulness/ss.storage.answer_count*100).toFixed(1) + "%)";}
                        button.label = "SUMO Live Helper: "+ sumouser + "\n\n" + labeltext;
                    }
                });
                getUserdetails.get();
            }
        }
    });
    getAuth.get();
}

/*query for threads where logged-in user was involved in order to show updates*/
function fetchInvolved() {
    var involvedRequest = Request({
        url: "https://support.mozilla.org/api/2/question/?involved=" + ss.storage.username + "&ordering=-updated&is_spam=False&is_locked=False&format=json",
        onComplete: function(involved) {
        var latestsumoinvolvedupdate = Date.parse(involved.json.results[0].updated);
            var sumoinvolvedtime, sumoinvolvedid, sumoinvolvedlastanswer, sumoinvolvedtitle;
            
            if (ss.storage.lastinvolvedtime == latestsumoinvolvedupdate) {
                console.log("Involved question " + latestsumoinvolvedupdate + " has already been seen, no action required...");
            }

            else if (latestsumoinvolvedupdate === undefined) {
                console.log("Last known involved question was " + ss.storage.lastinvolvedtime + ". Couldn't fetch update now, try again later...");
            }
            
            else if (ss.storage.lastinvolvedtime > latestsumoinvolvedupdate) {
                console.log("timewarp - waiting for future questions to catch up with the past present");
            }
            
            else {
                /*find the oldest thread not looked at yet within the last half day*/
                if (ss.storage.lastinvolvedtime < latestsumoinvolvedupdate && latestsumoinvolvedupdate - ss.storage.lastinvolvedtime < 43200000) {
                    cyclethrough_questions:
                    for (var i = 7; i >= 0; i--) {
                        if (Date.parse(involved.json.results[i].updated) > ss.storage.lastinvolvedtime) {
                             sumoinvolvedtime = Date.parse(involved.json.results[i].updated);
                            sumoinvolvedtitle = involved.json.results[i].title;
                            sumoinvolvedid = involved.json.results[i].id;
                            sumoinvolvedlastanswer = involved.json.results[i].last_answer;
                            break cyclethrough_questions;
                        }
                    }
                }
                /*start fresh if no prior threads were looked at or they are too out of date*/
                else {
                    sumoinvolvedtime = Date.parse(involved.json.results[0].updated);
                    sumoinvolvedtitle = involved.json.results[0].title;
                    sumoinvolvedid = involved.json.results[0].id;
                    sumoinvolvedlastanswer = involved.json.results[0].last_answer;
                }
                
                var replyContentRequest = Request({
                    url: "https://support.mozilla.org/api/2/answer/" + sumoinvolvedlastanswer + "/?format=json",
                    onComplete: function(rresponse2) {
                        
                        /*check that the reply is not by the user itself - would not make sense to alert in this case*/
                        if (rresponse2.json.creator.username !== ss.storage.username){
                            var ago;
                            var timedelta = Date.now()-sumoinvolvedtime;
                            /*dynamically adjust the labelling depending on timeframe*/
                            if(timedelta <= 3600000){ 
                                ago = (timedelta/60000).toFixed(0) + " min";
                            }
                            else if(7200000 >= timedelta >= 3600000){
                                ago = "1 hour";
                            }
                            else {
                                ago = (timedelta/3600000).toFixed(0) + " hours";
                            }
                            
                            notifications.notify({
                                title: "SUMO - Update " + ago + " ago in:",
                                text: sumoinvolvedtitle,
                                data: "",
                                iconURL: ss.storage.avatar,
                                onClick: function() {
                                    tabs.open("https://support.mozilla.org/questions/" + sumoinvolvedid + "#answer-" + sumoinvolvedlastanswer);
                                }
                            });

                            if (prefs.notify_opentab === true){
                                duplicateHandler(sumoinvolvedid, sumoinvolvedlastanswer);
                            }
                        }
                    }
                });
                replyContentRequest.get();
                ss.storage.lastinvolvedtime = sumoinvolvedtime;
                if (ss.storage.lastinvolvedtime < latestsumoinvolvedupdate) {
                    timer.setTimeout(fetchInvolved, 9000);
                }
            }  
        }
    });
    if (prefs.notify_involved === true && ss.storage.username !== undefined){
        involvedRequest.get();
    }
}

/*run tests on fetched question & return a result*/
function classifyQuestion(sumoquestiontitle, sumoquestioncontent) {
    if (RegExp("season|episode|vashikaran|gold medal|astrolog|black magic|husband wife|garcinia|reddit.com|fuck", "i").test(sumoquestiontitle+sumoquestioncontent) === true || sumoquestiontitle.length < 9 || sumoquestioncontent.length < 9 || getCharacterCount(sumoquestiontitle) < 6) {
        return "leave for mods";
    }
    else {
        return "clear";
    }
}

/*test number of different characters in a question*/
function getCharacterCount(string) {
    var uniq = '';
    for (var i = 0; i < string.length; i++) {
        if (uniq.indexOf(string[i]) == -1) {
            uniq += string[i];
        }
    }
    return uniq.length;
}

/*test if a tab is already exisitng, if yes: reload, if no: open it in a new tab*/
function duplicateHandler(sumoquestionid, sumoinvolvedlastanswer) {
    var duplicateexisting = 0;
    for (var i = 0; i < tabs.length; i++) {
        var url = require("sdk/url").URL(tabs[i].url);
        if ((url.path).indexOf("/questions/" + sumoquestionid) > -1 && !(tabs.activeTab === tabs[i])){
            tabs[i].reload();
            tabs[i].activate();
            duplicateexisting = 1;
        }
    }
    if (duplicateexisting !== 1) {
        tabs.open({
            url: "https://support.mozilla.org/questions/" + sumoquestionid + "#answer-" + sumoinvolvedlastanswer,
            inBackground: true,
        });
    }
}