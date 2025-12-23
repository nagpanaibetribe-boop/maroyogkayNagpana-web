$(document).ready(function () {

  const container = $("#productsContainer");

  firebase.database().ref("products").on("value", function(snapshot) {
    container.html("");

    if (!snapshot.exists()) {
      container.html("<p class='text-center w-100'>No products found.</p>");
      return;
    }

    snapshot.forEach(function(child) {
      const p = child.val();

      container.append(`
        <div class="col-lg-4 col-md-6 col-sm-12 mb-4">
          <div class="project-wrap">
            
            <a class="img" style="background-image: url('${p.image}')">
              <span class="price">₱${p.price}</span>
            </a>

            <div class="text p-4">
              <span class="days">${p.category}</span>
              <h3>${p.name}</h3>
              <p class="location">
                <span class="fa fa-map-marker"></span> ${p.location}
              </p>
              <button class="btn btn-primary btn-sm see-more-btn"
                data-name="${p.name}"
                data-owner="${p.owner}"
                data-contact="${p.contact}"
                data-info="${p.info}">
                See More
              </button>
            </div>

          </div>
        </div>
      `);
    });
  });

  $(document).on("click", ".see-more-btn", function () {
    $("#modalTitle").text($(this).data("name"));
    $("#modalOwner").text("Owner: " + $(this).data("owner"));
    $("#modalContact").text("Contact: " + $(this).data("contact"));
    $("#modalInfo").text($(this).data("info"));
    $("#productModal").modal("show");
  });

});
