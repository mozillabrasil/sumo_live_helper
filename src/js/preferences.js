var backgroundPage = browser.extension.getBackgroundPage();

// notify_keywords
$(document).ready(function(){
  var radios = document.getElementsByName("notify_involved");
  var val = localStorage.getItem('notify_involved');
  for(var i=0;i<radios.length;i++){
    if(radios[i].value == val){
      radios[i].checked = true;
    }
  }
$('input[name="notify_involved"]').on('change', function(){
    localStorage.setItem('notify_involved', $(this).val());
    backgroundPage.request.onload();
  });
});

// notify_keywords
$(document).ready(function(){
  var radios = document.getElementsByName("notify_keywords");
  var val = localStorage.getItem('notify_keywords');
  for(var i=0;i<radios.length;i++){
    if(radios[i].value == val){
      radios[i].checked = true;
    }
  }
$('input[name="notify_keywords"]').on('change', function(){
    localStorage.setItem('notify_keywords', $(this).val());
    backgroundPage.request.onload();
   });
});

// keywords
$(document).ready(function(){
  var value = document.getElementsByName("keywords");
  var val = localStorage.getItem('keywords');

  localStorage.setItem('keywords', value.value);
   backgroundPage.contextMenuFunction();
});

// notify_opentab
$(document).ready(function(){
  var radios = document.getElementsByName("notify_opentab");
  var val = localStorage.getItem('notify_opentab');
  for(var i=0;i<radios.length;i++){
    if(radios[i].value == val){
      radios[i].checked = true;
    }
  }
$('input[name="notify_opentab"]').on('change', function(){
    localStorage.setItem('notify_opentab', $(this).val());
    backgroundPage.request.onload();
   });
});

// watch_questions
$(document).ready(function(){
  var radios = document.getElementsByName("watch_questions");
  var val = localStorage.getItem('watch_questions');
  for(var i=0;i<radios.length;i++){
    if(radios[i].value == val){
      radios[i].checked = true;
    }
  }
$('input[name="watch_questions"]').on('change', function(){
    localStorage.setItem('watch_questions', $(this).val());
    backgroundPage.request.onload();
   });
});

// watch_firefox
$(document).ready(function(){
  var radios = document.getElementsByName("watch_firefox");
  var val = localStorage.getItem('watch_firefox');
  for(var i=0;i<radios.length;i++){
    if(radios[i].value == val){
      radios[i].checked = true;
    }
  }
$('input[name="watch_firefox"]').on('change', function(){
    localStorage.setItem('watch_firefox', $(this).val());
    backgroundPage.request.onload();
   });
});

// watch_mobile
$(document).ready(function(){
  var radios = document.getElementsByName("watch_mobile");
  var val = localStorage.getItem('watch_mobile');
  for(var i=0;i<radios.length;i++){
    if(radios[i].value == val){
      radios[i].checked = true;
    }
  }
$('input[name="watch_mobile"]').on('change', function(){
    localStorage.setItem('watch_mobile', $(this).val());
    backgroundPage.request.onload();
   });
});

// watch_thunderbird
$(document).ready(function(){
  var radios = document.getElementsByName("watch_thunderbird");
  var val = localStorage.getItem('watch_thunderbird');
  for(var i=0;i<radios.length;i++){
    if(radios[i].value == val){
      radios[i].checked = true;
    }
  }
$('input[name="watch_thunderbird"]').on('change', function(){
    localStorage.setItem('watch_thunderbird', $(this).val());
    backgroundPage.request.onload();
   });
});

// watch_webmaker
$(document).ready(function(){
  var radios = document.getElementsByName("watch_webmaker");
  var val = localStorage.getItem('watch_webmaker');
  for(var i=0;i<radios.length;i++){
    if(radios[i].value == val){
      radios[i].checked = true;
    }
  }
$('input[name="watch_webmaker"]').on('change', function(){
    localStorage.setItem('watch_webmaker', $(this).val());
    backgroundPage.request.onload();
   });
});

// polling
$(document).ready(function(){
  var value = document.getElementsByName("polling");
  var val = localStorage.getItem('polling');

  localStorage.setItem('polling', value.value);
   backgroundPage.contextMenuFunction();
});