const hash = window.location.hash;
Number.prototype.formatMoney = function (c, d, t) {
    var n = this,
        c = isNaN(c = Math.abs(c)) ? 2 : c,
        d = d == undefined ? "." : d,
        t = t == undefined ? "," : t,
        s = n < 0 ? "-" : "",
        i = String(parseInt(n = Math.abs(Number(n) || 0).toFixed(c))),
        j = (j = i.length) > 3 ? j % 3 : 0;
    return s + (j ? i.substr(0, j) + t : "") + i.substr(j).replace(/(\d{3})(?=\d)/g, "$1" + t) + (c ? d + Math.abs(n - i).toFixed(c).slice(2) : "");
};
window.ajaxSync = function (query = '') {
    let response = '';
    let {statusText, status, responseText} = $.ajax({
        async: false,
        method: 'POST',
        url: './php/api.php',
        data: {query}
    });
    try {
        response = JSON.parse(responseText)
    } catch (e) {
        response = responseText;
    }
    return {statusText, status, response}
};
window.loader = function (page) {
    let name = page[0].toUpperCase() + page.substr(1);
    let title = $('title');
    let main = $('main');
    let view = 'view/' + page + '.html';
    let js = 'js/' + page + '.js';
    let script = $(`script[src="${js}"]`);
    //
    $('#navbar a').each(function () {
        let a = $(this);
        let text = a.text().replace(' (current)', '');
        if (a.attr('page') === page) {
            a.html(text + '<span class="sr-only"> (current)</span>');
            a.parent().addClass('active')
        } else {
            a.html(text);
            a.parent().removeClass('active');
        }
    });
    title.text('Reservation: ' + name);
    if (!script.length) {
        main.find('div').hide();
        $.get(view).then(function (raw) {
            main.append(raw);
            $('body').append(`<script type="text/javascript" src="${js}"></script>`);
        });
    } else {
        main.find('div[id$="-page"]').hide();
        main.find('div#' + page + '-page').show();
    }
};

$('#navbar a').on('click', function () {
    loader($(this).attr('page'));
});

if (hash === '#booking') {
    loader('booking');
} else if (hash === '#payment') {
    loader('payment');
} else {
    loader($('#navbar li.active a').attr('page'));
}