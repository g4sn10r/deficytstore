# DEFICYT — sklep internetowy

Wersja wizualna oparta na przesłanych referencjach: jasne, fakturowane tło papieru, surowa odręczna typografia i oszczędne akcenty czerwieni, błękitu, żółci i zieleni, mały logotyp, breadcrumb, szeroki pasek wydania, minimalistyczne karty produktów oraz osobna strona produktu z galerią po lewej i zakupem po prawej.

## Uruchomienie
W katalogu projektu:
```bash
python3 -m http.server 8080
```
Otwórz `http://localhost:8080`.

## Strony
- `index.html` — strona główna / listing trzech produktów.
- `product.html?product=cd-deficyt` — karta CD.
- `product.html?product=tee-sun` — karta koszulki Słońce i chmurki.
- `product.html?product=tee-structure` — karta koszulki Konstrukcja.

## Pliki
- `config.js` — ceny, produkty, rozmiary, domena i token Shopify oraz ID wariantów.
- `app.js` — listing, karta produktu, galeria, koszyk, localStorage i checkout Shopify.
- `styles.css` — cały wygląd.
- `assets/` — załączone obrazy w wymaganych ścieżkach.

## Shopify
W `config.js` ustaw `shopify.enabled: true`, domenę sklepu, publiczny Storefront API access token i wersję API. Uzupełnij `variantId` każdego produktu/wariantu pełnym GID, np. `gid://shopify/ProductVariant/12345678901234`.

Checkout używa mutacji Storefront API `cartCreate` i przekierowuje na `checkoutUrl`. Przy błędzie API aplikacja spróbuje przejść do standardowego koszyka Shopify `/cart/{variantId}:{qty}`. Jeśli Shopify jest wyłączone, strona pokazuje jawny komunikat trybu podglądu.

Storefront API access token jest publicznym tokenem przeznaczonym do użycia w przeglądarce i będzie widoczny dla użytkowników. Nie umieszczaj w kodzie przeglądarkowym tokenu Shopify Admin API, haseł ani innych sekretów. Ceny wyświetlane są konfigurowane lokalnie, a cena transakcji jest kontrolowana przez Shopify.

## Bezpieczeństwo wdrożenia
- Projekt jest statycznym frontendem: nie ma backendu, logowania ani autoryzacji administratora. Nie przechowuj sekretów ani nie dodawaj uwierzytelniania opartego na JavaScript po stronie przeglądarki.
- `.gitignore` wyklucza pliki `.env` i klucze prywatne. Nie dodawaj sekretów do `config.js`, HTML ani JavaScript; `.env` nie chroni wartości używanych przez frontend, bo musiałyby zostać opublikowane.
- Plik `_headers` zawiera CSP i podstawowe nagłówki bezpieczeństwa dla hostów statycznych obsługujących ten format (np. Netlify lub Cloudflare Pages). Jeśli hosting nie obsługuje `_headers`, skonfiguruj te nagłówki w jego panelu/konfiguracji; sprawdź, czy CSP pozwala na domenę Shopify faktycznie skonfigurowaną w `config.js`.


## Kierunek wizualny
Jasna, papierowa wersja inspirowana okładką: Rock Salt / Permanent Marker / Special Elite, kolorowe litery DEFICYT, drobne rysunkowe motywy i oszczędny, niepokojący układ.


## Układ strony głównej
Minimalistyczny układ: logo po lewej, ikony konta i koszyka po prawej oraz trzy produkty w równych kolumnach. Pod zdjęciem znajduje się nazwa produktu, krótki typ produktu i cena.


## Podstrony stopki
Dodano: platnosci.html, kontakt.html, dostawa.html, zwroty.html, regulamin.html i prywatnosc.html. Treści są przykładowymi szkicami; dane sprzedawcy, operatorów, warunki dostawy i dokumenty prawne trzeba uzupełnić przed publikacją.


## GIF na stronach produktów
Na każdej stronie produktu wyświetlana jest animacja z pliku `assets/kid-swing.gif`.
Aby podmienić animację, wgraj własny GIF do folderu `assets/` i nazwij go dokładnie `kid-swing.gif` (zastąp nim plik o tej nazwie, jeśli już istnieje). Nie trzeba zmieniać HTML ani CSS. Na desktopie animacja znajduje się z prawej strony opisu produktu, a na telefonie zmniejsza się i pozostaje widoczna obok tytułu/opisu.


### Pozycja animacji na stronie produktu
GIF znajduje się teraz przy lewej krawędzi galerii produktu, częściowo poza jej obszarem — jako luźna ilustracja z okładki, a nie element kolumny zakupu. Na telefonie układa się bezpiecznie pod zdjęciem produktu i nad miniaturami, aby pozostał widoczny i nie zasłaniał ceny ani przycisków.
