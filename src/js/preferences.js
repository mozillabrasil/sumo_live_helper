var backgroundPage = browser.extension.getBackgroundPage();

// version
var version = document.getElementById("version");
version.textContent = browser.runtime.getManifest().name + " (v"+ browser.runtime.getManifest().version + ")";

// show or not the new questions
//$(document).ready(function(){
//  var radios = document.getElementsByName("showNewQuestions");
//  var val = localStorage.getItem('showNewQuestions');
//  for(var i=0;i<radios.length;i++){
//    if(radios[i].value == val){
//      radios[i].checked = true;
//    }
//  }
//$('input[name="showNewQuestions"]').on('change', function(){
//    localStorage.setItem('showNewQuestions', $(this).val());
//    backgroundPage.request.onload();//  });
//});

// language questions
$(document).ready(function(){
  var language = document.getElementById("chooseLanguage");
  var val = localStorage.getItem('chooseLanguage');

  if (typeof val !== 'undefined' && val !== null){
    language.value = localStorage.getItem('chooseLanguage');
  }else{
    language.value = navigator.language;
  }

  $('select[name="chooseLanguage"]').on('change', function(){
    localStorage.setItem('chooseLanguage', $(this).val());
    backgroundPage.request.onload();
  });
 });

// frequency new questions
$(document).ready(function(){
  var timer = document.getElementById("frequencySeekNewQuestions");
  var val = localStorage.getItem('frequencySeekNewQuestions');

  if (typeof val !== 'undefined' && val !== null){
    timer.value = localStorage.getItem('frequencySeekNewQuestions');
  }else{
    timer.value = 15;
  }

  $('input[name="frequencySeekNewQuestions"]').on('change', function(){
    localStorage.setItem('frequencySeekNewQuestions', $(this).val());
    backgroundPage.request.onload();
    });
 });