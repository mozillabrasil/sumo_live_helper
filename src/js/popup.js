// Create message handler
browser.runtime.onMessage.addListener(handleMessage);

// Declaration of UI elements
const clear = document.getElementById('clear');
const refresh = document.getElementById('refresh');
const settings = document.getElementById('settings');
const sidebar = document.getElementById('sidebar');
const questionListUI = document.getElementById('questions');
const questionTemplate = document.getElementsByClassName('question-template')[0];

// Button localized text
clear.title = browser.i18n.getMessage('clear_notifications');
refresh.title = browser.i18n.getMessage('refresh');
settings.title = browser.i18n.getMessage('open_preferences');
sidebar.title = browser.i18n.getMessage('open_sidebar');

// Button click handlers
clear.addEventListener('click', markAllAsRead, false);
refresh.addEventListener('click', callAPI, false);
settings.addEventListener('click', openPreferences, false);
sidebar.addEventListener('click', openSidebar, false);
questionListUI.addEventListener('click', openQuestion, false);

window.oncontextmenu = function(event) {
     event.preventDefault();
     event.stopPropagation();
     return false;
};

// Is it Android
let isMobile = false;
let inNewTab = true;

// Adjust UI
isSidebar();

// Request current question list from Storage API
let getQuestionList = browser.storage.local.get();
getQuestionList.then(dataLoaded);

/**
 * Open extension preferences page
 * @param {Object} event
 */
function openPreferences(event) {
    event.preventDefault();
    event.stopPropagation();
    browser.tabs.create({
        url: 'preferences.html'
    });
}

/**
 * Open sidebar
 * @param {Object} event
 */
function openSidebar(event) {
    event.preventDefault();
    event.stopPropagation();
    browser.sidebarAction.open();
}

/**
 * Open question
 * @async
 * @param {object} question Question item button
 */
async function openQuestion(question) {
    question.preventDefault();
    question.stopPropagation();

    const url = question.target.href;
    if (!url) return;
    let tabID = await browser.tabs.query({ active: true });
    tabID = tabID[0].id;

    if (inNewTab) browser.tabs.create({ url: url });
    else browser.tabs.update(tabID, { url: url });

    let selectedQuestion = null;
    
    if (question.target.id) {
        selectedQuestion = question.target;
    } else if (question.target.parentNode.id) {
        selectedQuestion = question.target.parentNode;
    }
    
    if (selectedQuestion != null) {
        browser.runtime.sendMessage({
            task: 'mark_as_read',
            id: selectedQuestion.id
        });
    }
}

/**
 * Handle incoming messages
 * @param {object} message
 */
function handleMessage(message) {
    switch (message.task) {
        case 'add_new_questions':
            addQuestions(message.questions, message.isFinishedLoading);
            return;
        case 'update_question_list':
            questionList = message.questions;
            return;
        case 'remove_question':
            removeQuestion(message.id);
            return;
        case 'start_loading':
            showLoadingBar(true);
            return;
        case 'mark_as_read':
            markAsRead(message.id);
            return;
        case 'update_theme':
            setCurrentTheme(message.theme);
            return;
        case 'no_api_call':
            questionList = [];
            addQuestions([], true);
            return;
        case 'toggle_locale_labels':
            showLocaleLabels(message.multiple);
            return;
        case 'update_open_in_new_tab':
            inNewTab = message.value;
            return;
    }
}

/**
 * Run when browser loaded data from Storage API
 * @param {object} data
 */
function dataLoaded(data) {
    setCurrentTheme(data.chooseTheme);
    showLocaleLabels(data.chooseLanguage.length != 1);
    
    questionList = data.questions;
    inNewTab = data.openNewTab;

    addQuestions(questionList, false);
    
    showLoadingWheel(false);
    callAPI();
}

/**
 * Set the UI theme
 * @param {string} theme
 */
function setCurrentTheme(theme) {
    document.body.classList.remove('theme-dark', 'theme-light');

    if (theme == 'auto') {
        const isSystemThemeDark = window.matchMedia('(prefers-color-scheme: dark)').matches;

        if (isSystemThemeDark == true) {
            document.body.classList.add('theme-dark');
        } else {
            document.body.classList.add('theme-light');
        }
    } else {
        document.body.classList.add('theme-' + theme);
    }
}

/**
 * Trigger call to SUMO API
 * @param {Object} event
 */
