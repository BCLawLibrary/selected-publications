async function fetchCSVData(url) {
  try {
    const response = await fetch(url);
    if (!response.ok) throw new Error("Failed to fetch CSV");
    return Papa.parse(await response.text(), { header: true });
  } catch (error) {
    console.error(error);
    return { data: [] }; // Return empty data in case of error
  }
}

async function getWorkData(url) {
  const workData = await fetchCSVData(url);
  return workData.data.map(Object.values); // Flatten data to arrays
}

async function getFacultyData(url) {
  const facultyData = await fetchCSVData(url);
  const facultyNames = facultyData.data.map((row) => row.Name);
  const facultyHashes = facultyData.data.map((row) => row.Hash);
  return { facultyData, facultyNames, facultyHashes };
}

function formatCitation(rowData) {
  // Destructure rowData for clarity
  let [
    hash,
    doctype,
    priority,
    author,
    coauthors,
    partwork,
    wholework,
    publisher,
    vol,
    iss,
    fpage,
    lpage,
    year,
    url,
  ] = rowData;

  priority = Number(priority);
  const isStandAlone = priority === 7 || doctype === "book";

  // Helper functions for common patterns
  const formatTitle = () => {
    // Determine the base title
    let title = isStandAlone ? wholework : partwork;

    // Append volume info to title for standalone works
    if (isStandAlone) {
      if (vol) title += `, Vol. ${vol}`;
    }
    // Make title into link if URL is present
    if (url) {
      title = `<div class="work-title"><a href="${url}">${title}</a> <span class="fa-solid fa-square-arrow-up-right"></span></div>`;
    } else {
      title = `<div class="work-title">${title}</div>`;
    }
    return title;
  };

  const formatCoauthors = (coauthorString) => {
    if (!coauthorString) return "";
    const coauthorList = coauthorString.split(";").map((s) => s.trim());
    if (coauthorList.length === 1) {
      return `With ${coauthorList[0]}. `;
    } else {
      const lastCoauthor = coauthorList.pop();
      return lastCoauthor.endsWith(".")
        ? `With ${coauthorList.join(", ")} and ${lastCoauthor} `
        : `With ${coauthorList.join(", ")} and ${lastCoauthor}. `;
    }
  };

  const formatVolumeIssue = (vol, iss) => {
    // Suppress for standalone works (already added to Title)
    if (isStandAlone) return "";
    if (vol && iss) return `, vol. ${vol}, no. ${iss}`;
    if (vol) return `, vol. ${vol}`;
    if (iss) return `, no. ${iss}`;
    return "";
  };

  const formatPageInfo = (fpage, lpage) => {
    if (fpage && lpage) return `: ${fpage}–${lpage}`;
    if (fpage) return `: ${fpage}`;
    return "";
  };

  const formatPublisher = (publisher, doctype) => {
    if (!publisher) return "";
    return doctype === "bookchapter" ? `. ${publisher}` : ` ${publisher}`;
  };

  const formatYear = (year) => {
    return year ? ` (${year.replace("*", "")})` : "";
  };

  // Build citation components
  const coauthorInfo = formatCoauthors(coauthors);
  // Leave field empty ("") if standalone work
  let wholeworkInfo = isStandAlone ? "" : `<i>${wholework}</i>`;
  if (doctype === "bookchapter") wholeworkInfo = `In ${wholeworkInfo}`;
  const numberInfo = formatVolumeIssue(vol, iss);
  const pageInfo = formatPageInfo(fpage, lpage);
  const publisherInfo = formatPublisher(publisher, doctype);
  const yearInfo = formatYear(year);

  // Title information
  const titleInfo = formatTitle();

  // Combine all components into the citation
  let citation = `${coauthorInfo}${wholeworkInfo}${numberInfo}${pageInfo}${publisherInfo}${yearInfo}`;

  // Ensure citation ends with a period
  if (!citation.endsWith(".")) citation += ".";

  // Wrap in title info
  return `${titleInfo}<div>${citation}</div>`;
}

function formatCategory(str) {
  const titleCase = (str) => {
    return str.replace(
      /\w\S*/g,
      (text) => text.charAt(0).toUpperCase() + text.substring(1).toLowerCase()
    );
  };

  const categories = {
    bookreview: "Book Reviews",
    bookchapter: "Book Chapters",
    conference: "Presentations",
    testimony: "Congressional Testimonies",
    otherwork: "Symposia, Blog Posts, Media",
    video: "On Video",
  };

  return categories[str] || titleCase(str) + "s";
}

