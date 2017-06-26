//for front end technician full details mondal
$('.thumbnail .caption p a').click(function(e) {
    $('#technicianInfo img').attr('src', $(this).attr('data-img-url')); 
});


//for admin panel delete confirmatioin modal
$('#DeleteModal').on('show.bs.modal', function (event) {
  var button = $(event.relatedTarget) // Button that triggered the modal
  var delete_link = button.data('href') // Extract info from data-* attributes
  var name = button.data('name')
  // If necessary, you could initiate an AJAX request here (and then do the updating in a callback).
  // Update the modal's content. We'll use jQuery here, but you could use a data binding library or other methods instead.
  var modal = $(this)
  modal.find('.modal-body p').text('Are you sure you want to Delete ' + name)
  modal.find('.modal-footer a').attr('href', delete_link)
})


//modal for presenting full details of a technician
$('#technicianInfo').on('show.bs.modal', function (event) {
  var button = $(event.relatedTarget) ;// Button that triggered the modal
  var teker = button.data('teker');  // Extract info from data-* attributes
  var name = teker.firstname+' '+teker.lastname

  
  
  // If necessary, you could initiate an AJAX request here (and then do the updating in a callback).
  // Update the modal's content. We'll use jQuery here, but you could use a data binding library or other methods instead.
  var modal = $(this)
  modal.find('.modal-body img').attr('src', teker.image_url);
  modal.find('.modal-body h1').text(name)
  var html = '';
  for( field in teker.fields)
  {
    html += '<p>'+teker.fields[field]+'</p>'
  }
  modal.find('.modal-body #specializations #fields').html(html);
  modal.find('.modal-body #message p').text(teker.message);
  modal.find('.modal-body #contact #phone').text(teker.phone)
  modal.find('.modal-body #contact #email').text(teker.email)
  modal.find('.modal-body #location #town').text(teker.location.town)
  modal.find('.modal-body #location #city').text(teker.location.city)
  modal.find('.modal-body #location #country').text(teker.location.country)
  modal.find('.modal-body #experience p').text(teker.years_of_experience+' years')
})