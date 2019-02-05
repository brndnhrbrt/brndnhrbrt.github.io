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
    // var requestTextSrc = `${baseUrl}/ln/text/${amount}/${message}`;

    if(document.getElementById("lnd-donate-image-custom").classList.contains('lndHide')) {
        // document.getElementById("lnd-donate-iframe-custom").classList.remove('lndHide');
        document.getElementById("lnd-donate-image-custom").classList.remove('lndHide');
    } 

    // document.getElementById("lnd-donate-iframe-custom").src = requestTextSrc;
    document.getElementById("lnd-donate-image-custom").src = requestSrc;
}