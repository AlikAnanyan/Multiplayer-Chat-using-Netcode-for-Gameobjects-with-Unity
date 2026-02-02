// Handle opening results in a new tab when checkbox is checked
const form = document.getElementById('searchForm');
const openInNewTab = document.getElementById('openInNewTab');
form.addEventListener('submit', function(e){
  if (openInNewTab.checked) {
    const data = new FormData(form);
    const qs = new URLSearchParams(data).toString();
    const url = form.action + '?' + qs;
    window.open(url, '_blank');
    e.preventDefault();
  }
});

// Blank-screen toggle (simple overlay, not intended for hiding remote monitoring)
const blankToggle = document.getElementById('blankToggle');
const overlay = document.getElementById('blankOverlay');
const returnBtn = document.getElementById('returnBtn');
blankToggle.addEventListener('click', () => overlay.classList.remove('hidden'));
returnBtn.addEventListener('click', () => overlay.classList.add('hidden'));

// Confirm before closing the tab/window
window.addEventListener('beforeunload', function (e) {
  // Most browsers ignore the custom message and show a generic confirmation dialog.
  e.preventDefault();
  e.returnValue = '';
});