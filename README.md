# Selected Publications

[Selected Publications](bc.edu/law-publications) is a JavaScript web application which presents, for each Boston College Law School faculty, a body of their publications. It was originally created as part of Boston College Law Library's migration from Bepress to Ubiquity (2022–2023), and was rewritten in 2024 to address certain shortcomings.

This application pulls CSV data from public Google Sheets maintained by the BC Law Library, then parses it using [Papa Parse](https://www.papaparse.com/) into JSON. The data is then displayed using [DataTables](https://datatables.net/). To filter works by faculty name, we use a custom search bar using the [jQuery UI Autocomplete widget](https://jqueryui.com/autocomplete/), and feed the input into a hidden DataTables search bar for the filtering functionality.

The CSS follows [BEM](https://css-tricks.com/bem-101/) conventions wherever possible.
