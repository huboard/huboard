$(document).ready(function() {

	// Navigation toggle
	$('.nav-toggle').on('click', function() {
		$('.nav ul').slideToggle();
	});


	// Testimonials slider
	$('.slider').unslider({
		dots: true,
    delay: 5000,
    speed: 500,
    loop: false,
    pause: true
	});


	// Form field active states
	$('.form__field input, .form__field textarea').on('focus', function() {
		$(this).parent().addClass('form__field--active');
	}).on('blur', function() {
		$(this).parent().removeClass('form__field--active');
	});

});
