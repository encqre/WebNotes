//function to generate v4 compliant UUIDs
function uuidv4() {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
      var r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8);
      return v.toString(16);
    });
  }


  $('[id^=submit-edit-]').on('submit', function(event) {
    id = $(this)[0].id;
    entryUUID = id.replace("submit-edit-", "");
    title = $('#submit-edit-' + entryUUID).serializeArray()[1].value;
    content = $('#submit-edit-' + entryUUID).serializeArray()[2].value;
    event.preventDefault();
    console.log($('#submit-edit-' + entryUUID).serializeArray());
    console.log("captured this OG submit edit form");
    submitEditEntryChanges(entryUUID, title, content);
});

function createNewEntry(bodyNodeId) {
    category = bodyNodeId.replace("#", "");
    bodyNode = $(bodyNodeId)[0];
    entryUUID = uuidv4();
    console.log('made a new entry with ID: ' + entryUUID);
    csrfValue = $("[name='csrfmiddlewaretoken']").val();
    newCardHTML = '<div class="card border-dark" style="margin-top: 0.25rem;" id="card-' + entryUUID + '"><div class="card-body" style="padding-top: 0.5rem;" id="card-body-' + entryUUID + '"><form method="post" action="" enctype="multipart/form-data" id="submit-new-' + entryUUID + '"><input type="hidden" name="csrfmiddlewaretoken" value="' + csrfValue + '"><div class="text-right"><button class="hide-this-button" title="Submit this entry" style="margin-right: 10px;" type="submit" id="edit-' + entryUUID + '"><i class="fas fa-check fa-lg"></i></button><button class="hide-this-button" title="Cancel this entry" onclick="cancelNewEntry(' + "'" + bodyNodeId + "'" +  ')" type="button" id="remove-' + entryUUID + '" name="' + category + '"><i class="fas fa-times fa-lg"></i></button></div><h6 class="card-title" id="title-' + entryUUID + '"><input type="text" placeholder="Enter note entry title" style="width:90%;" name="title"></h6><hr><p class="card-text" id="content-' + entryUUID + '"><textarea class="tinymce4-editor" cols="40" id="new-textarea-' + entryUUID + '" name="content" rows="10" required></textarea></p></form></div><div class="card-footer text-muted text-right" style="padding:0.20rem; padding-right:1rem;" id="footer-' + entryUUID + '"><small>Updated by: me @ Today</small></div></div>';
    bodyNode.innerHTML = newCardHTML + bodyNode.innerHTML;

    //setup submit listener
    $('#submit-new-' + entryUUID).on('submit', function(event) {
        id = $(this)[0].id;
        if (id.startsWith("submit-new-")) {
            id = id.replace("submit-new-", "");
            title = $('#submit-new-' + entryUUID).serializeArray()[1].value;
            content = $('#submit-new-' + entryUUID).serializeArray()[2].value;
            category = $('#remove-' + entryUUID)[0].name;
            event.preventDefault();
            console.log($('#submit-new-' + entryUUID).serializeArray());
            console.log("captured this submit new form");
            submitNewEntry(id, title, content, category);
        } else if (id.startsWith("submit-edit-")) {
            id = id.replace("submit-edit-", "");
            title = $('#submit-edit-' + id).serializeArray()[1].value;
            content = $('#submit-edit-' + id).serializeArray()[2].value;
            event.preventDefault();
            console.log($('#submit-edit-' + id).serializeArray());
            console.log("captured this submit edit form");
            submitEditEntryChanges(id, title, content);
        }
    });

    //Init tiny mce
    (function($){
        function tinymce4_init(selector){
          var tinymce4_config={
            setup:function(editor){
            editor.on('change',function(){
              editor.save();});}
              ,"height":360,"width":868,
              "cleanup_on_startup":true,
              "custom_undo_redo_levels":20,
              "selector":"textarea#new-textarea-" + entryUUID,
              "theme":"modern","plugins":"\n            textcolor save link image media preview codesample contextmenu\n            table code lists fullscreen  insertdatetime  nonbreaking\n            contextmenu directionality searchreplace wordcount visualblocks\n            visualchars code fullscreen autolink lists  charmap print  hr\n            anchor pagebreak\n            ","toolbar1":"\n            fullscreen preview bold italic underline | fontselect,\n            fontsizeselect  | forecolor backcolor | alignleft alignright |\n            aligncenter alignjustify | indent outdent | bullist numlist table |\n            | link image media | codesample |\n            ","toolbar2":"\n            visualblocks visualchars |\n            charmap hr pagebreak nonbreaking anchor |  code |\n            ","contextmenu":"formats | link image","menubar":true,"statusbar":true,"language":"en","directionality":"ltr"};if(typeof selector!='undefined'){tinymce4_config['selector']=selector;}
      tinymce.init(tinymce4_config);}
      tinymce4_init();})();
}

