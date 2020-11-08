$(document).ready(function() {
    const urlParams = new URLSearchParams(window.location.search);
    const email = urlParams.get('email');
    const apiendpoint = urlParams.get('apiendpoint');
    if(email && apiendpoint){
        $('#email').val(email);
        $('#apiendpoint').val(apiendpoint);
        $('#btnGenerate').trigger('click');
    }
});