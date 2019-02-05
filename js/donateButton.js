function lndBtnPressed() {
    if(document.getElementById("lnd-donate-image").classList.contains('lndHideImage')) {
        document.getElementById("lnd-donate-image").classList.remove('lndHideImage');
    } else {
        document.getElementById("lnd-donate-image").classList.add('lndHideImage');        
    }
}