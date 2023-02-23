const waitSecond = (s) => new Promise((resolve) => {
    setTimeout(() => {
        resolve()
    }, s * 1000);
});

Array.prototype.random = function () {
    return this[Math.floor((Math.random()*this.length))];
}

$('#word').textfill({
    maxFontPixels: 200
});

const queue = [];
let animating = false;

const wordList1 = [
    '123',
    '456',
    '789',
];

const wordList2 = [
    '321',
    '654',
    '987',
];

$(window).on('redemption', async function (e, title, user, input) {
    if (animating) {
        queue.unshift([title, user, input]);
        return;
    }
    animating = true;
    if (title === '試野') {
        const word1 = wordList1.random();
        const word2 = wordList2.random();
        $("#word span").text(`${user}${word1}${word2}`);
        $('#word').textfill({
            maxFontPixels: 200
        });
        $("#word-wrapper").fadeIn();
        await waitSecond(300);
        $("#word-wrapper").fadeOut();
    } else if (title === '印度搖') {
        executeVSAction('india');
    }
    animating = false;
    if (queue.length) {
        const item = queue.pop();
        $(window).trigger('redemption', item);
    }
});


