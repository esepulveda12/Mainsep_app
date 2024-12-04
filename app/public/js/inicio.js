

document.addEventListener("DOMContentLoaded", function() {
  const faqItems = document.querySelectorAll('.faq-item');

  faqItems.forEach(item => {
    const questionButton = item.querySelector('.faq-question');

    questionButton.addEventListener('click', function() {
      // Toggle the active class to show/hide the answer
      const answer = item.querySelector('.faq-answer');
      const scrollIndicator = item.querySelector('.scroll-indicator i');

      answer.classList.toggle('active'); // Show or hide the answer
      scrollIndicator.classList.toggle('fa-chevron-down'); // Toggle the down arrow
      scrollIndicator.classList.toggle('fa-chevron-up'); // Toggle the up arrow
    });
  });
});
