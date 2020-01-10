// Create message handler
browser.runtime.onMessage.addListener(handleMessage);

// Declaration of UI elements
const clear = document.getElementById('clear');
const refresh = document.getElementById('refresh');
const settings = document.getElementById('settings');
const sidebar = document.getElementById('sidebar');
const questionListUI = document.getElementById('questions');

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
 * @param {object} question Question item button
 */
function openQuestion(question) {
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
    }
}

/**
 * Run when browser loaded data from Storage API
 * @param {object} data
 */
function dataLoaded(data) {
    setCurrentTheme(data.chooseTheme);
    
    questionList = data.questions;

    for (i = 0; i < questionList.length; i++) {
        createQuestionUI(
            questionList[i].product.toLowerCase(),
            questionList[i].title,
            questionList[i].id,
            data.chooseLanguage,
            questionList[i].new
        );
    }

    toggleQuestionList();
    document.getElementById('page-loader').style.display = 'none';
    callAPI();
}

/**
 * Set the UI theme
 * @param {string} theme
 */
function setCurrentTheme(theme) {
    document.body.classList.remove('theme-dark', 'theme-light');

    if (theme == 'auto') {
        let isSystemThemeDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
        let isSystemThemeLight = window.matchMedia('(prefers-color-scheme: light)').matches;

        if (isSystemThemeDark == true) {
            document.body.classList.add('theme-dark');
        } else if (isSystemThemeLight == true) {
            document.body.classList.add('theme-light');
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
    event.preventDefault();
    event.stopPropagation();
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
    for (i = 0; i < questions.length; i++) {
        createQuestionUI(
            questions[i].product,
            questions[i].title,
            questions[i].id,
            questions[i].locale,
            true
        );
    }

    toggleQuestionList();

    if (isFinishedLoading) {
        showLoadingBar(false);
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
    let list = document.getElementById('items');
    let item = document.createElement('li');
    let productIconContainer = document.createElement('div');
    let productIcon = document.createElement('img');
    let questionTitle = document.createElement('div');
    let buttonContainer = document.createElement('div');
    let button = document.createElement('a');
    let buttonIcon = document.createElement('span');
    let url = 'https://support.mozilla.org/' + locale + '/questions/' + id;

    // Add item ID
    item.className = 'item--' + id;

    // Mark questions as unread
    if (isNew) {
        item.classList.add('item--unread');
    }

    // Add question icon
    productIcon.src = '../res/products/' + product + '.png';
    productIcon.title = browser.i18n.getMessage('product_' + product);
    productIcon.className = 'item__icon';
    productIconContainer.appendChild(productIcon);
    item.appendChild(productIconContainer);

    // Add question title
    questionTitle.textContent = title;
    item.appendChild(questionTitle);

    // Add question button
    button.className = 'button button-icon primary';
    button.id = id;
    button.href = url;
    buttonIcon.className = 'pf-open-in-new';
    button.appendChild(buttonIcon);
    buttonContainer.appendChild(button);
    item.appendChild(buttonContainer);

    // Determine question order
    let allButtons = list.getElementsByClassName('button');
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
    let empty = document.getElementById('empty');

    if (questionList.length > 0) {
        questionListUI.style.display = 'block';
        empty.style.display = 'none';
    } else {
        questionListUI.style.display = 'none';
        empty.style.display = 'block';
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
async function markAllAsRead(event) {
    event.preventDefault();
    event.stopPropagation();
    for (i = 0; i < questionList.length; i++) {
        await browser.runtime.sendMessage({
            task: 'mark_as_read',
            id: questionList[i].id
        });
    }
}

/**
 * Remove a question from the list
 * @param {number} id
 */
function removeQuestion(id) {
    let question = document.getElementsByClassName('item--' + id)[0];
    question.parentElement.removeChild(question);
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
        return true;
    }
}

/**
 * Show/hide the loading bar
 * @param {boolean} state
 */
function showLoadingBar(state) {
    let load = document.getElementById('load');

    if (state) {
        load.style.opacity = '1';
    } else {
        load.style.opacity = '0';
    }
}
