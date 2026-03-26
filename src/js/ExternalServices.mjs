const baseURL =
  import.meta.env.VITE_SERVER_URL || "https://wdd330-backend.onrender.com/";

async function convertToJson(res) {
  let jsonResponse;
  try {
    jsonResponse = await res.json();
  } catch (error) {
    const text = await res.text();
    throw { name: 'servicesError', message: { status: res.status, body: text } };
  }

  if (res.ok) {
    return jsonResponse;
  } else {
    throw { name: 'servicesError', message: jsonResponse };
  }
}

export default class ExternalServices {
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
