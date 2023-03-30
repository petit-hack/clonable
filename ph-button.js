// Fonction pour ajouter le loader à l'élément
function showLoader(element) {
  const buttonStyle = element.getAttribute("ph-button-style");
  const loader = document.createElement("div");
  loader.classList.add("loader");
  let animationHtml = "";

  switch (buttonStyle) {
    case "dots":
      animationHtml = `
        <span class="dot"></span>
        <span class="dot"></span>
        <span class="dot"></span>
      `;
      break;
    default:
      animationHtml = '<div class="spinner"></div>';
      break;
  }

  loader.innerHTML = animationHtml;
  element.appendChild(loader);
}
function toggleButtonState(button, state) {
  if (typeof state !== "undefined") {
    button.setAttribute("data-state", state);
    if (state === "disable" || state === "loading") {
      button.disabled = true;
      button.style.opacity = "0.5";
    } else if (state === "enable" || state === "idle") {
      button.disabled = false;
      button.style.opacity = "1";
    }
  } else {
    return button.getAttribute("data-state");
  }
}

function injectStyles() {
  if (document.getElementById("webflow-buttons-styles")) return;

  const styles = `
  [ph-button] {
    display: flex;
    justify-content: center;
    align-items: center;
    flex-direction: row;
    gap: 1rem; 
    --ph-button-weight: 4px;
  }
    .loader {
      position: relative;
      display: inline-flex;
      align-items: center;
      justify-content: center;
      font-size: inherit; 
    }
    .spinner {
      width: 1em;
      height: 1em;
      border: inherit;
      border-color: currentColor;
      border-radius: 50%;
      animation: spin 1s linear infinite;
    }
    .spinner {
      border-style: solid;
      border-width: var(--ph-button-weight, 4px);
      border-left-color: transparent;
    }
    .dot {
      display: inline-block;
      width: calc(var(--ph-button-weight, 4px) * 0.5);
      height: calc(var(--ph-button-weight, 4px) * 0.5);
      border-radius: 50%;
      background-color: currentColor;
      animation: dotBounce 1s infinite;
    }
    .dot:nth-child(2) {
      animation-delay: 0.2s;
    }
    .dot:nth-child(3) {
      animation-delay: 0.4s;
    }
    @keyframes spin {
      to {
        transform: rotate(360deg);
      }
    }
    @keyframes dotBounce {
      0%, 80%, 100% {
        transform: translateY(0);
      }
      40% {
        transform: translateY(-0.5em);
      }
    }
  `;

  const styleElement = document.createElement("style");
  styleElement.id = "webflow-buttons-styles";
  styleElement.innerHTML = styles;
  document.head.appendChild(styleElement);
}

// Fonction pour supprimer le loader de l'élément
function hideLoader(element) {
  const loader = element.querySelector(".loader");
  if (loader) {
    element.removeChild(loader);
  }
}

// Fonction pour initialiser la librairie
function initWebflowButtons() {
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
  function init() {
    injectStyles();
    const buttons = document.querySelectorAll("[ph-button]");

    buttons.forEach((button) => {
      button.addEventListener("click", (event) => {
        event.preventDefault();

        // Vérifiez si le bouton est déjà en état "loading" et retournez si c'est le cas.
        if (toggleButtonState(button) === "loading") {
          return;
        }

        // Récupérer la valeur de l'attribut ph-button-weight
        const buttonWeight = button.getAttribute("ph-button-weight");

        // Appliquer la valeur de l'attribut ph-button-weight comme variable CSS si elle existe
        if (buttonWeight) {
          button.style.setProperty("--ph-button-weight", buttonWeight);
        }

        showLoader(button);
        toggleButtonState(button, "loading");

        // Lire la valeur de l'attribut ph-button et convertir en nombre
        const timeoutValue = parseInt(button.getAttribute("ph-button"), 10);
        const timeoutDuration = isNaN(timeoutValue) ? 2000 : timeoutValue;

        setTimeout(() => {
          // Soumettre le formulaire Webflow si l'élément ph-button est dans un élément <form>
          const form = button.closest("form");
          if (form) {
            const submitEvent = new Event("submit", {
              bubbles: true,
              cancelable: true
            });
            form.dispatchEvent(submitEvent);
          }

          // Rediriger vers l'URL spécifiée dans l'attribut href si l'élément ph-button est un lien <a>
          let redirect = false;
          if (button.tagName === "A") {
            const href = button.getAttribute("href");
            if (href && href !== "#") {
              redirect = true;
              window.location.href = href;
            }
          }

          // Masquer le spinner seulement si l'élément ph-button n'est pas un lien <a> avec un attribut href valide
          if (!redirect) {
            hideLoader(button);
            toggleButtonState(button, "idle");
          }
        }, timeoutDuration); // Utiliser la durée définie par l'attribut ph-button ou la valeur par défaut
      });
    });
  }
}

const WebflowButtons = {
  init: initWebflowButtons,
  showLoader: showLoader,
  hideLoader: hideLoader,
  toggleButtonState: toggleButtonState
};

// Utilisation
WebflowButtons.init();
window.WebflowButtons = WebflowButtons;
