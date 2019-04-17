function salvarPreferencias(e) {
    e.preventDefault();
    let preferencias = {
        buscarQuestoesAtivamente: document.getElementById("buscarQuestoesAtivamente").checked,
        frequenciaBuscaQuestoes: document.getElementById("frequenciaBuscaQuestoes").value
    };

    browser.storage.sync.set(preferencias);

    bootbox.alert({
        message: "Preferências salvas",
        size: "small"
    });
    
    console.log("Preferências salvas");
}

function carregarPreferencias() {
    function definirBuscarQuestoesAtivamente(dados) {
        console.log(dados);
        if (dados.buscarQuestoesAtivamente == true) {
            document.getElementById("buscarQuestoesAtivamente").checked = true
        }
    }

    function definirFrequenciaBuscaQuestoes(dados) {
        if (dados.frequenciaBuscaQuestoes) {
            document.getElementById("frequenciaBuscaQuestoes").value = dados.frequenciaBuscaQuestoes;
        }
    }

    function onError(error) {
        console.log(`Error: ${error}`);
    }

    var promiseBuscarQuestoesAtivamente = browser.storage.sync.get("buscarQuestoesAtivamente");
    var promiseFrequenciaBuscaQuestoes = browser.storage.sync.get("frequenciaBuscaQuestoes");

    promiseBuscarQuestoesAtivamente.then(definirBuscarQuestoesAtivamente, onError);
    promiseFrequenciaBuscaQuestoes.then(definirFrequenciaBuscaQuestoes, onError);
    
    
    console.log("Preferências carregadas");
}

document.addEventListener("DOMContentLoaded", carregarPreferencias);
document.querySelector("form").addEventListener("submit", salvarPreferencias);