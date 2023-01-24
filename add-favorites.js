(async () => {
  const { carts } = await getOrdersAndCarts();
  let cart;
  if (carts.length === 1) {
    cart = carts[0];
  }
  if (carts.length == 0) {
    console.log("no cart found, creating");
    cart = await createCart();
  }
  if (carts.length > 1) {
    alert(`${carts.length} carts found, using first`);
    cart = carts[0];
  }
  console.log("cart", cart);

  const favorites = await getFavorites();

  console.log("favorites", favorites);

  for (const favorite of favorites) {
    console.log("favorite", favorite);
    const product = await getProduct(favorite.itemNo);
    console.log("product", product);

    if (!product) {
      console.log("invalid product, skipping");
    } else {
      await addProduct(cart.id, product);

      console.log("added product to cart", product);
    }
  }
  console.log("done!");
})();

function getFavorites() {
  return get("https://www.citygross.se/api/v1/favorites");
}

function addProduct(cartId, product) {
  const payload = {
    items: [
      {
        gtin: product.gtin,
        itemNo: product.id,
        quantity: {
          value: 1,
          unit: "Piece",
          originalUnit: "Piece",
        },
        netContent: product.netContent,
        name: product.name,
      },
    ],
  };
  return post(`https://www.citygross.se/carts/${cartId}/additems`, {
    body: JSON.stringify(payload),
  });
}

function getProduct(id) {
  return get(`https://www.citygross.se/api/v1/esales/pdp/${id}/product`).then(
    (products) => products[0]
  );
}

function getOrdersAndCarts() {
  return get(
    // TODO
    "https://www.citygross.se/orders?afterDeliveryDate=2022-12-07T00%3A00%3A00"
  );
}

function getCart(id) {
  return get(`https://www.citygross.se/carts/${id}`);
}

function createCart() {
  return post("https://www.citygross.se/carts", {
    body: '{"storeNumber":3215}',
  });
}

function get(url, props) {
  return doRequest(url, {
    method: "GET",
    ...props,
  });
}

function post(url, props) {
  return doRequest(url, {
    method: "POST",
    ...props,
  });
}

function doRequest(url, props = {}) {
  const bearer = getAuthToken();

  return fetch(url, {
    headers: {
      accept: "application/json",
      "accept-language": "en-GB,en-US;q=0.9,en;q=0.8,nl;q=0.7,sv;q=0.6",
      authorization: `Bearer ${bearer}`,
      "cache-control": "no-store",
      "content-type": "application/json",
      "if-modified-since": "Mon, 26 Jul 1997 05:00:00 GMT",
      pragma: "no-cache",
      "sec-ch-ua":
        '"Not?A_Brand";v="8", "Chromium";v="108", "Google Chrome";v="108"',
      "sec-ch-ua-mobile": "?0",
      "sec-ch-ua-platform": '"macOS"',
      "sec-fetch-dest": "empty",
      "sec-fetch-mode": "cors",
      "sec-fetch-site": "same-origin",
    },
    referrer: "https://www.citygross.se/",
    referrerPolicy: "strict-origin-when-cross-origin",
    body: null,
    method: "GET",
    mode: "cors",
    credentials: "include",
    ...props,
  }).then((res) => res.json());
}

function getAuthToken() {
  return JSON.parse(
    decodeURIComponent(
      document.cookie
        .split(";")
        .map((c) => c.trim())
        .find((cookie) => cookie.trim().startsWith("cg_reloaded"))
        .split("=")
        .pop()
    )
  ).access_token;
}
