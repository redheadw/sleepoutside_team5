const baseURL =
  import.meta.env.VITE_SERVER_URL || "https://wdd330-backend.onrender.com/";

async function convertToJson(res) {
  const jsonResponse = await res.json();

  if (res.ok) {
    return jsonResponse;
  } else {
    throw {
      name: "servicesError",
      message: jsonResponse
    };
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

  async checkout(payload) {
    const response = await fetch(`${baseURL}checkout/`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(payload)
    });

    return convertToJson(response);
  }
}
