const baseURL =
  import.meta.env.VITE_SERVER_URL || "https://wdd330-backend.onrender.com/";

async function convertToJson(res) {
  const contentType = res.headers.get("content-type") || "";

  if (!res.ok) {
    throw new Error(`Bad Response: ${res.status}`);
  }

  if (!contentType.includes("application/json")) {
    const text = await res.text();
    throw new Error(
      `Expected JSON but received ${contentType || "unknown content type"}: ${text.slice(0, 80)}`
    );
  }

  return res.json();
}

export default class ProductData {
  constructor(category = "tents") {
    this.category = category;
    this.cachedData = {};
  }

  async getData(category = this.category) {
    if (!this.cachedData[category]) {
      const response = await fetch(`${baseURL}products/search/${category}`);
      const data = await convertToJson(response);
      this.cachedData[category] = data.Result;
    }
    return this.cachedData[category];
  }

  async findProductById(id, category = this.category) {
    const products = await this.getData(category);
    return products.find((item) => item.Id === id);
  }
}
