// Variable declaration
let frequencySeekNewQuestions, 
    locale, 
    showNotifications, 
    openNewTab,
    onlySidebar, 
    product,
    theme,
    isMobile;
let numberOfAPIRequests = 0;
let apiFromPopup = false;
let isSidebarOpen = false;

// Detect operating system
let detectOS = browser.runtime.getPlatformInfo();
detectOS.then(setOS);

// Load saved questions from storage
let questionList = browser.storage.local.get();
questionList.then(dataLoaded);

// Create listeners
browser.alarms.onAlarm.addListener(callAPI);
browser.runtime.onMessage.addListener(handleMessage);
browser.browserAction.onClicked.addListener(openWindow);
browser.runtime.onConnect.addListener((port) => {
    isSidebarOpen = true;
    port.onDisconnect.addListener(() => {
        isSidebarOpen = false;
    });
});
//browser.notifications.onClicked.addListener(openWindow); API limitation

/**
 * Detect changes to data in Storage API
 * @param {object} changes
 * @param {string} area
 */
function settingsUpdated(changes, area) {
    let changedItems = Object.keys(changes);
    for (item of changedItems) {
        switch (item) {
            case 'frequencySeekNewQuestions':
                frequencySeekNewQuestions = changes[item].newValue;
                createAlarm(changes[item].newValue);
                return;
            case 'chooseLanguage':
                locale = changes[item].newValue;
                browser.runtime.sendMessage({
                    task: 'toggle_locale_labels',
                    multiple: locale.length != 1
                });
                callAPI();
                return;
            case 'showNotifications':
                showNotifications = changes[item].newValue;
                return;
            case 'openNewTab':
                openNewTab = changes[item].newValue;
                browser.runtime.sendMessage({
                    task: 'update_open_in_new_tab',
                    value: openNewTab
                });
                return;
            case 'chooseProduct':
                product = changes[item].newValue;
                callAPI();
                return;
            case 'onlySidebar':
                onlySidebar = changes[item].newValue;
                toggleSidebarPreference();
                return;
            case 'chooseTheme':
                theme = changes[item].newValue;
                browser.runtime.sendMessage({
                    task: 'update_theme',
                    theme: theme
                });
                return;
        }
    }
}

/**
 * Toggle browserAction button between sidebar and popup
 */
function toggleSidebarPreference() {
    if (onlySidebar || isMobile) {
        browser.browserAction.setPopup({
            popup: ''
        });
    } else {
        browser.browserAction.setPopup({
            popup: '/html/popup.html?view=popup'
        });
    }
}

/**
 * Open the sidebar/popup depending on user setting
 */
function openWindow() {
    if (onlySidebar) {
        if (isSidebarOpen) {
            browser.sidebarAction.close();
        } else {
            browser.sidebarAction.open();
        }
    } else if (isMobile) {
        browser.tabs.create({
            url: '/html/popup.html?view=mobile'
        });
    } else {
        browser.browserAction.openPopup();
    }
}

/**
 * Verify integrity of product watch list from Storage API
 * @param {object} data
 */
function checkProductList(data) {
    if (Array.isArray(data.chooseProduct)) {
        product = data.chooseProduct;
    } else if (typeof data.chooseProduct == 'string') {
        product = [data.chooseProduct];
        browser.storage.local.set({
            chooseProduct: product
        });
    } else {
        product = ['Firefox'];
        browser.storage.local.set({
            chooseProduct: product
        });
    }
}

/**
 * Create timer to trigger API call
 * @param {number|string} time (in minutes)
 */
function createAlarm(time) {
    browser.alarms.clear('checkSUMO');
    if (time != 0) {
        browser.alarms.create('checkSUMO', {
            periodInMinutes: parseInt(time)
        });
    }
}

/**
 * Handle incoming messages
 * @param {object} message
 * @param {object} sender
 * @param {function} sendResponse
 */
