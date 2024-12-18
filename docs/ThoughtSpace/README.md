"PL"

ThoughtSpace to wszechstronna aplikacja notatnikowa, oferująca zaawansowane funkcje takie jak filtracja notatek, wyszukiwarka oraz integracja z edytorem tekstowym Quill. Aplikacja umożliwia tworzenie, edytowanie oraz organizowanie notatek w prosty i efektywny sposób. Dodatkowo, notatki można zapisać w formacie .json zgodnie z konfiguracją opisaną poniżej.
Co istotne, ThoughtSpace został zaprojektowany jako Progresywna Aplikacja Internetowa (PWA). Ta funkcjonalność PWA pozwala użytkownikom na zainstalowanie aplikacji na swoich urządzeniach, zapewniając doświadczenie zbliżone do natywnych aplikacji. Jako PWA, ThoughtSpace oferuje takie korzyści jak dostęp offline, zwiększona wydajność oraz możliwość płynnej pracy na różnych urządzeniach. Ta cecha znacząco poprawia ogólne doświadczenie użytkownika, czyniąc aplikację bardziej dostępną i wygodną w codziennym użytkowaniu.

Instrukcja dla uruchomienia na serwerze:

1. Zmien sciezke pliku JS na src="ThoughtSpaceSERVER.js"
2. Jesli uzywales wczesniej wersji z zapisem notatek do IndexDB czyli src="ThoughtSpace.js" wyczysc cache przegladarki
3. W folderze ThoughtSpace zainstaluj pakiety za pomoca 'npm install express body-parser'
4. uruchom server za pomoca CMD wpisujac komende 'node server.js'
5. Notatki beda zapisywane w pliku notes.json

Ogólna struktura i organizacja

1. Modułowość: Kod JavaScript jest dobrze zorganizowany w klasy (NoteError, Note, NoteStorage, NoteApp), co sprzyja modułowości i 
   ułatwia utrzymanie.
2. Separacja logiki: Rozdzielenie logiki biznesowej (NoteStorage) od interfejsu użytkownika (NoteApp) w JavaScript.
3. Obsługa błędów: Implementacja własnej klasy NoteError do obsługi błędów w JavaScript.
4. Struktura HTML: Prawidłowe użycie struktury HTML5 z semantycznymi tagami jak <header>, <main>, <section>, <footer>.

Jakość kodu

1. Spójność: Kod JavaScript jest spójny w stylu i formatowaniu, co ułatwia czytanie i utrzymanie.
2. Nazewnictwo: Nazwy zmiennych i funkcji w JavaScript są opisowe i zgodne z konwencją camelCase.
3. Czystość kodu: Metody JavaScript są relatywnie krótkie i mają pojedyncze odpowiedzialności, zgodnie z zasadą
   Single Responsibility Principle.
4. Semantyka HTML: Odpowiednie użycie atrybutów ARIA i ról dla lepszej dostępności.
5. Asynchroniczność: Wykorzystanie async/await dla operacji asynchronicznych, co poprawia czytelność kodu.

Funkcjonalność i bezpieczeństwo

1. Walidacja danych wejściowych: Implementacja walidacji danych wejściowych w metodzie validateNoteInput().
2. Internacjonalizacja: Implementacja systemu tłumaczeń z myślą o globalnym zasięgu.
3. Responsywność: Kod UI zawiera obsługę zdarzeń, co sugeruje responsywny interfejs użytkownika.
4. Content Security Policy: Implementacja CSP w meta tagu HTML dla zwiększenia bezpieczeństwa strony.
5. Lokalne przechowywanie danych: Wykorzystanie IndexedDB do bezpiecznego przechowywania notatek lokalnie.

Zaawansowane funkcje

1. Edytor tekstu: Integracja z biblioteką Quill.js dla zaawansowanego formatowania tekstu.
2. PWA: Implementacja Service Worker'a dla wsparcia funkcji Progressive Web App.
3. Animacje: Wykorzystanie animacji SVG dla logo, poprawiające estetykę interfejsu.

SEO i metadane

1. Optymalizacja SEO: Użycie odpowiednich metatagów, w tym description i keywords.
2. Schema.org: Zastosowanie strukturyzowanych danych schema.org dla lepszego indeksowania.
3. Canonical URL: Użycie tagu canonical dla uniknięcia duplikacji treści.