function cancelNewEntry(bodyNodeId) {
    bodyNode = $(bodyNodeId)[0];
    bodyNode.removeChild(bodyNode.childNodes[0]);
    console.log('canceled');
}

function submitNewEntry(entryUUID, entryTitle, entryContent, entryCategory) {
    console.log('submitting new entry with ID: ' + entryUUID);

    cardBody = $("#card-body-" + entryUUID)[0];
    firstButton = $("#edit-" + entryUUID)[0];
    secondButton = $("#remove-" + entryUUID)[0];
    titleNode = $("#title-" + entryUUID)[0];
    contentNode = $("#content-" + entryUUID)[0];
    formNode = $("#submit-new-" + entryUUID)[0];
    footerNode = $("#footer-" + entryUUID)[0];

    $.ajax({
        url : "/notes/new/", // endpoint
        type : "POST", // http method
        data : { uuid : entryUUID,
            title : entryTitle,
            content : entryContent,
            category : entryCategory,
            csrfmiddlewaretoken : $("[name='csrfmiddlewaretoken']").val() }, // data sent with the post request
        
        // handle a successful response
        success : function(json) {
            console.log(json); // log the reutrned json to the console
            if (json.status == "created") {
                titleNode.removeChild(titleNode.childNodes[0]);
                titleNode.textContent = json.title;

                while (contentNode.childNodes.length > 0) {
                    contentNode.removeChild(contentNode.childNodes[0]);
                }
                contentNode.innerHTML = json.content;

                while (firstButton.childNodes.length > 0) {
                    firstButton.removeChild(firstButton.childNodes[0]);
                }
                firstButton.onclick = function() {editExistingEntry(entryUUID)};
                firstButton.type = "button";
                firstButton.innerHTML = '<i class="fas fa-edit fa-lg"></i>';
                firstButton.title = "Edit this entry";
                secondButton.onclick = function() {removeExistingEntry(entryUUID)};
                secondButton.title = "Delete this entry";

                formNode.id = "submit-edit-" + entryUUID;

                footerNode.innerHTML = "<small>Updated by: " + json.updater + " @ " + json.date + "</small>";
                
            }
            // console.log('success');
            
        },
        
        //handle a non-successful response
        error : function(xhr,errmsg,err) {
            alert('Something bad happened');
            console.log(xhr.status + ": " + xhr.responseText); // more info
        }
    });
}

function removeExistingEntry(entryUUID) {
    console.log('Removing existing entry with ID: ' + entryUUID);
    cardId = "#card-" + entryUUID;
    $.ajax({
        url : "/notes/remove/", // endpoint
        type : "POST", // http method
        data : { uuid : entryUUID,
            csrfmiddlewaretoken: $("[name='csrfmiddlewaretoken']").val() }, // data sent with the post request
        
        // handle a successful response
        success : function(json) {
            card = $(cardId)[0]
            card.parentNode.removeChild(card);
            console.log(json); // log the reutrned json to the console
            console.log('success'); // another sanity check
            
        },
        
        //handle a non-successful response
        error : function(xhr,errmsg,err) {
            alert('Something bad happened');
            console.log(xhr.status + ": " + xhr.responseText); // more info
        }
    });
}

