window.Payment = {
    refs: {
        table: 'table',
        modal: '#modal2',
        modalBody: '#modal-body2',
        modalTitle: '#modal-title2',
        modalOK: '#modal-ok2',
        modalHide: '#modal-hide2'
    },
    getDate: function (date) {
        let y = date.getFullYear();
        let m = date.getMonth() + 1;
        let d = date.getDate();
        m = m > 9 ? m : '0' + m;
        d = d > 9 ? d : '0' + d;
        return [y, m, d].join('-')
    }
};
Payment.loadData = function () {
    let me = Payment;
    let {response} = ajaxSync(`
        select
            a.id booking_id, a.attn, a.room_id, c.name room_name, 
            a.user_id bookedbyuser_id, c.priceperday,
            a.startdate, a.enddate, a.checkout,
            b.id payment_id, b.user_id payedbyuser_id, b.total, 
            b.paytotal, b.change
        from booking a
        join payment b on a.id = b.booking_id
        join room c on a.room_id = c.id
        order by a.startdate, a.enddate
    `);
    let tbody = me.table.find('tbody');
    tbody.html('');
    response.data.forEach(function (book, x) {
        book.i = x + 1;
        book.priceperday = parseFloat(book.priceperday);
        book.priceperday_ = `$ ${book.priceperday.formatMoney(2, '.', ',')}`;
        book.total = parseFloat(book.total || 0);
        book.total_ = `$ ${book.total.formatMoney(2, '.', ',')}`;
        book.paytotal = parseFloat(book.paytotal || 0);
        book.paytotal_ = `$ ${book.paytotal.formatMoney(2, '.', ',')}`;
        book.change = parseFloat(book.change || 0);
        book.change_ = `$ ${book.change.formatMoney(2, '.', ',')}`;
        let {
            i, booking_id, attn, room_id, room_name,
            bookedbyuser_id, priceperday, priceperday_,
            startdate, enddate, checkout,
            payment_id, payedbyuser_id, total, total_,
            paytotal, paytotal_, change, change_
        } = book;

        let tr = $(`
            <tr>
                <td>${i}</td>
                <td>${attn}</td>
                <td style="text-align: center">${room_name}</td>
                <td>${priceperday_}</td>
                <td style="text-align: center">${startdate}</td>
                <td style="text-align: center">${enddate}</td>
                <td style="text-align: center">${checkout === '1' ? 'Yes' : 'Not Yet'}</td>
                <td>${total_}</td>
                <td>${paytotal_}</td>
                <td>${change_}</td>
                <td>
                    <button type="button" class="btn btn-outline-success btn-sm paypay">Pay</button>
                    <button type="button" class="btn btn-outline-primary btn-sm checkout">Checkout</button>
                </td>
            </tr>
        `);
        if (checkout === '1') tr.find('button.checkout').remove();
        if (change) tr.find('button.paypay').remove();
        tr.data(book);
        tbody.append(tr)
    });
    tbody.find('button.checkout').on('click', function () {
        let data = $(this).closest('tr').data();
        let is = confirm('Flag guest has checkout?');
        if (is) {
            ajaxSync(`
                update booking set
                checkout = '1'
                where id = ${data.booking_id}
            `);
            Payment.loadData();
        }
    });
    tbody.find('button.paypay').on('click', function () {
        let data = $(this).closest('tr').data();
        me.modalTitle.html('Payment');
        me.modal.modal('show');
        me.modalBody.html('');
        me.modalBody.append(`<pre>Price: ${data.total_}</pre>`);
        me.modalBody.append(`
            <div style="margin-bottom: 10px;">
                <a>Pay</a>
                <input id="paytotal" type="number" class="form-control" placeholder="Pay Total" aria-label="Pay Total">
            </div>
        `);
        me.modalBody.append(`
            <div style="margin-bottom: 10px;">
                <a>Change</a>
                <div id="change" style="float: right;"></div>
            </div>
        `);
        me.modalBody.append(`
            <div id="onerror" style="margin-bottom: 10px; text-align: right; color: crimson; font-size: 11px; font-style: italic;"></div>
        `);
        me.modalBody.append(`
            <div id="onsuccess" style="margin-bottom: 10px; text-align: right; color: green; font-size: 11px;"></div>
        `);
        me.modalBody.find('input').on('change', function () {
            let changeinput = me.modalBody.find('#change');
            let paytotal = me.modalBody.find('#paytotal').val();
            let change = paytotal - data.total;
            changeinput.text('$ ' + change.formatMoney(2, '.', ','));
            me.modalOK.removeAttr('disabled');
        });
        me.modalOK.off('click');
        me.modalOK.on('click', function () {
            let user_id = LOGGEDBY;
            let paytotal = me.modalBody.find('#paytotal').val();
            let onerror = me.modalBody.find('#onerror');
            let onsuccess = me.modalBody.find('#onsuccess');

            paytotal = parseFloat(paytotal);
            let change = paytotal - data.total;
            me.modalOK.attr('disabled', 1);

            if (paytotal < data.total) {
                onsuccess.html('');
                onerror.html('Invalid pay total');
            } else {
                let payment = ajaxSync(`
                    update payment set
                    user_id = '${user_id}',
                    paytotal = '${paytotal}',
                    \`change\` = ${change}
                    where id = ${data.payment_id}
                `);
                if (payment.response.success) {
                    onerror.html('');
                    onsuccess.html('Saved, okay');
                    me.modalHide.click();
                    Payment.loadData();
                } else {
                    onsuccess.html('');
                    onerror.html(payment.response.message);
                }
            }
        });
    })
};
Payment.init = function () {
    Payment.loadData();
};
$(document).ready(function () {
    for (let r in Payment.refs) {
        Payment[r] = $('#payment-page').find(Payment.refs[r]);
    }
    Payment.init();
});