Wydajność i kompatybilność

1. Zewnętrzne zasoby: Linkowanie do zewnętrznych zasobów CSS i JavaScript z CDN dla poprawy wydajności.
2. Normalizacja CSS: Użycie normalize.css dla spójności wyświetlania w różnych przeglądarkach.
3. Responsywność: Zastosowanie meta viewport dla dostosowania do urządzeń mobilnych.

Dostępność

1. ARIA: Rozbudowane użycie atrybutów ARIA dla poprawy dostępności aplikacji.
2. Semantyczne HTML: Prawidłowe użycie znaczników HTML5 dla lepszej struktury i dostępności.
3. Etykiety formularzy: Poprawne użycie znaczników <label> dla pól formularza.

"EN"

ThinkSpace is a versatile notebook application with advanced features such as note filtering, search engine and integration with the Quill text editor. The application allows you to create, edit and organize notes in a simple and effective way. Additional comments can be saved in .json as configured below.
Most importantly, ThinkSpace was the foundation as a Progressive Web Application (PWA). This PWA functionality allows users to install an application for use, with the ability to apply approximately to native applications. As a PWA, ThinkSpace offers benefits such as offline access, basic power, and the ability to work seamlessly across devices. This feature enhances the overall user experience by making it more accessible and convenient to use.

Instructions for running on the server:

1. Change the JS file path to src="ThoughtSpaceSERVER.js"
2. If you previously used the version with saving notes to IndexDB, i.e. src="ThoughtSpace.js", clear the browser cache
3. In the ThoughtSpace folder, install the packages with 'npm install express body-parser'
4. start the server using CMD by entering the command 'node server.js'
5. Notes will be saved in the notes.json file

General Structure and Organization

1. Modularity: JavaScript code is well-organized into classes (NoteError, Note, NoteStorage, NoteApp), promoting modularity and ease
   of maintenance.
2. Logic Separation: Separation of business logic (NoteStorage) from user interface (NoteApp) in JavaScript.
3. Error Handling: Implementation of a custom NoteError class for error handling in JavaScript.
4. HTML Structure: Proper use of HTML5 structure with semantic tags such as <header>, <main>, <section>, <footer>.

Code Quality

1. Consistency: JavaScript code is consistent in style and formatting, facilitating readability and maintenance.
2. Naming Conventions: Variable and function names in JavaScript are descriptive and follow camelCase convention.
3. Code Cleanliness: JavaScript methods are relatively short and have single responsibilities, adhering to the
   Single Responsibility Principle.
4. HTML Semantics: Appropriate use of ARIA attributes and roles for better accessibility.
5. Asynchronicity: Utilization of async/await for asynchronous operations, improving code readability.

Functionality and Security

1. Input Validation: Implementation of input data validation in the validateNoteInput() method.
2. Internationalization: Implementation of a translation system with global reach in mind.
3. Responsiveness: UI code includes event handling, suggesting a responsive user interface.
4. Content Security Policy: Implementation of CSP in HTML meta tag to enhance page security.
5. Local Data Storage: Use of IndexedDB for secure local storage of notes.

Advanced Features

1. Text Editor: Integration with Quill.js library for advanced text formatting.
2. PWA: Implementation of a Service Worker to support Progressive Web App functionality.
3. Animations: Use of SVG animations for the logo, enhancing interface aesthetics.

SEO and Metadata

1. SEO Optimization: Use of appropriate meta tags, including description and keywords.
2. Schema.org: Application of schema.org structured data for better indexing.
3. Canonical URL: Use of canonical tag to avoid content duplication.

Performance and Compatibility

1. External Resources: Linking to external CSS and JavaScript resources from CDN for improved performance.
2. CSS Normalization: Use of normalize.css for consistent display across different browsers.
3. Responsiveness: Application of meta viewport for adaptation to mobile devices.

Accessibility

1. ARIA: Extensive use of ARIA attributes to improve application accessibility.
2. Semantic HTML: Proper use of HTML5 tags for better structure and accessibility.
3. Form Labels: Correct use of <label> tags for form fields.
