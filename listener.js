const waitSecond = (s) => new Promise((resolve) => {
    setTimeout(() => {
        resolve()
    }, s * 1000);
});

const queue = [];
let animating = false;

$(window).on('redemption', async function (e, title, user, input) {
    if (animating) {
        queue.unshift([title, user, input]);
        return;
    }
    animating = true;
    if (title === '請台主幫我安慰我朋友') {

        $("#img1").fadeIn();
        await waitSecond(30);
        $("#img1").fadeOut();

    } else {

        $("#img2").fadeIn();
        await waitSecond(30);
        $("#img2").fadeOut();

    }
    animating = false;
    if (queue.length) {
        const item = queue.pop();
        $(window).trigger('redemption', item);
    }
});


