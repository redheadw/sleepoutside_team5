import { getLocalStorage, setLocalStorage } from "./utils.mjs";

function getProductImage(product) {
  return product.Images?.PrimaryLarge || product.Image;
}

function getDiscountPercentage(product) {
  const price = Number(product.price ?? product.FinalPrice);
  const originalPrice = Number(
    product.originalPrice ?? product.OriginalPrice ?? product.SuggestedRetailPrice
  );

  if (
    !Number.isFinite(price) ||
    !Number.isFinite(originalPrice) ||
    originalPrice <= price
  ) {
    return 0;
  }

  return Math.round(((originalPrice - price) / originalPrice) * 100);
}

function formatCategory(category) {
  return category
    .split("-")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

export default class ProductDetails {
  constructor(productId, dataSource) {
    this.productId = productId;
    this.product = {};
    this.dataSource = dataSource;
    this.currentSlideIndex = 0;
    this.slideImages = [];
  }

  async init() {
    this.product = await this.dataSource.findProductById(this.productId);
    this.renderProductDetails();

    document
      .getElementById("addToCart")
      .addEventListener("click", this.addProductToCart.bind(this));
  }

  addProductToCart() {
    let cart = getLocalStorage("so-cart");
    if (!Array.isArray(cart)) cart = [];
    const productCategory = this.product.Category || this.dataSource.category;
    const item = cart.filter(
      (item) =>
        item.productId === this.product.Id && item.category === productCategory
    );
    if (item.length === 0) {
      cart.push({
        productId: this.product.Id,
        category: productCategory,
        count: 1
      });
    } else {
      item[0].count++;
    }
    setLocalStorage("so-cart", cart);
  }

  renderProductDetails() {
    const discountPercentage = getDiscountPercentage(this.product);

    document.getElementById("productBrand").textContent =
      this.product.Brand.Name;
    document.getElementById("productName").textContent =
      this.product.NameWithoutBrand;
    
    this.renderImageCarousel(this.product);

    document.getElementById("productPrice").textContent =
      `$${this.product.FinalPrice}`;
    document.getElementById("productColor").textContent =
      this.product.Colors[0].ColorName;
    document.getElementById("productDescription").innerHTML =
      this.product.DescriptionHtmlSimple;
    document.getElementById("productDiscountBadge").textContent =
      `${discountPercentage}% OFF`;
    document
      .getElementById("productDiscountBadge")
      .classList.toggle("hide", discountPercentage <= 0);

    document.getElementById("addToCart").dataset.id = this.product.Id;
    document.title = `Sleep Outside | ${formatCategory(this.product.Category || this.dataSource.category)} | ${this.product.Name}`;
  }

  renderImageCarousel(product) {
    const wrapper = document.querySelector(".product-detail__image-wrapper");
    const staticImg = document.getElementById("productImage");
    const hasExtraImages =
      product.Images?.ExtraImages && Array.isArray(product.Images.ExtraImages) && product.Images.ExtraImages.length > 0;

    const images = [product.Images.PrimaryLarge];
    if (hasExtraImages) {
      product.Images.ExtraImages.forEach(img => images.push(img.Src));
    }

    if (hasExtraImages) {
      wrapper.classList.add("carousel-wrapper");
      wrapper.classList.add("carousel-enabled");
      staticImg.style.display = "none";

      let carouselHTML = `
        <div class="image-carousel-container" id="carouselContainer">
          <div class="carousel-slides">
            <ul class="carousel-list">
              ${images.map((src, index) => `
                <li class="carousel-item ${index === 0 ? 'active' : ''}" data-index="${index}">
                  <img src="${src}" alt="View ${index + 1}">
                </li>
              `).join('')}
            </ul>
          </div>
          
          <button class="nav-btn nav-prev" id="prevBtn" aria-label="Previous slide">&lt;</button>
          <button class="nav-btn nav-next" id="nextBtn" aria-label="Next slide">&gt;</button>
        </div>
        
        <div class="thumbnail-strip" id="thumbnailStrip">
          ${images.map((src, index) => `
            <div class="thumbnail-item ${index === 0 ? 'active' : ''}" data-index="${index}">
              <img src="${src}" alt="Thumbnail ${index + 1}">
            </div>
          `).join('')}
        </div>
      `;

      wrapper.innerHTML = carouselHTML;

      this.initCarousel();
    } else {
      wrapper.classList.remove("carousel-wrapper", "carousel-enabled");
      staticImg.src = getProductImage(this.product);
      staticImg.alt = this.product.NameWithoutBrand;
      staticImg.style.display = "block";
    }
  }

  initCarousel() {
    this.slideImages = document.querySelectorAll("#carouselContainer .carousel-item");
    const thumbnails = document.querySelectorAll("#thumbnailStrip .thumbnail-item");
    const list = document.querySelector("#carouselContainer .carousel-list");
    const prevBtn = document.getElementById("prevBtn");
    const nextBtn = document.getElementById("nextBtn");
    
    this.currentSlideIndex = 0;
    this.updateCarousel(list, this.currentSlideIndex);
    this.updateThumbnails(thumbnails, this.currentSlideIndex);

    nextBtn.addEventListener("click", () => {
      this.currentSlideIndex = (this.currentSlideIndex + 1) % this.slideImages.length;
      this.updateCarousel(list, this.currentSlideIndex);
      this.updateThumbnails(thumbnails, this.currentSlideIndex);
    });

    prevBtn.addEventListener("click", () => {
      this.currentSlideIndex =
        this.currentSlideIndex === 0
          ? this.slideImages.length - 1
          : this.currentSlideIndex - 1;
      this.updateCarousel(list, this.currentSlideIndex);
      this.updateThumbnails(thumbnails, this.currentSlideIndex);
    });

    thumbnails.forEach((thumb) => {
      thumb.addEventListener("click", (e) => {
        const index = parseInt(e.target.closest(".thumbnail-item").dataset.index);
        this.currentSlideIndex = index;
        this.updateCarousel(list, index);
        this.updateThumbnails(thumbnails, index);
      });
    });
  }

  updateCarousel(list, index) {
    list.style.transform = `translateX(-${index * 100}%)`;
  }

  updateThumbnails(thumbnails, index) {
    thumbnails.forEach((thumb, i) => {
      if (i === index) thumb.classList.add("active");
      else thumb.classList.remove("active");
    });
  }
}
