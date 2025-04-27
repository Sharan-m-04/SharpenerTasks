async function fetchSlots() {
    const res = await fetch('/slots');
    const slots = await res.json();
    const slotsDiv = document.getElementById('slots');
    slotsDiv.innerHTML = '';

    slots.forEach(slot => {
        if (slot.available > 0) {
            const div = document.createElement('div');
            div.className = 'slot';
            div.innerHTML = `
                <strong>${slot.time}</strong> - Available: ${slot.available}<br>
                <button onclick="showBookingForm('${slot.time}')">Schedule</button>
                <div id="form-${slot.time}" style="display:none; margin-top:10px;">
                    Name: <input type="text" id="name-${slot.time}"><br>
                    Email: <input type="text" id="email-${slot.time}"><br>
                    <button onclick="bookMeeting('${slot.time}')">Book Meeting</button>
                </div>
            `;
            slotsDiv.appendChild(div);
        }
    });
}

function showBookingForm(time) {
    const formDiv = document.getElementById(`form-${time}`);
    if (formDiv.style.display === 'none' || formDiv.style.display === '') {
        formDiv.style.display = 'block'; // Open if closed
    } else {
        formDiv.style.display = 'none'; // Close if open
    }
}


async function bookMeeting(time) {
    const name = document.getElementById(`name-${time}`).value;
    const email = document.getElementById(`email-${time}`).value;

    if (!name || !email) {
        alert('Please fill both Name and Email!');
        return;
    }

    const res = await fetch('/book', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, time })
    });
    const data = await res.json();

    if (data.success) {
        alert('Meeting Booked!');
        fetchSlots();
        fetchBookings();
    } else {
        alert(data.message || 'Booking failed!');
    }
}

async function fetchBookings() {
    const res = await fetch('/bookings');
    const bookings = await res.json();
    const bookingsDiv = document.getElementById('bookings');
    bookingsDiv.innerHTML = '';

    bookings.forEach(booking => {
        const div = document.createElement('div');
        div.className = 'booking';
        div.innerHTML = `
            <strong>${booking.name}</strong> (${booking.email})<br>
            Meeting Time: ${booking.time}<br>
            <a href="${booking.meet_link}" target="_blank">Join Meeting</a><br>
            <button onclick="cancelMeeting(${booking.id}, '${booking.time}')">Cancel</button>
        `;
        bookingsDiv.appendChild(div);
    });
}

async function cancelMeeting(id, time) {
    if (!confirm('Are you sure to cancel?')) return;

    const res = await fetch('/cancel', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, time })
    });
    const data = await res.json();

    if (data.success) {
        alert('Meeting Cancelled!');
        fetchSlots();
        fetchBookings();
    } else {
        alert('Cancellation failed!');
    }
}

// Initial load
fetchSlots();
fetchBookings();
