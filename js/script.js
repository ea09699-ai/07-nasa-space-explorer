// NASA Space Explorer
const API_KEY = "9mhkgk6M8JM6Hbz77MjwnwzTccHMtf7KtM9fmt9H";
const API_URL = "https://science.nasa.gov/wp-json/wp/v2/apod-basic";


const startInput = document.getElementById("startDate");
const endInput = document.getElementById("endDate");
const getImagesButton = document.getElementById("getImages");
const gallery = document.getElementById("gallery");
const loading = document.getElementById("loading");

const modal = document.getElementById("imageModal");
const modalDetails = document.getElementById("modalDetails");
const closeModalButton = document.getElementById("closeModal");

const factText = document.getElementById("factText");

if (typeof setupDateInputs === "function") {
  setupDateInputs(startInput, endInput);
}

const spaceFacts = [
  "A day on Venus is longer than its year.",
  "Neutron stars can spin over 600 times per second.",
  "The Sun contains more than 99% of the solar system's mass.",
  "Footprints on the Moon can last millions of years.",
  "Jupiter's Great Red Spot is a giant storm larger than Earth.",
  "Light from the Sun takes about 8 minutes to reach Earth.",
  "There are billions of galaxies in the observable universe.",
  "Saturn's rings are mostly made of ice."
];

function showRandomFact() {
  const randomIndex = Math.floor(Math.random() * spaceFacts.length);
  factText.textContent = spaceFacts[randomIndex];
}

showRandomFact();

function dateDifference(startDate, endDate) {
  const start = new Date(startDate);
  const end = new Date(endDate);

  return Math.round(
    (end - start) / (1000 * 60 * 60 * 24)
  );
}

async function getSpaceImages() {
  const startDate = startInput.value;
  const endDate = endInput.value;

  if (!startDate || !endDate) {
    alert("Please select both dates.");
    return;
  }

  if (dateDifference(startDate, endDate) !== 8) {
    alert("Please select exactly 9 consecutive days.");
    return;
  }

  loading.hidden = false;
  gallery.innerHTML = "";
  getImagesButton.disabled = true;

  try {
    const params = new URLSearchParams({
      api_key: API_KEY,
      start_date: startDate,
      end_date: endDate
    });

    const response = await fetch(`${API_URL}?${params}`);

    if (!response.ok) {
      throw new Error("Unable to fetch NASA data.");
    }

    const data = await response.json();

    data.sort(
      (a, b) => new Date(b.date) - new Date(a.date)
    );

    displayGallery(data);

  } catch (error) {
    gallery.innerHTML = `
      <div class="placeholder">
        <p>Unable to load NASA images.</p>
        <p>${error.message}</p>
      </div>
    `;
  } finally {
    loading.hidden = true;
    getImagesButton.disabled = false;
  }
}

function displayGallery(images) {
  gallery.innerHTML = "";

  images.forEach(item => {
    const card = document.createElement("article");
    card.classList.add("gallery-item");

    if (item.media_type === "image") {
      const image = document.createElement("img");

      image.src = item.hdurl || item.url;
      image.alt = item.title;

      card.appendChild(image);

    } else {
      const videoPreview = document.createElement("div");

      videoPreview.className = "video-preview";
      videoPreview.innerHTML = "▶ NASA Video";

      card.appendChild(videoPreview);
    }

    const title = document.createElement("h3");
    title.textContent = item.title;

    const date = document.createElement("p");
    date.textContent = item.date;

    card.appendChild(title);
    card.appendChild(date);

    card.addEventListener("click", () => {
      openModal(item);
    });

    gallery.appendChild(card);
  });
}

function openModal(item) {
  modalDetails.innerHTML = "";

  const title = document.createElement("h2");
  title.textContent = item.title;

  const date = document.createElement("p");
  date.textContent = item.date;

  modalDetails.appendChild(title);
  modalDetails.appendChild(date);

  if (item.media_type === "image") {
    const image = document.createElement("img");

    image.src = item.hdurl || item.url;
    image.alt = item.title;

    modalDetails.appendChild(image);

  } else if (item.media_type === "video") {
    const iframe = document.createElement("iframe");

    iframe.src = item.url;
    iframe.width = "100%";
    iframe.height = "450";
    iframe.allowFullscreen = true;

    modalDetails.appendChild(iframe);
  }

  const explanation = document.createElement("div");
  explanation.innerHTML = item.explanation;

  modalDetails.appendChild(explanation);

  modal.style.display = "block";
  modal.setAttribute("aria-hidden", "false");
}

function closeModal() {
  modal.style.display = "none";
  modal.setAttribute("aria-hidden", "true");
}

closeModalButton.addEventListener("click", closeModal);

window.addEventListener("click", e => {
  if (e.target === modal) {
    closeModal();
  }
});

document.addEventListener("keydown", e => {
  if (e.key === "Escape") {
    closeModal();
  }
});

getImagesButton.addEventListener(
  "click",
  getSpaceImages
);