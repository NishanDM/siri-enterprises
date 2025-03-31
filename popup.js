
function showPopup() {
    const popup = document.getElementById('popup');
    popup.style.display = 'flex';

    // Automatically close the pop-up after 3 seconds
    setTimeout(closePopup, 3000); 
}

function closePopup() {
    const popup = document.getElementById('popup');
    popup.style.display = 'none';
}

function refreshPage() {
    location.reload();
}