function handleMessage(message, sender, sendResponse) {
    switch (message.task) {
        case 'call_api':
            apiFromPopup = true;
            callAPI();
            return;
        case 'mark_as_read':
            markAsRead(message.id);
            browser.runtime.sendMessage({
                task: 'mark_as_read',
                id: message.id
            });
            return;
    }
}

/**
 * Run when browser loaded data from Storage API (at startup)
 * @param {object} data
 */
function dataLoaded(data) {
    // Load question list
    if (data.questions && data.questionVersion == 1) {
        questionList = data.questions;
    } else {
        questionList = [];
        browser.storage.local.set({
            questionVersion: 1
        });
    }

    // Load question check frequency
    if (typeof data.frequencySeekNewQuestions === 'undefined' || data.frequencySeekNewQuestions === null) {
        frequencySeekNewQuestions = 15;
        browser.storage.local.set({
            frequencySeekNewQuestions: frequencySeekNewQuestions
        });
    } else {
        frequencySeekNewQuestions = data.frequencySeekNewQuestions;
    }

    // Load locale
    if (typeof data.chooseLanguage === 'undefined' || data.chooseLanguage === null) {
        locale = ["en-US"];
        browser.storage.local.set({
            chooseLanguage: locale
        });
    } else if (typeof data.chooseLanguage === 'string') {
        locale = [data.chooseLanguage];
        browser.storage.local.set({
            chooseLanguage: locale
        });
    } else {
        locale = data.chooseLanguage;
    }

    // Load notification setting
    if (typeof data.showNotifications === 'undefined' || data.showNotifications === null) {
        showNotifications = false;
        browser.storage.local.set({
            showNotifications: showNotifications
        });
    } else {
        showNotifications = data.showNotifications;
    }

    // Load open in new tab setting
    if (typeof data.openNewTab === 'undefined' || data.openNewTab === null) {
        openNewTab = true;
        browser.storage.local.set({
            openNewTab: openNewTab
        });
    } else {
        openNewTab = data.openNewTab;
    }

    // Load product watch list
    if (typeof data.chooseProduct === 'undefined' || data.chooseProduct === null) {
        product = ["Firefox"];
        browser.storage.local.set({
            chooseProduct: product
        });
    } else {
        product = data.chooseProduct;
    }

    // Load sidebar setting
    if (typeof data.onlySidebar === 'undefined' || data.onlySidebar === null) {
        onlySidebar = false;
    } else {
        onlySidebar = data.onlySidebar;
    }

    // Load theme setting
    if (typeof data.chooseTheme === 'undefined' || data.chooseTheme === null) {
        theme = "auto";
        browser.storage.local.set({
            chooseTheme: theme
        });
    } else {
        theme = data.chooseTheme;
    }

    // Remove Firefox Preview
    try {
        if (data.chooseProduct.indexOf('firefox-preview') >= 0) {
            data.chooseProduct = data.chooseProduct.filter((v) => {
                return v != 'firefox-preview';
            });
            browser.storage.local.set({
                chooseProduct: data.chooseProduct
            });
        }
    } catch (error) {
        console.error(error);
    }

    browser.storage.onChanged.addListener(settingsUpdated);

    toggleSidebarPreference();
    createAlarm(frequencySeekNewQuestions);
    checkProductList(data);
    updateQuestionCount();
    callAPI();
}

/**
 * Send request to SUMO API
 */
