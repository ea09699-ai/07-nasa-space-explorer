
// NASA API
const API_KEY = "DEMO_KEY";
const API_URL = "https://api.nasa.gov/planetary/apod";

// Page elements
const startInput = document.getElementById("startDate");
const endInput = document.getElementById("endDate");
const getImagesButton = document.getElementById("getImages");
const gallery = document.getElementById("gallery");
const loading = document.getElementById("loading");

const modal = document.getElementById("imageModal");
const modalDetails = document.getElementById("modalDetails");
const closeModal = document.getElementById("closeModal");

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
  const randomIndex = Math.floor(Math.random() * spaceFacts.length);

  document.getElementById("factText").textContent =
    spaceFacts[randomIndex];
}

// Fetch NASA APOD data
async function getSpaceImages() {
  const startDate = startInput.value;
  const endDate = endInput.value;

  if (!startDate || !endDate) {
    alert("Please select both dates.");
    return;
  }

  // Make sure the dates are in the correct order
  const start = new Date(startDate + "T00:00:00Z");
  const end = new Date(endDate + "T00:00:00Z");

  const difference = Math.round(
    (end - start) / (1000 * 60 * 60 * 24)
  );

  if (difference !== 8) {
    alert("Please select exactly 9 consecutive days.");
    return;
  }

  // Show loading message
  loading.hidden = false;
  gallery.innerHTML = "";

  getImagesButton.disabled = true;

  try {
    const url = `${API_URL}?api_key=${API_KEY}&start_date=${startDate}&end_date=${endDate}`;

    const response = await fetch(url);

    if (!response.ok) {
      throw new Error("NASA API request failed.");
    }

    const data = await response.json();

    if (!Array.isArray(data) || data.length !== 9) {
      throw new Error("NASA did not return all 9 entries.");
    }

    // Sort entries by date
    data.sort((a, b) => a.date.localeCompare(b.date));

    displayGallery(data);

  } catch (error) {
    console.error("Error fetching NASA images:", error);

    gallery.innerHTML = `
      <div class="placeholder">
        <p>Unable to load space photos. Please try again.</p>
      </div>
    `;

  } finally {
    loading.hidden = true;
    getImagesButton.disabled = false;
  }
}

// Create the gallery
function displayGallery(images) {
  gallery.innerHTML = "";

  images.forEach((item) => {
    const card = document.createElement("div");
    card.className = "gallery-item";

    const title = document.createElement("h3");
    title.textContent = item.title;

    const date = document.createElement("p");
    date.textContent = item.date;

    if (item.media_type === "image") {
      const image = document.createElement("img");

      image.src = item.url;
      image.alt = item.title;
      image.loading = "lazy";

      card.appendChild(image);

    } else if (item.media_type === "video") {
      const videoPreview = document.createElement("div");

      videoPreview.className = "video-preview";
      videoPreview.textContent = "▶ Video Entry";

      card.appendChild(videoPreview);
    }

    card.appendChild(title);
    card.appendChild(date);

    card.addEventListener("click", () => {
      openModal(item);
    });

    gallery.appendChild(card);
  });
}

// Open modal
function openModal(item) {
  modalDetails.innerHTML = "";

  const title = document.createElement("h2");
  title.textContent = item.title;

  const date = document.createElement("p");
  date.textContent = item.date;

  const explanation = document.createElement("p");
  explanation.textContent = item.explanation;

  modalDetails.appendChild(title);
  modalDetails.appendChild(date);

  if (item.media_type === "image") {
    const image = document.createElement("img");

    image.src = item.hdurl || item.url;
    image.alt = item.title;

    modalDetails.appendChild(image);

  } else if (item.media_type === "video") {
    const videoMessage = document.createElement("p");
    videoMessage.textContent =
      "This Astronomy Picture of the Day is a video.";

    const videoLink = document.createElement("a");
    videoLink.href = item.url;
    videoLink.textContent = "Watch NASA's Video";
    videoLink.target = "_blank";
    videoLink.rel = "noopener noreferrer";
    videoLink.className = "video-link";

    modalDetails.appendChild(videoMessage);
    modalDetails.appendChild(videoLink);
  }

  modalDetails.appendChild(explanation);

  modal.style.display = "block";
  modal.setAttribute("aria-hidden", "false");
}

// Close modal
function hideModal() {
  modal.style.display = "none";
  modal.setAttribute("aria-hidden", "true");
}

closeModal.addEventListener("click", hideModal);

modal.addEventListener("click", (event) => {
  if (event.target === modal) {
    hideModal();
  }
});

// Close modal with Escape key
document.addEventListener("keydown", (event) => {
  if (event.key === "Escape") {
    hideModal();
  }
});

// Button event
getImagesButton.addEventListener("click", getSpaceImages);

// Display a random fact when the app loads
displayRandomFact();
