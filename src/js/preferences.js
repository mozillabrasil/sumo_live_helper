function salvarPreferencias(e) {
    e.preventDefault();
    let preferencias = {
        buscarQuestoesAtivamente: document.getElementById("showNewQuestions").checked,
        frequenciaBuscaQuestoes: document.getElementById("frequencySeekNewQuestions").value
    };

    browser.storage.sync.set(preferencias);

    bootbox.alert({
        message: browser.i18n.getMessage('saved_preferences'),
        size: "small"
    });

    console.log(browser.i18n.getMessage('saved_preferences'));
}

function carregarPreferencias() {
    function definirBuscarQuestoesAtivamente(dados) {
        console.log(dados);
        if (dados.buscarQuestoesAtivamente == true) {
            document.getElementById("showNewQuestions").checked = true
        }
    }

    function definirFrequenciaBuscaQuestoes(dados) {
        if (dados.frequenciaBuscaQuestoes) {
            document.getElementById("frequencySeekNewQuestions").value = dados.frequenciaBuscaQuestoes;
        }
    }

    function onError(error) {
        console.log(`Error: ${error}`);
    }

    var promiseBuscarQuestoesAtivamente = browser.storage.sync.get("showNewQuestions");
    var promiseFrequenciaBuscaQuestoes = browser.storage.sync.get("frequencySeekNewQuestions");

    promiseBuscarQuestoesAtivamente.then(definirBuscarQuestoesAtivamente, onError);
    promiseFrequenciaBuscaQuestoes.then(definirFrequenciaBuscaQuestoes, onError);


    console.log(browser.i18n.getMessage('preferences_loaded'));
}

document.addEventListener("DOMContentLoaded", carregarPreferencias);
document.querySelector("form").addEventListener("submit", salvarPreferencias);