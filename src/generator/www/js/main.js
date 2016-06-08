$(document).ready(function(){

 var $email =$('#email');
 var $name  =$('#name'); 
 var $url  =$('#url');

  $('#btn').click(function() { 

 
  var form = document.querySelector('form');
  var formData = new FormData(form);
  var file_data = $('input[type="file"]')[0].files;
  console.log(file_data);

  formData.append( 'sessionfile', $( '#sessionfile' )[0].files[0] );
  formData.append( 'speakerfile', $( '#speakerfile' )[0].files[0] );
  formData.append( 'trackfile', $( '#trackfile' )[0].files[0] );
  formData.append( 'locationfile', $( '#locationfile' )[0].files[0] );

  var obj={
    name:$name.val(),
    email:$email.val(),
    url :$url.val(),
    data:obj
    
  }
  $.ajax({
    type: 'POST',
    url:  ' ',
    data: obj,
    processData: false,
    contentType: false,
    
    success :function(data){
       
  })

});
});




  

