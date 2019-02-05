function lndBtnPressed() {
    if(document.getElementById("lnd-donate-image").classList.contains('lndHideImage')) {
        document.getElementById("lnd-donate-image").classList.remove('lndHideImage');
    } else {
        document.getElementById("lnd-donate-image").classList.add('lndHideImage');        
    }
}

function lndBtnPressedCustom() {

    var baseUrl = 'http://btarpbits.com:3000';
    var amount = document.getElementById('lnd-donate-amount').value;
    var message = document.getElementById('lnd-donate-message').value;

    if(isNaN(amount)) {
        amount = '100';
    }

    if(message.length > 50) {
        message = message.slice(0, 50);
    }

    var requestSrc = `${baseUrl}/ln/${amount}/${message}`;    

    if(document.getElementById("lnd-donate-image-custom").classList.contains('lndHideImage')) {
        document.getElementById("lnd-donate-image-custom").src = requestSrc;
        document.getElementById("lnd-donate-image-custom").classList.remove('lndHideImage');
    } else {
        document.getElementById("lnd-donate-image-custom").classList.add('lndHideImage');        
    }
}