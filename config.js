/*
 * BIEDRA — DEFICYT
 * Edytuj produkty, ceny, rozmiary i dane Shopify wyłącznie tutaj.
 */
window.STORE_CONFIG = {
  currency: "PLN",
  shopify: {
    enabled: false,
    storeDomain: "", // np. "biedra.myshopify.com", bez https://
    storefrontAccessToken: "",
    apiVersion: "2026-10"
  },
  products: [
    {
      id: "cd-deficyt",
      kind: "cd",
      name: 'CD: BIEDRA - DEFICYT',
      price: 59.00,
      subtitle: "PREORDER",
      image: "./assets/cover.png",
      alt: "Okładka płyty BIEDRA - DEFICYT",
      variants: [{ id: "cd", label: "CD", variantId: "" }]
    },
    {
      id: "tee-sun",
      kind: "tee",
      name: "DEFICYT — SŁOŃCE I CHMURKI",
      price: 139.00,
      image: "./assets/tee-sun.jpg",
      alt: "Koszulka DEFICYT — Słońce i chmurki, przód i tył",
      variants: [
        { id: "S", label: "S", variantId: "" },
        { id: "M", label: "M", variantId: "" },
        { id: "L", label: "L", variantId: "" },
        { id: "XL", label: "XL", variantId: "" }
      ]
    },
    {
      id: "tee-structure",
      kind: "tee",
      name: "DEFICYT — KONSTRUKCJA",
      price: 139.00,
      image: "./assets/tee-structure.jpg",
      alt: "Koszulka DEFICYT — Konstrukcja, przód i tył",
      variants: [
        { id: "S", label: "S", variantId: "" },
        { id: "M", label: "M", variantId: "" },
        { id: "L", label: "L", variantId: "" },
        { id: "XL", label: "XL", variantId: "" }
      ]
    }
  ]
};
