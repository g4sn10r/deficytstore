(() => {
  "use strict";
  const config = window.STORE_CONFIG;
  if (!config || !Array.isArray(config.products)) return;

  const $ = (selector, root = document) => root.querySelector(selector);
  const $$ = (selector, root = document) => Array.from(root.querySelectorAll(selector));
  const money = value => new Intl.NumberFormat("pl-PL", {
    style: "currency", currency: config.currency || "PLN", minimumFractionDigits: 2
  }).format(Number(value) || 0);
  const productById = id => config.products.find(product => product.id === id);
  const productDescriptor = product => [
    product.kind === "tee" ? "KOSZULKA" : "PŁYTA CD",
    product.subtitle
  ].filter(Boolean).join(" · ");
  const params = new URLSearchParams(window.location.search);
  const page = document.body.dataset.page;
  const state = { selected: {}, quantity: 1, galleryIndex: 0 };
  const CART_KEY = "biedra-deficyt-cart-v2";

  function readCart() {
    try {
      const parsed = JSON.parse(localStorage.getItem(CART_KEY) || "[]");
      return Array.isArray(parsed) ? parsed.filter(line =>
        productById(line.productId) && Number.isSafeInteger(line.quantity) && line.quantity > 0 && line.quantity <= 99
      ) : [];
    } catch (_) { return []; }
  }
  let cart = readCart();
  function saveCart() {
    try { localStorage.setItem(CART_KEY, JSON.stringify(cart)); } catch (_) {}
  }
  function escapeHtml(value) {
    return String(value).replace(/[&<>"']/g, c => ({
      "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;"
    })[c]);
  }
  function variantFor(product, variantId) {
    return product.variants.find(variant => variant.id === variantId) || product.variants[0];
  }
  function showToast(message) {
    const toast = $(".toast");
    if (!toast) return;
    toast.textContent = message;
    toast.classList.add("show");
    clearTimeout(showToast.timer);
    showToast.timer = setTimeout(() => toast.classList.remove("show"), 2300);
  }
  function addLine(product, variantId, quantity = 1) {
    const variant = variantFor(product, variantId);
    const key = `${product.id}::${variant.id}`;
    const line = cart.find(item => item.key === key);
    if (line) line.quantity += quantity;
    else cart.push({ key, productId: product.id, variantId: variant.id, quantity });
    saveCart();
    renderCart();
    showToast("DODANO DO KOSZYKA");
  }

  // Homepage product listing
  function renderHome() {
    const target = $("#home-product-grid");
    if (!target) return;
    target.innerHTML = config.products.map(product => {
      const isTee = product.kind === "tee";
      const image = isTee
        ? `<div class="home-product-image is-tee"><img src="${escapeHtml(product.image)}" alt="${escapeHtml(product.alt)}"></div>`
        : `<div class="home-product-image is-cover"><img src="${escapeHtml(product.image)}" alt="${escapeHtml(product.alt)}"></div>`;
      return `<article class="home-product">
        <a class="home-product-link" href="./product.html?product=${encodeURIComponent(product.id)}" aria-label="Zobacz ${escapeHtml(product.name)}">
          ${image}
        <h3>${escapeHtml(product.name)}</h3>
        <p class="home-product-meta">${escapeHtml(productDescriptor(product))}</p>
          <p class="price">${money(product.price)}</p>
        </a>
      </article>`;
    }).join("");
  }

  // Product detail page: the tee mockups are supplied as front/back side-by-side.
  function renderProductDetail() {
    const product = productById(params.get("product")) || config.products[0];
    if (!product) return;
    document.title = `${product.name} — DEFICYT`;
    $("#product-breadcrumb").textContent = product.name;
    $("#detail-name").textContent = product.name;
    $("#detail-meta").textContent = productDescriptor(product);
    $("#detail-price").textContent = money(product.price);
    $("#detail-footnote").textContent = product.subtitle
      ? "PREORDER / Informacje o wysyłce zostaną podane przy finalizacji zamówienia."
      : "Wybierz wariant i dodaj produkt do koszyka.";

    const sizeOption = $("#size-option");
    const sizes = $("#detail-sizes");
    if (product.kind === "tee") {
      sizeOption.hidden = false;
      state.selected[product.id] = product.variants[0].id;
      sizes.innerHTML = product.variants.map(variant =>
        `<button class="detail-size" type="button" data-detail-size="${escapeHtml(variant.id)}" aria-pressed="${variant.id === state.selected[product.id]}">${escapeHtml(variant.label)}</button>`
      ).join("");
    } else {
      sizeOption.hidden = true;
      state.selected[product.id] = product.variants[0].id;
    }

    const gallery = $("#gallery-stage");
    const thumbs = $("#gallery-thumbs");
    if (product.kind === "tee") {
      const halves = [
        { label: "PRZÓD", pos: "left" },
        { label: "TYŁ", pos: "right" }
      ];
      function setTeeView(index) {
        state.galleryIndex = index;
        gallery.className = "gallery-stage tee-stage";
        gallery.innerHTML = `<img class="tee-view-image${index === 1 ? " tee-view-back" : ""}" src="${escapeHtml(product.image)}" alt="${escapeHtml(product.alt)}">`;
        thumbs.innerHTML = halves.map((item, i) =>
          `<button class="gallery-thumb" type="button" data-gallery-index="${i}" aria-label="Widok ${item.label}" aria-pressed="${i === index}"><img src="${escapeHtml(product.image)}" alt=""></button>`
        ).join("");
      }
      setTeeView(0);
      thumbs.addEventListener("click", event => {
        const button = event.target.closest("[data-gallery-index]");
        if (button) setTeeView(Number(button.dataset.galleryIndex));
      }, { once: true });
      // Rebind safely when switching between front/back repeatedly.
      thumbs.onclick = event => {
        const button = event.target.closest("[data-gallery-index]");
        if (button) setTeeView(Number(button.dataset.galleryIndex));
      };
      $(".gallery-prev").onclick = () => setTeeView(state.galleryIndex === 0 ? 1 : 0);
      $(".gallery-next").onclick = () => setTeeView(state.galleryIndex === 0 ? 1 : 0);
    } else {
      gallery.className = "gallery-stage cover-stage";
      gallery.innerHTML = `<img src="${escapeHtml(product.image)}" alt="${escapeHtml(product.alt)}">`;
      thumbs.innerHTML = `<button class="gallery-thumb" type="button" aria-pressed="true"><img src="${escapeHtml(product.image)}" alt=""></button>`;
      $(".gallery-prev").disabled = true;
      $(".gallery-next").disabled = true;
    }

    sizes.addEventListener("click", event => {
      const button = event.target.closest("[data-detail-size]");
      if (!button) return;
      state.selected[product.id] = button.dataset.detailSize;
      $$("[data-detail-size]", sizes).forEach(item =>
        item.setAttribute("aria-pressed", String(item === button))
      );
    });

    $("#qty-minus").addEventListener("click", () => {
      state.quantity = Math.max(1, state.quantity - 1);
      $("#detail-qty").textContent = `${state.quantity} szt.`;
    });
    $("#qty-plus").addEventListener("click", () => {
      state.quantity = Math.min(99, state.quantity + 1);
      $("#detail-qty").textContent = `${state.quantity} szt.`;
    });
    $("#detail-add").addEventListener("click", () => {
      addLine(product, state.selected[product.id], state.quantity);
      openCart();
    });
  }

  // Shared cart drawer on both pages.
  function renderCart() {
    const count = cart.reduce((sum, line) => sum + line.quantity, 0);
    $$(".cart-count").forEach(node => node.textContent = count);
    const linesNode = $(".cart-lines");
    if (!linesNode) return;
    const empty = $(".cart-empty");
    empty.hidden = cart.length > 0;
    linesNode.innerHTML = cart.map(line => {
      const product = productById(line.productId);
      const variant = variantFor(product, line.variantId);
      const variantText = product.kind === "tee" ? `ROZMIAR ${variant.label}` : "CD / PREORDER";
      return `<div class="cart-line">
        <div>
          <p class="cart-line-name">${escapeHtml(product.name)}</p>
          <p class="cart-line-meta">${escapeHtml(variantText)}</p>
          <div class="cart-line-actions">
            <button type="button" data-cart-qty="-1" data-key="${escapeHtml(line.key)}" aria-label="Zmniejsz ilość">−</button>
            <span>${line.quantity}</span>
            <button type="button" data-cart-qty="1" data-key="${escapeHtml(line.key)}" aria-label="Zwiększ ilość">+</button>
            <button class="remove-line" type="button" data-cart-remove="${escapeHtml(line.key)}">USUŃ</button>
          </div>
        </div>
        <p class="cart-line-price">${money(product.price * line.quantity)}</p>
      </div>`;
    }).join("");
    const total = cart.reduce((sum, line) => sum + productById(line.productId).price * line.quantity, 0);
    $(".cart-sum strong").textContent = money(total);
    $(".checkout-button").disabled = cart.length === 0;
    $(".checkout-note").textContent = config.shopify.enabled
      ? "Checkout Shopify aktywny — przejdziesz do bezpiecznej płatności sklepu."
      : "Tryb podglądu — zamówienia nie są jeszcze dostępne.";
  }

  function openCart() {
    $(".cart-drawer").classList.add("open");
    $(".cart-drawer").setAttribute("aria-hidden", "false");
    $(".cart-scrim").hidden = false;
    document.body.classList.add("cart-is-open");
  }
  function closeCart() {
    $(".cart-drawer").classList.remove("open");
    $(".cart-drawer").setAttribute("aria-hidden", "true");
    $(".cart-scrim").hidden = true;
    document.body.classList.remove("cart-is-open");
  }

  function shopifyReady() {
    return Boolean(config.shopify.enabled && config.shopify.storeDomain &&
      config.shopify.storefrontAccessToken && config.shopify.apiVersion);
  }
  function shopifyStoreUrl() {
    try {
      const domain = String(config.shopify.storeDomain || "").trim();
      const url = new URL(domain.includes("://") ? domain : `https://${domain}`);
      if (url.protocol !== "https:" || url.username || url.password || url.pathname !== "/" || url.search || url.hash) return null;
      if (!/^\d{4}-\d{2}$/.test(config.shopify.apiVersion || "")) return null;
      return url;
    } catch (_) { return null; }
  }
  function getVariantGid(line) {
    const product = productById(line.productId);
    return variantFor(product, line.variantId).variantId || "";
  }
  function fallbackCartUrl() {
    const storeUrl = shopifyStoreUrl();
    if (!storeUrl) return null;
    const parts = cart.map(line => {
      const match = getVariantGid(line).match(/(\d+)$/);
      return match ? `${match[1]}:${line.quantity}` : null;
    });
    return parts.every(Boolean) ? `${storeUrl.origin}/cart/${parts.join(",")}` : null;
  }
  async function checkout() {
    if (!cart.length) return;
    if (!shopifyReady()) {
      $(".checkout-note").textContent = "To jest tryb podglądu/testu. Ustaw shopify.enabled = true oraz dane Storefront API w config.js.";
      showToast("TRYB TESTOWY — CHECKOUT WYŁĄCZONY");
      return;
    }
    if (cart.some(line => !/^gid:\/\/shopify\/ProductVariant\/\d+$/.test(getVariantGid(line)))) {
      $(".checkout-note").textContent = "Brakuje ID wariantu Shopify dla jednej lub kilku pozycji. Uzupełnij variantId w config.js.";
      showToast("BRAKUJE ID WARIANTÓW SHOPIFY");
      return;
    }

    const button = $(".checkout-button");
    button.disabled = true;
    button.textContent = "ŁĄCZENIE Z SHOPIFY…";
    try {
      const storeUrl = shopifyStoreUrl();
      if (!storeUrl) throw new Error("Nieprawidłowa domena sklepu lub wersja API Shopify.");
      const endpoint = `${storeUrl.origin}/api/${config.shopify.apiVersion}/graphql.json`;
      const query = `mutation CartCreate($input: CartInput!) {
        cartCreate(input: $input) {
          cart { id checkoutUrl }
          userErrors { field message }
        }
      }`;
      const response = await fetch(endpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-Shopify-Storefront-Access-Token": config.shopify.storefrontAccessToken
        },
        body: JSON.stringify({
          query,
          variables: { input: { lines: cart.map(line => ({ merchandiseId: getVariantGid(line), quantity: line.quantity })) } }
        })
      });
      const payload = await response.json().catch(() => ({}));
      if (!response.ok || payload.errors?.length) throw new Error(payload.errors?.[0]?.message || `HTTP ${response.status}`);
      const result = payload.data?.cartCreate;
      if (result?.userErrors?.length) throw new Error(result.userErrors.map(error => error.message).join("; "));
      if (!result?.cart?.checkoutUrl) throw new Error("Brak checkoutUrl w odpowiedzi Shopify.");
      const checkoutUrl = new URL(result.cart.checkoutUrl);
      if (checkoutUrl.protocol !== "https:") throw new Error("Shopify zwróciło niebezpieczny adres checkoutu.");
      window.location.assign(checkoutUrl.href);
    } catch (error) {
      console.error(error);
      const fallback = fallbackCartUrl();
      if (fallback) {
        $(".checkout-note").textContent = "API nie odpowiedziało poprawnie — przekierowanie do koszyka sklepu.";
        window.location.assign(fallback);
      } else {
        button.disabled = false;
        button.innerHTML = 'PRZEJDŹ DO CHECKOUTU <b>↗</b>';
        $(".checkout-note").textContent = `Błąd Shopify: ${error.message}. Sprawdź domenę, token i ID wariantów.`;
      }
    }
  }

  $$(".cart-open").forEach(button => button.addEventListener("click", openCart));
  $$(".cart-close").forEach(button => button.addEventListener("click", closeCart));
  $(".cart-scrim").addEventListener("click", closeCart);
  $(".checkout-button").addEventListener("click", checkout);
  $(".cart-lines").addEventListener("click", event => {
    const qty = event.target.closest("[data-cart-qty]");
    const remove = event.target.closest("[data-cart-remove]");
    if (qty) {
      const line = cart.find(item => item.key === qty.dataset.key);
      if (line) {
        line.quantity += Number(qty.dataset.cartQty);
        if (line.quantity <= 0) cart.splice(cart.indexOf(line), 1);
      }
      saveCart(); renderCart();
    }
    if (remove) {
      const index = cart.findIndex(item => item.key === remove.dataset.cartRemove);
      if (index >= 0) cart.splice(index, 1);
      saveCart(); renderCart();
    }
  });
  document.addEventListener("keydown", event => {
    if (event.key === "Escape" && $(".cart-drawer").classList.contains("open")) closeCart();
  });

  if (page === "home") renderHome();
  if (page === "product") renderProductDetail();
  renderCart();
})();