$(document).ready(function () {
  async function initializePage(url) {
    // Draw page with faculty info if hash belongs to faculty
    const hash = window.location.hash.replace("#", "");
    const { facultyData, facultyNames, facultyHashes } = await getFacultyData(
      url
    );
    if (facultyHashes.includes(hash)) {
      const currentFaculty = facultyData.data.find(
        (faculty) => faculty.Hash === hash
      );
      drawPage(currentFaculty);
    }

    return { facultyData, facultyNames, facultyHashes };
  }

  function initializeTable(data) {
    const custom_columns = [
      { title: "Hash", visible: false, searchable: false },
      { title: "DocType", visible: false, searchable: false },
      { title: "Priority", visible: false, searchable: false },
      { title: "Author", visible: false }, // Search only by author name
      { title: "Coauthors", visible: false, searchable: false },
      { title: "Partwork", visible: false, searchable: false },
      { title: "Wholework", visible: false, searchable: false },
      { title: "Publisher", visible: false, searchable: false },
      { title: "Volume", visible: false, searchable: false },
      { title: "Issue", visible: false, searchable: false },
      { title: "First Page", visible: false, searchable: false },
      { title: "Last Page", visible: false, searchable: false },
      { title: "Year", visible: false, searchable: false },
      { title: "Link", visible: false, searchable: false },
      { title: "CitationDisplay", searchable: false }, // Show only formatted citation
    ];

    for (let i in data) {
      data[i].push(formatCitation(data[i])); // Fill in CitationDisplay column
    }
    const table = new DataTable("#works-table", {
      dom: "ftr",
      autoWidth: false,
      pageLength: 999,
      data: data,
      columns: custom_columns,
      order: [
        [0, "asc"],
        [2, "asc"],
        [1, "asc"],
        [12, "desc"],
        [5, "asc"],
      ],
      language: { search: "", searchPlaceholder: "Faculty name..." },
      rowGroup: {
        dataSrc: 1,
        startRender: function (rows, group) {
          return formatCategory(group); // Capitalize and format group headers
        },
      },
      drawCallback: function () {}, // END drawCallback
    });

    return table;
  }

  function drawPage(currentFaculty) {
    const { Hash, Image, Name, Title, Profile, CV } = currentFaculty;

    window.location.hash = `#${Hash}`;
    /* DataTables native search bar is hidden through CSS 
    but we use it for search functionality */
    $("#dt-search-0").val(Name).trigger("input");
    $(".faculty-info__image").children("img").attr("src", Image);
    $(".faculty-info__name").text(Name);
    $(".faculty-info__title").text(Title);
    $(".faculty-info__profile-button").attr("href", Profile);
    if (CV) {
      $(".faculty-info__buttons").css("grid-template-columns", "1fr 1fr");
      $(".faculty-info__cv-button").css("display", "inline-block");
      $(".faculty-info__cv-button").attr("href", CV);
    } else {
      $(".faculty-info__buttons").css("grid-template-columns", "1fr");
      $(".faculty-info__cv-button").css("display", "none");
    }
    $(".selected-publications__page").css("display", "flex");
    $(".selected-publications__loading-message").css("display", "none");
  }

  async function main(facultyUrl, workUrl) {
    // Fill meta tag for SEO
    $("[name='description']").attr(
      "content",
      "Explore selected publications from Boston College Law School faculty."
    );

    const workData = await getWorkData(workUrl);
    await initializeTable(workData);
    const { facultyData, facultyNames } = await initializePage(facultyUrl);

    // Update loading message
    $(".selected-publications__loading-message").text(
      "Welcome to Selected Publications. Please search for a faculty member."
    );

    // Fill custom search bar
    $(".custom-search__input").autocomplete({
      source: facultyNames,
      delay: 0,
    });

    $(".custom-search").css("display", "flex"); // Unhide custom search bar

    $(".ui-autocomplete, .custom-search__button").on("click", function () {
      let currentFaculty = facultyData.data.find(
        (faculty) => faculty.Name === $(".custom-search__input").val()
      );

      if (currentFaculty) {
        drawPage(currentFaculty);
      }
      $(".custom-search__input").val("");
    });
  }

  // Clear search bar on page reload
  $(window).on("beforeunload", function () {
    $(".custom-search__input").val("");
  });
  const facultyUrl =
    "https://docs.google.com/spreadsheets/d/e/2PACX-1vQgfjiHQuIxuj6_p2vuAskviCh7XPl3J19aZO7Fiyl_cIR__LcTl1WfWCLBqQGmVPXklqOFfE2wwDqs/pub?gid=1091124444&single=true&output=csv";
  const workUrl =
    "https://docs.google.com/spreadsheets/d/e/2PACX-1vQgfjiHQuIxuj6_p2vuAskviCh7XPl3J19aZO7Fiyl_cIR__LcTl1WfWCLBqQGmVPXklqOFfE2wwDqs/pub?gid=132604372&single=true&output=csv";
  main(facultyUrl, workUrl);
});