function callAPI() {
    // API request settings
    const is_solved = 'false';
    const is_spam = 'false';
    const is_locked = 'false';
    const is_taken = 'false';
    const is_archived = 'false';
    const max_answers = '0';

    // Tell window(s) that API is loading
    browser.runtime.sendMessage({
        task: 'start_loading'
    });

    // Send requests to SUMO API
    numberOfAPIRequests = product.length * locale.length;
    let requestCounter = 0;
    const requests = new Array(numberOfAPIRequests);

    for (i = 0; i < product.length; i++) {
        for (j = 0; j < locale.length; j++) {
            requests[requestCounter] = new XMLHttpRequest();
            let requestAPI = 'https://support.mozilla.org/api/2/question/?format=json&ordering=-id&is_solved=' + is_solved + '&is_spam=' + is_spam + '&is_locked=' + is_locked + '&product=' + product[i] + '&is_taken=' + is_taken + '&is_archived=' + is_archived + '&locale=' + locale[j] + '&num_answers=' + max_answers;
            requests[requestCounter].open('GET', requestAPI, true);
            requests[requestCounter].responseType = 'json';
            requests[requestCounter].send();
            requests[requestCounter].onload = function () {
                loadRequest(this);
            };
            requestCounter++;
        }
    }

    // If the user doesn't have any products or locales selected
    if (product.length < 1 || locale.length < 1) {
        browser.runtime.sendMessage({
            task: 'no_api_call'
        });
        questionList = [];
        browser.storage.local.set({
            'questions': questionList
        });
        updateQuestionCount();
    }
}

/**
 * Add results of SUMO API to question list
 * @param {object} request
 */
function loadRequest(request) {
    // Check if this is the final pending API request
    numberOfAPIRequests--;
    const isFinishedLoading = numberOfAPIRequests <= 0;

    const responseSUMO = request.response;
    const newQuestionList = [];

    const validProducts = product.map(p => p.toLowerCase());
    const validLocales = locale.map(l => l.toLowerCase());

    // Filter SUMO list to only unanswered
    const availableQuestions = responseSUMO.results.filter((q) => {
        return (
            validProducts.includes(q.product.toLowerCase()) &&
            validLocales.includes(q.locale.toLowerCase()) &&
            q.num_answers == 0 &&
            q.is_spam == false &&
            q.is_locked == false &&
            isWithinTimeRange(q.created)
        );
    });

    // Add question to new list if it's not already saved
    for (question of availableQuestions) {
        const listIndex = questionList.findIndex((q) => { return q.id == question.id; });

        if (listIndex < 0) {
            newQuestionList.push({
                product: question.product,
                title: question.title,
                id: question.id,
                locale: question.locale,
                created: question.created,
                show: true,
                new: true
            });
        }
    }

    // Clean and save question list in Storage API
    if (responseSUMO.results.length > 0) removeOld(responseSUMO.results, responseSUMO.results[0].product, responseSUMO.results[0].locale);
    questionList = newQuestionList.concat(questionList);
    browser.storage.local.set({
        'questions': questionList
    });

    // Trigger browser notification
    if (!apiFromPopup && showNotifications && newQuestionList.length > 0) {
        showNotification(newQuestionList);
    }

    // Reset API source marker
    if (isFinishedLoading) {
        apiFromPopup = false;
    }

    // Send new questions to open window(s)
    updateQuestionCount();
    updateQuestionList();
    browser.runtime.sendMessage({
        task: 'add_new_questions',
        questions: newQuestionList,
        isFinishedLoading: isFinishedLoading
    });
}

/**
 * Update question count on browserAction button
 */
function updateQuestionCount() {
	// Cancel if it's Android
	if (isMobile) {
		return;
	}

    let numberOfQuestionsOpened = 0;

    // Count new questions
    for (let i = 0; i < questionList.length; i++) {
        if (questionList[i].new && questionList[i].show) {
            numberOfQuestionsOpened++;
        }
    }

    // Show/hide counter badge
    if (numberOfQuestionsOpened > 0) {
        browser.browserAction.setBadgeText({
            text: numberOfQuestionsOpened.toString()
        });
        browser.sidebarAction.setTitle({
            title: browser.i18n.getMessage('extensionName') + ' (' + numberOfQuestionsOpened + ')'
        });
    } else {
        browser.browserAction.setBadgeText({
            text: ''
        });
        browser.sidebarAction.setTitle({
            title: browser.i18n.getMessage('extensionName')
        });
    }

    // Update browserAction tooltip
    if (numberOfQuestionsOpened >= 2) {
        browser.browserAction.setTitle({
            title: numberOfQuestionsOpened + browser.i18n.getMessage('more_than_one_question_without_answer')
        });
    } else if (numberOfQuestionsOpened == 1) {
        browser.browserAction.setTitle({
            title: numberOfQuestionsOpened + browser.i18n.getMessage('one_question_without_answer')
        });
    } else {
        browser.browserAction.setTitle({
            title: ''
        });
    }
}