function editExistingEntry(entryUUID) {
    console.log('Editing existing entry with ID: ' + entryUUID);

    formBody = $("#submit-edit-" + entryUUID)[0];
    firstButton = $("#edit-" + entryUUID)[0];
    secondButton = $("#remove-" + entryUUID)[0];
    titleNode = $("#title-" + entryUUID)[0];
    contentNode = $("#content-" + entryUUID)[0];
    
    $.ajax({
        url : "/notes/get_content/", // endpoint
        type : "POST", // http method
        data : {uuid: entryUUID,
            csrfmiddlewaretoken: $("[name='csrfmiddlewaretoken']").val()}, // data sent with the post request
        
        // handle a successful response
        success : function(json) {
            current_title = json.title;
            current_content = json.content;
            console.log(json); 
            console.log('success'); // another sanity check

            titleNode.innerHTML = '<input type="text" value="' + current_title + '" style="width:90%;" name="title">';
            contentNode.innerHTML = '<textarea class="tinymce4-editor" cols="40" id="tiny-' + entryUUID +  '" name="content" rows="10" required>' + current_content + '</textarea>';
            
            while (firstButton.childNodes.length > 0) {
                firstButton.removeChild(firstButton.childNodes[0]);
            }
            firstButton.onclick = null;
            firstButton.type = "submit";
            firstButton.innerHTML = '<i class="fas fa-check fa-lg"></i>'
            firstButton.title = "Save changes";
            secondButton.onclick = function() {discardEditEntryChanges(entryUUID)};
            secondButton.title = "Discard changes";

            while (formBody.childNodes.length > 9) {
                formBody.removeChild(formBody.childNodes[9]);
            }
            
            //setup submit listener
            //TODO need to figure out how to make sure only one is running. If same entry is edited several times, each time new listener is setup now, and ajax calls are duped.
            
            
            //Initialize tinyMCE textarea widget
            (function($){
                console.log('initializing tinyMCE text area')
                function tinymce4_init(selector){
                  var tinymce4_config={
                    setup:function(editor){
                    editor.on('change',function(){
                      editor.save();});}
                      ,"height":360,"width":868,
                      "cleanup_on_startup":true,
                      "custom_undo_redo_levels":20,
                      "selector":"textarea#tiny-" + entryUUID,
                      "theme":"modern","plugins":"\n            textcolor save link image media preview codesample contextmenu\n            table code lists fullscreen  insertdatetime  nonbreaking\n            contextmenu directionality searchreplace wordcount visualblocks\n            visualchars code fullscreen autolink lists  charmap print  hr\n            anchor pagebreak\n            ","toolbar1":"\n            fullscreen preview bold italic underline | fontselect,\n            fontsizeselect  | forecolor backcolor | alignleft alignright |\n            aligncenter alignjustify | indent outdent | bullist numlist table |\n            | link image media | codesample |\n            ","toolbar2":"\n            visualblocks visualchars |\n            charmap hr pagebreak nonbreaking anchor |  code |\n            ","contextmenu":"formats | link image","menubar":true,"statusbar":true,"language":"en","directionality":"ltr"};if(typeof selector!='undefined'){tinymce4_config['selector']=selector;}
              tinymce.init(tinymce4_config);}
              tinymce4_init();})();
            
        },
        
        //handle a non-successful response
        error : function(xhr,errmsg,err) {
            alert('Something bad happened');
            console.log(xhr.status + ": " + xhr.responseText); // more info
        }
    });
}