function callAPI(event) {
    if (event) {
        event.preventDefault();
        event.stopPropagation();
    }

    showLoadingBar(true);
    browser.runtime.sendMessage({
        task: 'call_api'
    });
}

/**
 * Add new questions to list
 * @param {Array} questions
 * @param {boolean} isFinishedLoading
 */
function addQuestions(questions, isFinishedLoading) {
    // Create questions on the UI
    for (question of questions) {
        if (question.show && document.getElementsByClassName('item--' + question.id)[0] == undefined) {
            createQuestionUI(
                question.product,
                question.title,
                question.id,
                question.locale,
                question.new
            );
        }
    }

    toggleQuestionList();

    if (isFinishedLoading) {
        showLoadingBar(false);
        showLoadingWheel(false);
    }
}

/**
 * Create question list UI element
 * @param {string} product
 * @param {string} title
 * @param {number} id
 * @param {boolean} isNew
 */
function createQuestionUI(product, title, id, locale, isNew) {
    // Create UI elements
    const list = document.getElementById('items');
    const item = questionTemplate.cloneNode(true);
    const productIcon = item.getElementsByClassName('item__icon')[0];
    const productLocale = item.getElementsByClassName('item__locale')[0];
    const questionTitle = item.getElementsByClassName('item__title')[0];
    const button = item.getElementsByClassName('item__link')[0];
    const url = 'https://support.mozilla.org/' + locale + '/questions/' + id;

    // Add item ID
    item.className = 'item--' + id;

    // Mark questions as unread
    if (isNew) {
        item.classList.add('item--unread');
    }

    // Add question icon
    productIcon.src = '../res/products/' + product + '.png';
    productIcon.title = browser.i18n.getMessage('product_' + product);

    // Add question locale
    productLocale.textContent = locale.substring(0, 2).toUpperCase();
    productLocale.classList.add(locale);

    // Add question title
    questionTitle.textContent = title;

    // Add question button
    button.id = id;
    button.href = url;
    button.addEventListener('click', openQuestion);

    // Determine question order
    const allButtons = list.getElementsByClassName('button');
    let i = 0;
    while (allButtons[i] && allButtons[i].id > id) {
        i++;
    }

    // Create question position value
    let position;
    if (i >= allButtons.length) {
        position = null;
    } else {
        position = list.childNodes[i];
    }

    // Add item to list
    list.insertBefore(item, position);
}

/**
 * Show question list if there are questions to display
 */
function toggleQuestionList() {
    const empty = document.getElementById('empty');

    if (questionList.length > 0) {
        questionListUI.style.display = 'block';
        empty.style.display = 'none';
    } else {
        questionListUI.style.display = 'none';
        empty.style.display = 'block';
    }
}

/**
 * Show/Hide locale labels on question list
 * @param {boolean} show 
 */
function showLocaleLabels(show) {
    if (show) {
        questionListUI.classList.remove('one-locale');
    } else {
        questionListUI.classList.add('one-locale');
    }
}

/**
 * Mark a question as read
 * @param {number} id
 */
function markAsRead(id) {
    document.getElementsByClassName('item--' + id)[0].classList.remove('item--unread');
}

/**
 * Mark all questions as read
 * @async
 * @param {Object} event
 */
function markAllAsRead(event) {
    event.preventDefault();
    event.stopPropagation();

    for (question of questionList) {
        browser.runtime.sendMessage({
            task: 'mark_as_read',
            id: question.id
        });
    }
}

/**
 * Remove a question from the list
 * @param {number} id
 */
function removeQuestion(id) {
    const question = document.getElementsByClassName('item--' + id)[0];
    if (question) question.parentElement.removeChild(question);
}

/**
 * Determine if this window is sidebar
 */
function isSidebar() {
    let queries = window.location.href;
    queries = queries.substring(queries.indexOf('?') + 1, queries.length);

    if (queries.indexOf('popup') >= 0) {
        document.body.classList.add('popup');
    } else if (queries.indexOf('mobile') >= 0) {
		isMobile = true;
        document.body.classList.add('mobile');
    } else {
        document.body.classList.add('sidebar');
        browser.runtime.connect();
        return true;
    }
}

/**
 * Show/hide the loading bar
 * @param {boolean} state
 */
function showLoadingBar(state) {
    const load = document.getElementById('load');

    if (state) {
        load.style.opacity = '1';
    } else {
        load.style.opacity = '0';
    }
}

function showLoadingWheel(state) {
    const load = document.getElementById('page-loader');

    if (!state) {
        load.style.display = 'none';
    }
}
