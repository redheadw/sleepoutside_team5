// wrapper for querySelector...returns matching element
export function qs(selector, parent = document) {
  return parent.querySelector(selector);
}

// retrieve data from localstorage
export function getLocalStorage(key) {
  try {
    const data = localStorage.getItem(key);
    return data ? JSON.parse(data) : [];
  } catch (error) {
    return [];
  }
}

// save data to local storage
export function setLocalStorage(key, data) {
  localStorage.setItem(key, JSON.stringify(data));
}

// set a listener for both touchend and click
export function setClick(selector, callback) {
  qs(selector).addEventListener("touchend", (event) => {
    event.preventDefault();
    callback();
  });
  qs(selector).addEventListener("click", callback);
}

export function getParam(param) {
  const queryString = window.location.search;
  const urlParams = new URLSearchParams(queryString);
  return urlParams.get(param);
}

export function renderListWithTemplate(
  templateFn,
  parentElement,
  list,
  position = "afterbegin",
  clear = false
) {
  if (clear) {
    parentElement.innerHTML = "";
  }

  const htmlStrings = list.map(templateFn);
  parentElement.insertAdjacentHTML(position, htmlStrings.join(""));
}

// single template
export function renderWithTemplate(template, parentElement, data, callback) {
  const fragment = document.createRange().createContextualFragment(template);
  parentElement.replaceChildren(fragment);

  if (callback) {
    callback(data);
  }
}

// fetch template file
export async function loadTemplate(path) {
  const response = await fetch(path);
  if (!response.ok) {
    throw new Error(`Failed to load template: ${path} (${response.status})`);
  }
  return await response.text();
}

export async function loadHeaderFooter() {
  try {
    const headerTemplate = await loadTemplate("/partials/header.html");
    const footerTemplate = await loadTemplate("/partials/footer.html");

    const headerElement = document.querySelector("#main-header");
    const footerElement = document.querySelector("#main-footer");

    if (headerElement) {
      renderWithTemplate(headerTemplate, headerElement);
    }

    if (footerElement) {
      renderWithTemplate(footerTemplate, footerElement);
    }
  } catch (error) {
    console.error("Header/footer load failed:", error);
  }
}