function submitEditEntryChanges(entryUUID, entryTitle, entryContent) {
    console.log('submitting edited changes for ID: ' + entryUUID);

    card = $("#card-" + entryUUID)[0];
    cardBody = $("#card-body-" + entryUUID)[0];
    firstButton = $("#edit-" + entryUUID)[0];
    secondButton = $("#remove-" + entryUUID)[0];
    titleNode = $("#title-" + entryUUID)[0];
    contentNode = $("#content-" + entryUUID)[0];
    formNode = $("#submit-edit-" + entryUUID)[0];
    footerNode = $("#footer-" + entryUUID)[0];

    $.ajax({
        url : "/notes/edit/", // endpoint
        type : "POST", // http method
        data : { uuid : entryUUID,
            title : entryTitle,
            content : entryContent,
            csrfmiddlewaretoken : $("[name='csrfmiddlewaretoken']").val() }, // data sent with the post request
        
        // handle a successful response
        success : function(json) {
            console.log(json); // log the reutrned json to the console
            if (json.status == "updated") {
                card.id = "card-" + json.new_uuid;
                cardBody.id = "card-body-" + json.new_uuid;
                formNode.id = "submit-edit-" + json.new_uuid;

                while (firstButton.childNodes.length > 0) {
                    firstButton.removeChild(firstButton.childNodes[0]);
                }
                firstButton.onclick = function() {editExistingEntry(json.new_uuid)};
                firstButton.type = "button";
                firstButton.innerHTML = '<i class="fas fa-edit fa-lg"></i>';
                firstButton.title = "Edit this entry";
                firstButton.id = "edit-" + json.new_uuid;

                secondButton.onclick = function() {removeExistingEntry(json.new_uuid)};
                secondButton.title = "Delete this entry";
                secondButton.id = "remove-" + json.new_uuid;

                titleNode.removeChild(titleNode.childNodes[0]);
                titleNode.textContent = json.title;
                titleNode.id = "title-" + json.new_uuid;

                while (contentNode.childNodes.length > 0) {
                    contentNode.removeChild(contentNode.childNodes[0]);
                }
                contentNode.innerHTML = json.content;
                contentNode.id = "content-" + json.new_uuid;

                footerNode.innerHTML = "<small>Updated by: " + json.updater + " @ " + json.date + "</small>";
                footerNode.id = "footer-" + json.new_uuid;
            
            }
        },
        
        //handle a non-successful response
        error : function(xhr,errmsg,err) {
            alert('Something bad happened');
            console.log(xhr.status + ": " + xhr.responseText); // more info
        }
    });
}

function discardEditEntryChanges(entryUUID) {
    console.log('discarding changes for ID: ' + entryUUID);

    cardBody = $("#card-body-" + entryUUID)[0];
    firstButton = $("#edit-" + entryUUID)[0];
    secondButton = $("#remove-" + entryUUID)[0];
    titleNode = $("#title-" + entryUUID)[0];
    contentNode = $("#content-" + entryUUID)[0];
    
    $.ajax({
        url : "/notes/get_content/", // endpoint
        type : "POST", // http method
        data : {uuid: entryUUID,
            csrfmiddlewaretoken: $("[name='csrfmiddlewaretoken']").val()}, // data sent with the post request
        
        // handle a successful response
        success : function(json) {
            old_title = json.title;
            old_content = json.content;
            console.log(json); 
            console.log('success'); // another sanity check

            titleNode.removeChild(titleNode.childNodes[0]);
            titleNode.textContent = old_title;

            while (contentNode.childNodes.length > 0) {
                contentNode.removeChild(contentNode.childNodes[0]);
            }
            contentNode.innerHTML = old_content;
            
            
            while (firstButton.childNodes.length > 0) {
                firstButton.removeChild(firstButton.childNodes[0]);
            }
            firstButton.onclick = function() {editExistingEntry(entryUUID)};
            firstButton.type = "button";
            firstButton.innerHTML = '<i class="fas fa-edit fa-lg"></i>'
            secondButton.onclick = function() {removeExistingEntry(entryUUID)};
            
        },
        
        //handle a non-successful response
        error : function(xhr,errmsg,err) {
            alert('Something bad happened');
            console.log(xhr.status + ": " + xhr.responseText); // more info
        }
    });
}


