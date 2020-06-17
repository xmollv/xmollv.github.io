function calculate_top() {
    var h1 = document.getElementsByTagName("h1")[0];
    var pageOffset = window.pageYOffset;

    if (pageOffset <= 0) {
        h1.style.marginTop = "16px";
    } else if (pageOffset > 0 && pageOffset <= 46) {
        h1.style.marginTop = -(pageOffset-16) + "px";
    } else {
        h1.style.marginTop = "-30px";
    }
}