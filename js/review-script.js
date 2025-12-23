$(document).ready(function() {

    // --- 1. Firebase Configuration (Update with your project's details) ---
    const firebaseConfig = {
        apiKey: "AIzaSyDmkohQTE5Abuguruyfq0oRQAKoJBqPygs",
        authDomain: "nagpanatribe.firebaseapp.com",
        databaseURL: "https://nagpanatribe-default-rtdb.firebaseio.com",
        projectId: "nagpanatribe",
        storageBucket: "nagpanatribe.appspot.com",
        messagingSenderId: "445848527346",
        appId: "1:445848527346:web:2dfca68e4e7c74581d4b6b",
        measurementId: "G-GDT3SWJY6Q"
    };

    // Initialize Firebase
    if (!firebase.apps.length) {
        firebase.initializeApp(firebaseConfig);
    }

    const dbFirestore = firebase.firestore();
    const dbRealtime = firebase.database();

    // --- 2. Element References ---
    const reviewForm = $('#reviewForm');
    const reviewerNameInput = $('#reviewerName');
    const reviewTextInput = $('#reviewText');
    const reviewRatingInput = $('#reviewRating');
    const reviewMessageDiv = $('#reviewMessage');
    const submitReviewBtn = $('#submitReviewBtn');

    const thankYouModal = $('#thankYouModal');
    const closeThankYou = $('#closeThankYou');
    const okThankYouBtn = $('#okThankYouBtn');

    // --- 3. Ensure modal is hidden on page load ---
    thankYouModal.hide();

    // Optional: safety flag to prevent accidental double submission
    let reviewSubmitted = false;

    // --- 4. Review Submission Handler ---
    reviewForm.on('submit', function(e) {
        e.preventDefault();

        if (reviewSubmitted) return; // Prevent duplicate submissions

        // Basic validation (optional but recommended)
        const name = reviewerNameInput.val().trim();
        const text = reviewTextInput.val().trim();
        const rating = parseInt(reviewRatingInput.val());

        if (!name || !text || isNaN(rating) || rating < 1 || rating > 5) {
            reviewMessageDiv.html('<p class="text-danger">❌ Please fill in all fields with valid data.</p>');
            return;
        }

        reviewSubmitted = true; // mark as submitted
        submitReviewBtn.prop('disabled', true);
        reviewMessageDiv.html('<p class="text-warning">⏳ Submitting review...</p>');

        const reviewData = {
            reviewerName: name,
            reviewText: text,
            rating: rating,
            submissionDate: firebase.firestore.FieldValue.serverTimestamp(),
            status: 'Pending Approval'
        };

        const promises = [];

        // --- 4A. Store in Firestore ---
        promises.push(
            dbFirestore.collection("siteReviews").add(reviewData)
                .then(() => console.log("Firestore: Review saved successfully"))
                .catch(err => console.error("Firestore Error:", err))
        );

        // --- 4B. Store in Realtime Database ---
        promises.push(
            dbRealtime.ref("site_reviews_rtdb").push(reviewData)
                .then(() => console.log("RealtimeDB: Review saved successfully"))
                .catch(err => console.error("RealtimeDB Error:", err))
        );

        // --- 4C. Handle all promises ---
        Promise.all(promises)
            .then(() => {
                // Clear form and reset UI
                reviewForm[0].reset();
                reviewMessageDiv.html('');
                submitReviewBtn.prop('disabled', false);

                // Show Thank You modal
                thankYouModal.fadeIn();
            })
            .catch((error) => {
                reviewMessageDiv.html(`<p class="text-danger">❌ Submission failed. Details: ${error.message}</p>`);
                submitReviewBtn.prop('disabled', false);
                reviewSubmitted = false; // allow retry
            });
    });

    // --- 5. Thank You Modal Close ---
    function hideModal() {
        thankYouModal.fadeOut();
    }

    closeThankYou.on('click', hideModal);
    okThankYouBtn.on('click', hideModal);

    // --- 6. Optional: Hide modal on page reload/navigation ---
    $(window).on('beforeunload', function() {
        thankYouModal.hide();
    });

});