(function($){
    function tinymce4_init(selector){
      var tinymce4_config={
        setup:function(editor){
        editor.on('change',function(){
          editor.save();});}
          ,"height":360,"width":868,
          "cleanup_on_startup":true,
          "custom_undo_redo_levels":20,
          "selector":"textarea#new-textarea-9999",
          "theme":"modern","plugins":"\n            textcolor save link image media preview codesample contextmenu\n            table code lists fullscreen  insertdatetime  nonbreaking\n            contextmenu directionality searchreplace wordcount visualblocks\n            visualchars code fullscreen autolink lists  charmap print  hr\n            anchor pagebreak\n            ","toolbar1":"\n            fullscreen preview bold italic underline | fontselect,\n            fontsizeselect  | forecolor backcolor | alignleft alignright |\n            aligncenter alignjustify | indent outdent | bullist numlist table |\n            | link image media | codesample |\n            ","toolbar2":"\n            visualblocks visualchars |\n            charmap hr pagebreak nonbreaking anchor |  code |\n            ","contextmenu":"formats | link image","menubar":true,"statusbar":true,"language":"en","directionality":"ltr"};if(typeof selector!='undefined'){tinymce4_config['selector']=selector;}
  tinymce.init(tinymce4_config);}
  tinymce4_init();})();