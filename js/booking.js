window.Booking = {
    refs: {
        table: 'table',
        modal: '#modal',
        modalBody: '#modal-body',
        modalTitle: '#modal-title',
        modalOK: '#modal-ok',
        modalHide: '#modal-hide'
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
Booking.loadData = function () {
    let me = Booking;
    let {response} = ajaxSync(`
        select
            a.*,
            b.startdate, b.enddate,
            CURDATE() = b.startdate A,
            CURDATE() = b.enddate B,
            b.checkout
        from room a
        left join booking b on a.id = b.room_id and b.enddate >= CURDATE()
    `);
    let tbody = me.table.find('tbody');
    let raw = {};
    tbody.html('');
    response.data.forEach(function (room) {
        room.priceperday = parseFloat(room.priceperday);
        room.price = `$ ${room.priceperday.formatMoney(2, '.', ',')}`;
        let {id, name, price, capacity, priceperday, A, B, startdate, enddate, checkout} = room;
        raw[id] = raw[id] || {
            id, name, price, capacity, priceperday, booked: [], dates:[]
        };
        if (checkout !== '1') {
            if (startdate && startdate) {
                let ed = new Date(enddate);
                let sd = new Date(startdate);
                let intval = (ed.getTime()/(1000*60*60*24) - sd.getTime()/(1000*60*60*24)) + 1;
                let dates = [];
                for (let i = 0; i < intval; i++) {
                    dates.push(Booking.getDate(new Date(sd.getTime() + ((1000*60*60*24) * i))));
                }
                raw[id].dates.push(dates);
            }
            if (A == '1' || B == '1') raw[id].booked.push(false);
        }
    });
    for (let r in raw) {
        let {id, name, capacity, price, booked} = raw[r];
        let tr = $(`
            <tr>
                <td>${id}</td>
                <td>${name}</td>
                <td style="text-align: center">${capacity}</td>
                <td>${price}</td>
                <td style="text-align: center">${booked.length?'No':'Yes'}</td>
                <td>
                    <button type="button" class="btn btn-outline-success btn-sm">Booking</button>
                </td>
            </tr>
        `);
        tr.data(raw[r]);
        tbody.append(tr);
    }
    tbody.find('button').on('click', function () {
        let data = $(this).closest('tr').data();
        let bookedDate = {};
        if (data.dates.length) {
            data.dates.forEach(function (data) {
                data.forEach(function (e) {
                    bookedDate[e] = 1;
                })
            })
        }
        me.modalTitle.html('Booking: ' + data.name);
        me.modal.modal('show');
        me.modalBody.html('');
        me.modalBody.append(`<pre>Price: ${data.price}</pre>`);
        me.modalBody.append(`
            <div style="margin-bottom: 10px;">
                <a>Mr. / Mrs.</a>
                <input id="attn" type="text" class="form-control" placeholder="Name" aria-label="Name">
            </div>
        `);
        me.modalBody.append(`
            <div style="margin-bottom: 10px;">
                <a>Date start</a>
                <input id="startdate" type="text" class="form-control" placeholder="Date start" aria-label="Date start">
            </div>
        `);
        me.modalBody.append(`
            <div style="margin-bottom: 10px;">
                <a>Date end</a>
                <input id="enddate" type="text" class="form-control" placeholder="Date end" aria-label="Date end">
            </div>
        `);
        me.modalBody.append(`
            <div id="onerror" style="margin-bottom: 10px; text-align: right; color: crimson; font-size: 11px; font-style: italic;"></div>
        `);
        me.modalBody.append(`
            <div id="onsuccess" style="margin-bottom: 10px; text-align: right; color: green; font-size: 11px;"></div>
        `);
        me.modalBody.find('input').on('change', function () {
            me.modalOK.removeAttr('disabled');
        });
        me.modalOK.off('click');
        me.modalOK.on('click', function () {
            let now = new Date();
            let error = [];
            let room_id = data.id;
            let attn = me.modalBody.find('#attn').val();
            let startdate = new Date(me.modalBody.find('#startdate').val());
            let enddate = new Date(me.modalBody.find('#enddate').val());
            let onerror = me.modalBody.find('#onerror');
            let onsuccess = me.modalBody.find('#onsuccess');
            let user_id = LOGGEDBY;

            me.modalOK.attr('disabled', 1);
            now.setHours(0);
            now.setMinutes(0);
            now.setSeconds(0);
            now.setMilliseconds(0);
            startdate.setHours(0);
            startdate.setMinutes(0);
            startdate.setSeconds(0);
            startdate.setMilliseconds(0);
            enddate.setHours(0);
            enddate.setMinutes(0);
            enddate.setSeconds(0);
            enddate.setMilliseconds(0);

            if (!user_id) error.push('logged user');
            if (!room_id) error.push('room');
            if (!attn) error.push('attn');
            if (
                !startdate || startdate == 'Invalid Date' ||
                isNaN(startdate.getTime()) ||
                now > startdate ||
                bookedDate.hasOwnProperty(me.getDate(startdate))
            ) {
                if (bookedDate.hasOwnProperty(me.getDate(startdate))) {
                    error.push('start date already reserved')
                } else {
                    error.push('start date');
                }
            }
            if (
                !enddate || enddate == 'Invalid Date' ||
                isNaN(enddate.getTime()) ||
                enddate < startdate ||
                bookedDate.hasOwnProperty(me.getDate(enddate))
            ) {
                if (bookedDate.hasOwnProperty(me.getDate(enddate))) {
                    error.push('end date already reserved')
                } else {
                    error.push('end date');
                }
            }
            if (error.length) {
                onerror.html('Invalid ' + error.join(', '));
            } else {
                let id = parseInt(ajaxSync(`select count(*) id from booking`).response.data[0].id) + 1;
                let {response} = ajaxSync(`
                    insert into booking set
                    id = ${id},
                    room_id = ${room_id},
                    attn = '${attn}',
                    startdate = '${me.getDate(startdate)}',
                    enddate = '${me.getDate(enddate)}',
                    user_id = '${LOGGEDBY}'
                `);
                if (response.success) {
                    let intval = ((enddate.getTime() - startdate.getTime()) / (1000*60*60*24)) + 1;
                    let total = data.priceperday * intval;
                    let payment = ajaxSync(`
                        insert into payment set
                        booking_id = ${id},
                        user_id = '${user_id}',
                        total = '${total}'
                    `);
                    if (payment.response.success) {
                        onerror.html('');
                        onsuccess.html('Saved, okay');
                        me.modalHide.click();
                        Booking.loadData();
                    } else {
                        onsuccess.html('');
                        onerror.html(response.message);
                    }
                } else {
                    onsuccess.html('');
                    onerror.html(response.message);
                }
            }
        });
    })
};
Booking.init = function () {
    Booking.loadData();
};
$(document).ready(function () {
    for (let r in Booking.refs) {
        console.log($('#booking-page').find(Booking.refs[r]))
        Booking[r] = $('#booking-page').find(Booking.refs[r]);
    }
    Booking.init();
});