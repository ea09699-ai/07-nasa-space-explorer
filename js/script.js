// NASA Space Explorer
// Uses NASA's current APOD API

const API_KEY = "DEMO_KEY";
const API_URL = "https://science.nasa.gov/wp-json/wp/v2/apod-basic/";

// Page elements
const startInput = document.getElementById("startDate");
const endInput = document.getElementById("endDate");
const getImagesButton = document.getElementById("getImages");
const gallery = document.getElementById("gallery");
const loading = document.getElementById("loading");

const modal = document.getElementById("imageModal");
const modalDetails = document.getElementById("modalDetails");
const closeModalButton = document.getElementById("closeModal");
const factText = document.getElementById("factText");

// Check required HTML elements
if (!startInput || !endInput || !getImagesButton || !gallery) {
  throw new Error("A required HTML element is missing. Check your element IDs.");
}

// Set up date inputs
if (typeof setupDateInputs === "function") {
  setupDateInputs(startInput, endInput);
} else {
  console.warn("dateRange.js was not loaded.");
}

// Random space facts
const spaceFacts = [
  "A day on Venus is longer than its year.",
  "Neutron stars can spin hundreds of times per second.",
  "Jupiter has the largest planetary magnetosphere in our solar system.",
  "The Sun contains more than 99% of the solar system's mass.",
  "Saturn's rings are mostly made of ice and rock.",
  "There are billions of galaxies in the observable universe.",
  "Light from the Sun takes about 8 minutes to reach Earth.",
  "Footprints left on the Moon can remain for millions of years."
];

// Display a random space fact
function displayRandomFact() {
  if (!factText) return;

  const randomIndex = Math.floor(Math.random() * spaceFacts.length);
  factText.textContent = spaceFacts[randomIndex];
}

// Calculate the number of days between dates
function daysBetween(startDate, endDate) {
  const start = new Date(startDate + "T00:00:00Z");
  const end = new Date(endDate + "T00:00:00Z");

  return Math.round((end - start) / 86400000);
}

// Fetch NASA images
async function getSpaceImages() {
  const startDate = startInput.value;
  const endDate = endInput.value;

  if (!startDate || !endDate) {
    alert("Please select both dates.");
    return;
  }

  const difference = daysBetween(startDate, endDate);

  if (difference !== 8) {
    alert("Please select exactly 9 consecutive days.");
    return;
  }

  if (loading) loading.hidden = false;

  gallery.innerHTML = "<p>Loading NASA space images...</p>";
  getImagesButton.disabled = true;

  try {
    const params = new URLSearchParams({
      api_key: API_KEY,
      start_date: startDate,
      end_date: endDate
    });

    const response = await fetch(API_URL + "?" + params.toString());

    if (!response.ok) {
      throw new Error("NASA API error: " + response.status);
    }

    const responseData = await response.json();

    const images = Array.isArray(responseData)
      ? responseData
      : [responseData];

    if (images.length !== 9) {
      throw new Error("NASA did not return all 9 entries.");
    }

    images.sort((a, b) => a.date.localeCompare(b.date));

    displayGallery(images);

  } catch (error) {
    console.error("NASA API error:", error);

    gallery.innerHTML = `
      <div class="placeholder">
        <p>Unable to load NASA space images.</p>
        <p>${error.message}</p>
        <p>Please try again later.</p>
      </div>
    `;

  } finally {
    if (loading) loading.hidden = true;
    getImagesButton.disabled = false;
  }
}

// Create gallery cards
function displayGallery(images) {
  gallery.innerHTML = "";

  images.forEach((item) => {
    const card = document.createElement("article");
    card.className = "gallery-item";

    const imageUrl = item.hdurl;

    if (item.media_type === "image" && imageUrl) {
      const image = document.createElement("img");

      image.src = imageUrl;
      image.alt = item.title || "NASA space photograph";
      image.loading = "lazy";

      image.onerror = () => {
        image.replaceWith(
          createPreview("Image could not be displayed")
        );
      };

      card.appendChild(image);

    } else if (
      item.media_type === "video" ||
      item.media_type === "iframe"
    ) {
      card.appendChild(
        createPreview("▶ Video / Interactive Entry")
      );

    } else {
      card.appendChild(
        createPreview("Image preview unavailable")
      );
    }

    const title = document.createElement("h3");
    title.textContent = item.title || "Untitled Space Entry";

    const date = document.createElement("p");
    date.textContent = item.date || "";

    card.appendChild(title);
    card.appendChild(date);

    card.addEventListener("click", () => {
      openModal(item);
    });

    gallery.appendChild(card);
  });
}

// Create preview messages
function createPreview(message) {
  const preview = document.createElement("div");

  preview.className = "video-preview";
  preview.textContent = message;

  return preview;
}

// Open image details
function openModal(item) {
  if (!modal || !modalDetails) {
    if (item.permalink || item.url) {
      window.open(
        item.permalink || item.url,
        "_blank",
        "noopener,noreferrer"
      );
    }
    return;
  }

  modalDetails.innerHTML = "";

  const title = document.createElement("h2");
  title.textContent = item.title || "Untitled Space Entry";

  const date = document.createElement("p");
  date.textContent = item.date || "";

  modalDetails.appendChild(title);
  modalDetails.appendChild(date);

  if (item.media_type === "image" && item.hdurl) {
    const image = document.createElement("img");

    image.src = item.hdurl;
    image.alt = item.title || "NASA space photograph";

    modalDetails.appendChild(image);

  } else {
    const message = document.createElement("p");

    message.textContent =
      "This APOD entry is a video or interactive item.";

    modalDetails.appendChild(message);
  }

  const explanation = document.createElement("p");
  explanation.textContent =
    item.explanation || "No explanation is available.";

  modalDetails.appendChild(explanation);

  const articleUrl = item.permalink || item.url;

  if (articleUrl) {
    const link = document.createElement("a");

    link.href = articleUrl;
    link.textContent = "View this entry on NASA";
    link.target = "_blank";
    link.rel = "noopener noreferrer";
    link.className = "video-link";

    modalDetails.appendChild(link);
  }

  modal.style.display = "block";
  modal.setAttribute("aria-hidden", "false");
}

// Close modal
function hideModal() {
  if (!modal) return;

  modal.style.display = "none";
  modal.setAttribute("aria-hidden", "true");
}

if (closeModalButton) {
  closeModalButton.addEventListener("click", hideModal);
}

if (modal) {
  modal.addEventListener("click", (event) => {
    if (event.target === modal) {
      hideModal();
    }
  });
}

// Close modal with Escape key
document.addEventListener("keydown", (event) => {
  if (event.key === "Escape") {
    hideModal();
  }
});

// Get images button
getImagesButton.addEventListener("click", getSpaceImages);

// Display random space fact
displayRandomFact();