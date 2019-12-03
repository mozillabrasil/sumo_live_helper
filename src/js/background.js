// Variable declaration
let frequencySeekNewQuestions, locale, showNotifications, onlySidebar, product;
let numberOfAPIRequests = 0;
let apiFromPopup = false;

// Load saved questions from storage
let questionList = browser.storage.local.get();
questionList.then(dataLoaded);

// Create listeners
browser.alarms.onAlarm.addListener(callAPI);
browser.runtime.onMessage.addListener(handleMessage);
browser.browserAction.onClicked.addListener(openWindow);
//browser.notifications.onClicked.addListener(openWindow); API limitation

/**
 * Detect changes to data in Storage API
 * @param {object} changes
 * @param {string} area
 */
function settingsUpdated(changes, area) {
    let changedItems = Object.keys(changes);
    for (let item of changedItems) {
        switch (item) {
            case 'frequencySeekNewQuestions':
                frequencySeekNewQuestions = changes[item].newValue;
                createAlarm(changes[item].newValue);
                return;
            case 'chooseLanguage':
                locale = changes[item].newValue;
                callAPI();
                return;
            case 'showNotifications':
                showNotifications = changes[item].newValue;
                return;
            case 'chooseProduct':
                product = changes[item].newValue;
                callAPI();
                return;
            case 'onlySidebar':
                onlySidebar = changes[item].newValue;
                toggleSidebarPreference();
                return;
        }
    }
}

/**
 * Toggle browserAction button between sidebar and popup
 */
function toggleSidebarPreference() {
    if (onlySidebar) {
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
        browser.sidebarAction.open();
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
    browser.alarms.create('checkSUMO', {
        periodInMinutes: parseInt(time)
    });
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
    if (data.questions) {
        questionList = data.questions;
    } else {
        questionList = [];
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
        locale = "en-US";
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

    // Load product watch list
    if (typeof data.chooseProduct === 'undefined' || data.chooseProduct === null) {
        product = "Firefox";
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
    let is_solved = 'false';
    let is_spam = 'false';
    let is_locked = 'false';
    let is_taken = 'false';
    let is_archived = 'false';

    // Tell window(s) that API is loading
    browser.runtime.sendMessage({
        task: 'start_loading'
    });

    // Send requests to SUMO API
    let requests = Array(product.length);
    numberOfAPIRequests = product.length;

    for (i = 0; i < product.length; i++) {
        requests[i] = new XMLHttpRequest();
        let requestAPI = 'https://support.mozilla.org/api/2/question/?format=json&ordering=-id&is_solved=' + is_solved + '&is_spam=' + is_spam + '&is_locked=' + is_locked + '&product=' + product[i] + '&is_taken=' + is_taken + '&is_archived=' + is_archived + '&locale=' + locale;
        requests[i].open('GET', requestAPI, true);
        requests[i].responseType = 'json';
        requests[i].send();
        requests[i].onload = function () {
            loadRequest(this);
        };
    }

    // If the user doesn't have any products selected
    if (product.length < 1) {
        browser.runtime.sendMessage({
            task: 'no_api_call'
        });
        questionList = [];
        updateQuestionCount();
    }
}

/**
 * Add results of SUMO API to question list
 * @param {object} request
 */
function loadRequest(request) {
    // Check if this is the final pending API request
    let isFinishedLoading;
    numberOfAPIRequests--;
    if (numberOfAPIRequests <= 0) {
        isFinishedLoading = true;
    } else {
        isFinishedLoading = false;
    }

    let responseSUMO = request.response;
    let newQuestionList = [];

    for (i = 0; i < responseSUMO.results.length; i++) {
        // Check if question should be shown on the question list
        if (responseSUMO.results[i].num_answers == 0 && responseSUMO.results[i].is_spam == false && responseSUMO.results[i].is_locked == false) {
            let qID = responseSUMO.results[i].id;
            let qTitle = responseSUMO.results[i].title;
			let qLocale = responseSUMO.results[i].locale;
			let qProduct = responseSUMO.results[i].product;
            let x = 0;
            let questionExists = false;

            // Check if question is already on the question list
            while (x < questionList.length && !questionExists) {
                questionExists = (id == questionList[x].id);
                x++;
            }

            // Add to the question list (if needed)
            if (!questionExists) {
                let newItem = {
                    product: qProduct,
                    title: qTitle,
                    id: qID,
					locale: qLocale,
                    new: true
                }
                newQuestionList.push(newItem);
            }
        }
    }

    // Clean and save question list in Storage API
    removeOld(responseSUMO.results, responseSUMO.results[0].product);
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
    let numberOfQuestionsOpened = 0;

    // Count new questions
    for (var i = 0; i < questionList.length; i++) {
        if (questionList[i].new) {
            numberOfQuestionsOpened++;
        }
    }

    // Show/hide counter badge
    if (numberOfQuestionsOpened > 0) {
        browser.browserAction.setBadgeText({
            text: numberOfQuestionsOpened.toString()
        });
    } else {
        browser.browserAction.setBadgeText({
            text: ''
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
function removeOld(questions, productToCheck) {
    // Convert watch list to lowercase
    let productList = product.map(function (value) {
        return value.toLowerCase();
    });

    let i = 0;
    while (i < questionList.length) {
        let x = 0;
        let found = false;
        let skip = false;
        let matchesList = (questionList[i].product.toLowerCase() == productToCheck);
        let isPossible = productList.includes(questionList[i].product.toLowerCase());

        // Question is for a product on the watch list, but not for the product currently being checked (keep the question in the list)
        if (isPossible && !matchesList) {
            found = true;
        }

        // Check if question is still on list
        while (x < questions.length && !found && matchesList) {
            if (questionList[i].id == questions[x].id && questions[x].num_answers == 0 && questions[x].is_locked == false && questions[x].is_spam == false) {
                found = true;
            }
            x++;
        }

        // Remove from question list (if not valid)
        if (!found || !isPossible) {
            browser.runtime.sendMessage({
                task: 'remove_question',
                id: questionList[i].id
            });
            questionList.splice(i, 1);
        } else {
            i++;
        }
    }

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
 * Create a browser notification (if allowed)
 * @param {Array} questions
 */
function showNotification(questions) {
    let num = questions.length;
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
    let i = 0;
    let found = false;

    // Find index of question
    while (i < questionList.length && !found) {
        if (questionList[i].id == id) {
            found = true;
        }
        i++;
    }
    i--;

    // Update question status
    questionList[i].new = false;
    browser.storage.local.set({
        'questions': questionList
    });

    updateQuestionList();
    updateQuestionCount();
}
