export interface Product {
  id: number;
  title: string;
  price: number;
  thumbnail: string;
  stock: number;
}

export interface ProductsResponse {
  products: Product[];
  total: number;
  skip: number;
  limit: number;
}

interface GetProductsParams {
  search?: string;
  page?: number;
  limit?: number;
}

const BASE_URL = "https://dummyjson.com/products";
const DEFAULT_LIMIT = 12;
const REQUEST_TIMEOUT = 8000; // 8 seconds

async function fetchWithTimeout(
  url: string,
  options: RequestInit,
  timeout = REQUEST_TIMEOUT
) {
  const controller = new AbortController();
  const id = setTimeout(() => controller.abort(), timeout);

  try {
    const response = await fetch(url, {
      ...options,
      signal: controller.signal,
    });

    return response;
  } finally {
    clearTimeout(id);
  }
}


export async function getProducts({
  search = "",
  page = 1,
  limit = DEFAULT_LIMIT,
}: GetProductsParams = {}): Promise<ProductsResponse> {
  const safePage = Math.max(1, page);
  const safeLimit = Math.max(1, limit);
  const skip = (safePage - 1) * safeLimit;

  const queryParams = new URLSearchParams({
    limit: String(safeLimit),
    skip: String(skip),
  });

  let url = BASE_URL;

  if (search.trim()) {
    url = `${BASE_URL}/search?q=${encodeURIComponent(search.trim())}&${queryParams.toString()}`;
  } else {
    url = `${BASE_URL}?${queryParams.toString()}`;
  }

  let response: Response;

  try {
    response = await fetchWithTimeout(url, {
      cache: "no-store",
    });
  } catch (error: any) {
    if (error.name === "AbortError") {
      throw new Error("Request timed out. Please try again.");
    }

    throw new Error("Network error. Please check your connection.");
  }

  if (!response.ok) {
    throw new Error(
      `API Error: ${response.status} ${response.statusText}`
    );
  }

  const data = await response.json();

  return {
    products: Array.isArray(data.products) ? data.products : [],
    total: typeof data.total === "number" ? data.total : 0,
    skip: typeof data.skip === "number" ? data.skip : 0,
    limit: typeof data.limit === "number" ? data.limit : safeLimit,
  };
}