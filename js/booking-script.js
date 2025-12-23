$(document).ready(function () {

    /* ===============================
       1. Firebase Configuration
    =============================== */
    const firebaseConfig = {
        apiKey: "AIzaSyDmkohQTE5Abuguruyfq0oRQAKoJBqPygs",
        authDomain: "nagpanatribe.firebaseapp.com",
        databaseURL: "https://nagpanatribe-default-rtdb.firebaseio.com",
        projectId: "nagpanatribe",
        storageBucket: "nagpanatribe.firebasestorage.app",
        messagingSenderId: "445848527346",
        appId: "1:445848527346:web:2dfca68e4e7c74581d4b6b"
    };

    if (!firebase.apps.length) {
        firebase.initializeApp(firebaseConfig);
    }

    const auth = firebase.auth();
    const dbRealtime = firebase.database();
    const dbFirestore = firebase.firestore();

    /* ===============================
       2. Global State
    =============================== */
    let userUID = null;
    let userEmail = null;
    let userName = null;
    let gcashConfirmed = false;

    /* ===============================
       3. Elements
    =============================== */
    const initialBookingArea = $('#initialBookingArea');
    const bookingFormDiv = $('#bookingForm');
    const mainBookingTriggerBtn = $('#mainBookingTriggerBtn');
    const submitBookingBtn = $('#submitBookingBtn');
    const confirmBookingBtn = $('#confirmBooking');
    const acceptTermsCheckbox = $('#acceptTerms');
    const statusMessage = $('#statusMessage');
    const logoutBtn = $('#logoutBtn');

    const authChoiceModal = $('#authChoiceModal');
    const signupModal = $('#signupModal');
    const signinModal = $('#signinModal');
    const termsModal = $('#termsModal');
    const successModal = $('#successModal');

    const signupForm = $('#signupForm');
    const signinForm = $('#signinForm');

    /* ===============================
       4. Realtime Schedule (RTDB)
    =============================== */
    dbRealtime.ref('default_schedule').on('value', snapshot => {
        const data = snapshot.val();
        if (!data || !data.bookingSchedule) return;

        const s = data.bookingSchedule;

        $('#schedWeekdays').text(s.Monday_to_Friday || '—');
        $('#schedSaturday').text(s.Saturday || '—');
        $('#schedSunday').text(s.Sunday || '—');

        if (data.bookingStatus === 'closed') {
            $('#bookingStatusText')
                .removeClass('badge-success')
                .addClass('badge-danger')
                .text('🚫 Booking Closed');

            mainBookingTriggerBtn.prop('disabled', true);
            statusMessage.html('<p class="text-danger">Booking is currently closed.</p>');
        } else {
            $('#bookingStatusText')
                .removeClass('badge-danger')
                .addClass('badge-success')
                .text('✅ Booking Open');

            mainBookingTriggerBtn.prop('disabled', false);
        }
    });

    /* ===============================
       5. Auth State (FIXED)
    =============================== */
    auth.onAuthStateChanged(user => {
        if (user) {
            userUID = user.uid;
            userEmail = user.email;
            userName = user.displayName || '';

            $('#emailAddress').val(userEmail);
            $('#fullName').val(userName);

            statusMessage.html(
                `<p class="text-success">✅ Signed in as <strong>${userEmail}</strong></p>`
            );

            initialBookingArea.hide();
            bookingFormDiv.show();
            logoutBtn.show();
        } else {
            userUID = null;
            userEmail = null;
            userName = null;

            bookingFormDiv.hide();
            initialBookingArea.show();
            logoutBtn.hide();
        }
    });

    /* ===============================
       6. Booking Button
    =============================== */
    mainBookingTriggerBtn.on('click', () => {
        if (!auth.currentUser) {
            authChoiceModal.modal('show');
        }
    });

    /* ===============================
       7. Sign In (Friendly Errors)
    =============================== */
    signinForm.on('submit', function (e) {
        e.preventDefault();

        const email = $('#signinEmail').val().trim();
        const password = $('#signinPassword').val().trim();
        const msg = $('#signinMessage');

        msg.text('');

        auth.signInWithEmailAndPassword(email, password)
            .then(() => {
                signinModal.modal('hide');
                authChoiceModal.modal('hide');
            })
            .catch(error => {
                let text = "Sign in failed.";
                if (error.code === "auth/user-not-found") text = "❌ Email not registered.";
                if (error.code === "auth/wrong-password") text = "❌ Wrong password.";
                if (error.code === "auth/invalid-email") text = "❌ Invalid email format.";
                if (error.code === "auth/too-many-requests") text = "⚠ Too many attempts.";

                msg.text(text);
            });
    });

    /* ===============================
       8. Sign Up
    =============================== */
    signupForm.on('submit', function (e) {
        e.preventDefault();

        auth.createUserWithEmailAndPassword(
            $('#signupEmail').val(),
            $('#signupPassword').val()
        )
        .then(() => {
            signupModal.modal('hide');
            authChoiceModal.modal('hide');
        })
        .catch(err => {
            $('#signupMessage').text(err.message);
        });
    });

    /* ===============================
       9. Logout
    =============================== */
    logoutBtn.on('click', () => {
        auth.signOut();
    });

    /* ===============================
       10. GCash Flow (STRICT)
    =============================== */
    $('#gcashAdvance').on('change', function () {
        if (this.checked) {
            $('#gcashModal').modal('show');
            submitBookingBtn.prop('disabled', true);
        } else {
            gcashConfirmed = false;
            $('#gcashProofWrapper').hide();
            submitBookingBtn.prop('disabled', false);
        }
    });

    $('#gcashDoneBtn').on('click', () => {
        gcashConfirmed = true;
        $('#gcashModal').modal('hide');
        $('#gcashProofWrapper').slideDown();
        submitBookingBtn.prop('disabled', false);
    });

    /* ===============================
       11. 📱 PH Mobile Validation
       Format: 09XXXXXXXXX
    =============================== */
    $('#contactNumber').on('input', function () {
        this.value = this.value.replace(/[^0-9]/g, '');

        if (this.value.length > 11) {
            this.value = this.value.slice(0, 11);
        }

        if (this.value.length >= 2 && !this.value.startsWith('09')) {
            this.value = '09';
        }
    });

    /* ===============================
       12. Submit Booking
    =============================== */
    submitBookingBtn.on('click', e => {
        e.preventDefault();

        const contact = $('#contactNumber').val();

        if (!/^09\d{9}$/.test(contact)) {
            alert('📱 Enter valid PH mobile number (09XXXXXXXXX)');
            return;
        }

        if ($('#gcashAdvance').is(':checked') && !gcashConfirmed) {
            $('#gcashProofError').removeClass('d-none');
            return;
        }

        termsModal.modal('show');
    });

    acceptTermsCheckbox.on('change', function () {
        confirmBookingBtn.prop('disabled', !this.checked);
    });

    confirmBookingBtn.on('click', () => {
        termsModal.modal('hide');

        const bookingData = {
            userUID,
            fullName: $('#fullName').val(),
            contactNumber: $('#contactNumber').val(),
            email: userEmail,
            headCount: parseInt($('#headCount').val()),
            visitDate: $('#visitDate').val(),
            tourGuide: $('#tourGuide').is(':checked'),
            cottage: $('#cottage').is(':checked'),
            gcashAdvance: $('#gcashAdvance').is(':checked'),
            status: "Pending",
            submittedAt: firebase.firestore.FieldValue.serverTimestamp()
        };

        Promise.all([
            dbFirestore.collection("touristBookings").add(bookingData),
            dbRealtime.ref("bookings_rtdb").push(bookingData)
        ]).then(() => {
            bookingFormDiv[0].reset();
            bookingFormDiv.hide();
            initialBookingArea.show();
            logoutBtn.show();

            statusMessage.html(
                `<p class="text-success">✅ Signed in as <strong>${userEmail}</strong></p>`
            );

            successModal.modal('show');
        });
    });

    /* ===============================
       13. Password Toggle
    =============================== */
    $('#toggleSigninPassword').on('click', function () {
        const i = $('#signinPassword');
        const icon = $(this).find('i');
        i.attr('type', i.attr('type') === 'password' ? 'text' : 'password');
        icon.toggleClass('fa-eye fa-eye-slash');
    });

    $('#toggleSignupPassword').on('click', function () {
        const i = $('#signupPassword');
        const icon = $(this).find('i');
        i.attr('type', i.attr('type') === 'password' ? 'text' : 'password');
        icon.toggleClass('fa-eye fa-eye-slash');
    });

});