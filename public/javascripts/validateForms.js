// Example starter JavaScript for disabling form submissions if there are invalid fields
(function () {
    'use strict'

    bsCustomFileInput.init(); //for the image file input
  
    // Fetch all the forms we want to apply custom Bootstrap validation styles to
    var forms = document.querySelectorAll('.validated-form')
  
    // Loop over them and prevent submission
    //make an array from the forms there and then loop over each
    Array.from(forms)
      .forEach(function (form) {
        form.addEventListener('submit', function (event) {
          if (!form.checkValidity()) {
            event.preventDefault()
            event.stopPropagation()
          }
  
          form.classList.add('was-validated')
        }, false)
      })
    })