var download = function(fids, extension, dl_type) {

    // Basic validity checks
    if (fids.length === 0) {
        alert("Please select stations to download data");
        return;
    }

    if (dl_type === 'link') {
        alert(url);
    } else if (dl_type === 'data') {
        if (window.shittyIE) {
            alert("Downloads may not function completely correctly on IE <= 8. Cross your fingers and/or upgrade your browser.");
        }
        alert("OBJECTS BEYOND DOWNLOAD BUTTON MAY BE FURTHER THAN THEY APPEAR");
        window.open("http://i3.kym-cdn.com/photos/images/facebook/000/075/870/Raisins.png", "_blank", "width=600,height=600");
    }
    
};