/**
 * Remove old questions from question list
 * @param {Array} list
 * @param {string} prod Current product list to check
 */
function removeOld(questions, productToCheck, localeToCheck) {
    // Convert watch list to lowercase
    const productList = product.map((v) => { return v.toLowerCase(); });
    const localeList = locale.map((v) => { return v.toLowerCase(); });
    const validList = [];
    const removeList = [];

    // Check each question stored in the question list
    for (question of questionList) {
        const inScope = question.product.toLowerCase() == productToCheck.toLowerCase() && question.locale.toLowerCase() == localeToCheck.toLowerCase();
        const isPossible = productList.includes(question.product.toLowerCase()) && localeList.includes(question.locale.toLowerCase());
        const found = questions.find((q) => { return question.id == q.id });
        const onList = found != undefined;
        const isExpired = !isWithinTimeRange(question.created);
        const isTaken = !(
            onList &&
            found.num_answers == 0 &&
            found.is_locked == false &&
            found.is_spam == false
        );

        // Remove questions from UI
        if (!((!inScope && isPossible) || (isPossible && onList && !isExpired && !isTaken))) {
            question.show = false;
            removeList.push(question);
        }

        // Keep questions in Storage API
        if ((!inScope && isPossible) || (isPossible && !isExpired)) {
            validList.push(question);
        }
    }

    // Trigger question removal
    for (question of removeList) {
        browser.runtime.sendMessage({
            task: 'remove_question',
            id: question.id
        });
    }

    questionList = validList;

    // Sort question list by ID
    questionList.sort(function (a, b) {
        return b.id - a.id
    });

    // Save question list in Storage API
    browser.storage.local.set({
        'questions': questionList
    });

    updateQuestionList();
}

/**
 * Send updated question list to any open popups
 */
function updateQuestionList() {
    browser.runtime.sendMessage({
        task: 'update_question_list',
        questions: questionList
    });
}

/**
 * Checks if the question is within the 24 hour time limit
 * @param {string} timeString
 * @returns {boolean}
 */
function isWithinTimeRange(timeString) {
    const timeLimit = 24;                                             // In hours
    let currentTime = new Date();
    const timezone = currentTime.getTimezoneOffset() * 60 * 1000;     // Must manually remove the timezone offset
    currentTime = new Date(currentTime - timezone);                   // because SUMO API displays a local timestamp, but labels it UTC
    const minimumTime = currentTime.getTime() - (timeLimit * 3600000);
    const questionTime = new Date(timeString).getTime();

    return questionTime >= minimumTime;
}

/**
 * Create a browser notification (if allowed)
 * @param {Array} questions
 */
function showNotification(questions) {
    const num = questions.length;
    let title = num + ' ';
    let message = '"' + questions[0].title + '"';

    if (num == 1) {
        title += browser.i18n.getMessage('notification_title_single');
    } else {
        title += browser.i18n.getMessage('notification_title_multiple');
        message += ' & ' + (num - 1) + ' ' + browser.i18n.getMessage('notification_message_more');
    }

    message += '\n\n' + browser.i18n.getMessage('notification_message_click');

    browser.notifications.create({
        type: 'basic',
        iconUrl: chrome.extension.getURL('/res/products/' + questions[0].product + '.png'),
        title: title,
        message: message
    });
}

/**
 * Mark a question as read
 * @param {number} id
 */
function markAsRead(id) {
    // Find question in list
    const index = questionList.findIndex((q) => { return q.id == id; });

    // Update question status
    questionList[index].new = false;
    browser.storage.local.set({
        'questions': questionList
    });

    updateQuestionList();
    updateQuestionCount();
}

/**
 * Sets the OS information variable
 * @param {object} info
 */
function setOS(info) {
    isMobile = info.os == browser.runtime.PlatformOs.ANDROID;
}
