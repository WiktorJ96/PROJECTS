"PL"

Vault to aplikacja do zarządzania finansami osobistymi, zaprojektowana, aby pomóc użytkownikom w śledzeniu przychodów i wydatków.
Umożliwia łatwe dodawanie, edytowanie i usuwanie transakcji oraz zapewnia wizualizację danych finansowych w postaci wykresów.
Vault jest zbudowany jako Progressive Web App (PWA), co łączy w sobie zalety aplikacji webowych i natywnych, oferując szybkie działanie, możliwość instalacji na urządzeniach mobilnych i desktopowych oraz funkcjonalność offline.


Ogólna struktura i organizacja

1. Modułowość: Kod JavaScript jest dobrze zorganizowany w klasy (Main, TransactionManager, ChartManager, UIManager, ThemeManager, 
   PWAManager, DataBaseManager, IndexedDBManager, MongoDBManager, TranslationManager), 
   co sprzyja modułowości i ułatwia utrzymanie.
2. Separacja logiki: Rozdzielenie logiki biznesowej (TransactionManager) od interfejsu użytkownika (UIManager) i wizualizacji danych
   (ChartManager).
3. Struktura HTML: Prawidłowe użycie struktury HTML5 z semantycznymi tagami jak `<header>`, `<main>`, `<footer>`.

Jakość kodu

1. Spójność: Kod JavaScript jest spójny w stylu i formatowaniu, co ułatwia czytanie i utrzymanie.
2. Nazewnictwo: Nazwy zmiennych i funkcji są opisowe i zgodne z konwencją camelCase.
3. Czystość kodu: Metody JavaScript są krótkie i mają pojedyncze odpowiedzialności, zgodnie z zasadą Single Responsibility Principle.
4. Semantyka HTML: Odpowiednie użycie atrybutów ARIA i ról dla lepszej dostępności.

Funkcjonalność i bezpieczeństwo

1. Zarządzanie transakcjami: Implementacja dodawania, usuwania i edycji transakcji finansowych.
2. Wizualizacja danych: Wykorzystanie biblioteki Chart.js do tworzenia interaktywnych wykresów finansowych.
3. Persystencja danych: Wykorzystanie indexedDB do przechowywania danych użytkownika, gdy aplikacja działa w trybie offline, oraz   
   MongoDB, gdy jest połączona z serwerem lub uruchomiona w kontenerze Dockera.
4. Internacjonalizacja: Implementacja systemu tłumaczeń (polski i angielski) z myślą o globalnym zasięgu.
5. Responsywność: Zastosowanie Bootstrap 5 dla responsywnego interfejsu użytkownika.
6. Bezpieczeństwo: Implementacja Content Security Policy dla zwiększenia bezpieczeństwa aplikacji.

Zaawansowane funkcje

1. Dynamiczne wykresy: Interaktywne wykresy finansowe aktualizowane w czasie rzeczywistym.
2. Zarządzanie motywami: Możliwość przełączania między jasnym i ciemnym motywem aplikacji.
3. Progressive Web App (PWA): Aplikacja działa jako PWA, umożliwiając instalację na urządzeniach i działanie offline.
4. Responsywne wykresy: Dostosowywanie wykresów do różnych rozmiarów ekranów.

SEO i metadane

1. Optymalizacja SEO: Użycie odpowiednich metatagów, w tym description i keywords.
2. Schema.org: Zastosowanie strukturyzowanych danych schema.org dla lepszego indeksowania.
3. Canonical URL: Użycie tagu canonical dla uniknięcia duplikacji treści.

Wydajność i kompatybilność

1. Zewnętrzne zasoby: Linkowanie do zewnętrznych zasobów CSS i JavaScript z CDN dla poprawy wydajności.
2. Responsywność: Zastosowanie meta viewport i responsywnego designu dla dostosowania do urządzeń mobilnych.
3. Service Worker: Implementacja Service Worker dla obsługi funkcji offline i cachowania, co jest kluczowe dla PWA.
4. Docker: Aplikacja jest skonfigurowana do działania w kontenerze Dockera.

Dostępność

1. ARIA: Rozbudowane użycie atrybutów ARIA dla poprawy dostępności aplikacji.
2. Semantyczne HTML: Prawidłowe użycie znaczników HTML5 dla lepszej struktury i dostępności.
3. Etykiety formularzy: Poprawne użycie znaczników `<label>` dla pól formularza.



"EN"

Vault for personal finance management applications to help users with occurrences and expenses. 
the ability to add, edit and delete interactions and provides visualization of financial data in the form of charts. 
Vault is a solution as a Progressive Web App (PWA), which combines the advantages of web and native applications, 
Fast operation, ability to use mobile and desktop applications and offline functionality.

Overall structure and organization

1. Modularity: The JavaScript code is well organized into classes (TransactionManager, ChartManager, UIManager, ThemeManager, 
   PWAManager), 
   which favors modularity and facilitates maintenance.
2. Logic separation: Separation of business logic (TransactionManager) from user interface (UIManager) and data visualization 
   (ChartManager).
3. HTML structure: Correct use of HTML5 structure with semantic tags like `<header>`, `<main>`, `<footer>`.

Code quality

1. Consistency: JavaScript code is consistent in style and formatting, making it easier to read and maintain.
2. Naming: Variable and function names are descriptive and follow the camelCase convention.
3. Code cleanliness: JavaScript methods are short and have single responsibilities, in line with the Single Responsibility Principle.
4. HTML Semantics: Appropriate use of ARIA attributes and roles for better accessibility.

Functionality and safety

1. Transaction Management: Implementation of adding, deleting, and editing financial transactions.
2. Data visualization: Using the Chart.js library to create interactive financial charts.
3. Data persistence: Using indexedDB to store user data when offline and MongoDB when connected to a server or running in a Docker    
   container.
4. Internationalization: Implementation of a translation system (Polish and English) with global reach in mind.
5. Responsiveness: Use of Bootstrap 5 for a responsive user interface.
6. Security: Implementation of Content Security Policy to increase application security.

Advanced features

1. Dynamic Charts: Interactive financial charts updated in real time.
2. Theme Management: Ability to switch between light and dark app themes.
3. Progressive Web App (PWA): The application works as a PWA, allowing installation on devices and operation offline.
4. Responsive Charts: Adapt charts to different screen sizes.

SEO and metadata

1. SEO optimization: Using appropriate meta tags, including description and keywords.
2. Schema.org: Use schema.org structured data for better indexing.
3. Canonical URL: Use the canonical tag to avoid duplicate content.

Performance and compatibility

1. External Resources: Linking to external CSS and JavaScript resources from CDN for improved performance.
2. Responsiveness: Use of meta viewport and responsive design to adapt to mobile devices.
3. Service Worker: Implementation of Service Worker to support offline functions and caching, which is crucial for PWA.
4. Docker: The application is configured to run in a Docker container.

Availability

1. ARIA: Extensive use of ARIA attributes to improve application accessibility.
2. Semantic HTML: Proper use of HTML5 tags for better structure and accessibility.
3. Form labels: Correct use of `<label>` tags for form fields.