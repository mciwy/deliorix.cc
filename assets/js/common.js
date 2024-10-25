$(function () {
    let pcD = '_pc.';
    let spD = '_sp.';
    let bp = 1024;
    let loadP = (bp < ww) ? pcD : spD;
    let viewP;

    $(window).on("resize", function () {
        ww = $(window).innerWidth();
        viewP = (bp < ww) ? pcD : spD;
        if (loadP != viewP) {
            setTimeout(function () {
                window.location.reload();
            }, 1);
        }
    });
});

function scrAnimation() {
    requestAnimationFrame(() => {
        $('.anitype-title, .anitype-cont').each(function () {
            const itempos = $(this).offset().top;
            if (sct > itempos - wh) {
                $(this).addClass('is-active');
            } else {
                $(this).removeClass('is-active');
            }
        });
    });
}

$(window).on('resize scroll', scrAnimation);

$(window).on('load', function () {
    setTimeout(function () {
        scrAnimation();
    }, 1500);
});