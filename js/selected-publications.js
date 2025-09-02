async function fetchCSVData(url) {
  /* Takes Google Sheets URL and returns an object.
     Object.data is an array of objects, 
     in which each object is a line on the spreadsheet. */
  try {
    const response = await fetch(url);
    if (!response.ok) throw new Error("Failed to fetch CSV");
    return Papa.parse(await response.text(), { header: true });
  } catch (error) {
    console.error(error);
    return { data: [] }; // Return empty object in case of error
  }
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
    notes,
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

    if (notes === "pinned")
      title = `<i class="fa-solid fa-map-pin"></i> ` + title;

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

  // Use * to force within-year custom order
  const formatYear = (year) => {
    if (year.replaceAll("*", "") === "3000max") {
      return "";
    }
    return year ? ` (${year.replaceAll("*", "")})` : "";
  };

  const formatNotes = (notes) => {
    if (notes === "pinned") return "";
    if (notes !== undefined && notes.trimEnd() !== "") {
      return `. ${notes}.`;
    }
    return "";
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
  const notesInfo = formatNotes(notes);

  // Title information
  const titleInfo = formatTitle();

  // Combine all components into the citation
  let citation = `${coauthorInfo}${wholeworkInfo}${numberInfo}${pageInfo}${publisherInfo}${yearInfo}${notesInfo}`;

  // Ensure citation ends with a period
  if (!citation.endsWith(".")) citation += ".";

  // Wrap in title info
  return `${titleInfo}<div>${citation}</div>`;
}

function formatWorkCategory(str) {
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

function initializeWorkTable(workData) {
  var data = workData.data.map(Object.values);
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
    { title: "Notes", visible: false, searchable: false },
    { title: "Areas", visible: false, searchable: false },
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
        return formatWorkCategory(group); // Capitalize and format group headers
      },
    },
    drawCallback: function () {}, // END drawCallback
  });

  return table;
}

function formatFaculty(rowData) {
  // Destructure rowData for clarity
  let [hash, name, title, image, profile, cv, areas] = rowData;
  let url = window.location.toString().split("#")[0]; // Clear any pre-existing hashes
  url = `${url}#${hash}`;
  return `<a class="faculty-table-link" href="${url}"><div class="faculty-table-cell"><div class="faculty-table-image"><img src="${image}" /></div>${name}</div></a>`;
}

function initializeFacultyTable(facultyData, workFaculty) {
  var data = facultyData.data.map(Object.values);

  const custom_columns = [
    { title: "Hash", visible: false },
    { title: "Name", visible: false },
    { title: "Title", visible: false },
    { title: "Image", visible: false },
    { title: "Profile", visible: false },
    { title: "CV", visible: false },
    { title: "Areas", visible: false },
    { title: "Status", visible: false },
    { title: "FacultyDisplay" }, // Show only formatted citation
  ];

  var filteredData = [];
  for (let i in data) {
    if (workFaculty.includes(data[i][0])) {
      data[i].push(formatFaculty(data[i]));
      filteredData.push(data[i]);
    }
  }

  const table = new DataTable("#faculty-table", {
    dom: "ftr",
    searching: false,
    autoWidth: false,
    pageLength: 999,
    data: filteredData,
    columns: custom_columns,
    language: { search: "", searchPlaceholder: "Faculty name..." },
    drawCallback: function () {}, // END drawCallback
  });

  return table;
}

function drawFacultyProfile(currentFaculty) {
  const { Hash, Image, Name, Title, Profile, CV } = currentFaculty;

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
  $(".selected-publications__loading").css("display", "none");
}

async function initializePage(facultyData, workData) {
  if (
    // if URL has valid hash
    workData.data
      .map((row) => row.hash)
      .includes(window.location.hash.toString().replace("#", ""))
  ) {
    $(".faculty-select").css("display", "none");
  } else {
    history.pushState("", document.title, window.location.pathname);
  }

  // Draw page with faculty info if hash belongs to faculty
  const hash = window.location.hash.replace("#", "");
  const facultyHashes = [...new Set(workData.data.map((row) => row.hash))];
  if (facultyHashes.includes(hash)) {
    const currentFaculty = facultyData.data.find(
      (faculty) => faculty.Hash === hash
    );
    drawFacultyProfile(currentFaculty);
  }
}

async function getWorkFaculty(workData) {
  return [...new Set(workData.data.map((object) => object.hash))];
}
$(document).ready(function () {
  async function main(facultyUrl, workUrl) {
    // Fill meta tag for SEO
    $("[name='description']").attr(
      "content",
      "Explore selected publications from Boston College Law School faculty."
    );

    const workData = await fetchCSVData(workUrl);
    await initializeWorkTable(workData);
    // [... ] is the spread operator unpacking the set into an array.
    const workFaculty = await getWorkFaculty(workData);
    const facultyData = await fetchCSVData(facultyUrl);
    await initializeFacultyTable(facultyData, workFaculty);
    await initializePage(facultyData, workData);

    // Initialize custom search bar
    const facultyNames = facultyData.data
      .filter((row) => workFaculty.includes(row.Hash))
      .map((row) => row.Name);
    $(".custom-search__input").autocomplete({
      source: facultyNames,
      delay: 0,
    });

    // Unhide custom search bar
    $(".custom-search").css("display", "flex");

    // Update loading message
    $(".selected-publications__loading").hide();

    // If search button or autocomplete is clicked, update hash if valid
    $(".ui-autocomplete, .custom-search__button").on("click", function () {
      let currentFaculty = facultyData.data.find(
        // Given each row, see if row.Name === search string
        // .find() returns first true item
        (row) => row.Name === $(".custom-search__input").val()
      );

      if (currentFaculty) {
        window.location.hash = `#${currentFaculty.Hash}`; // Update hash
        $(".custom-search__input").val(""); // Clear search bar
      }
    });

    $(".selected-publications__heading").on("click", function () {
      history.pushState("", document.title, window.location.pathname);
      $(window).trigger("hashchange");
    });

    // Listen for hash change
    const facultyHashes = [...new Set(workData.data.map((row) => row.hash))];
    $(window).on("hashchange", function () {
      if (window.location.hash) {
        var facultyHash = window.location.hash.replace(/^#/, "");
        if (facultyHashes.includes(facultyHash)) {
          let currentFaculty = facultyData.data.find(
            (row) => `#${row.Hash}` === window.location.hash
          );
          drawFacultyProfile(currentFaculty);
          $(".selected-publications__page").show();
          $(".faculty-select").hide();
        } else {
          $(".faculty-select").show();
          $(".selected-publications__page").hide();
        }
      } else {
        $(".faculty-select").show();
        $(".selected-publications__page").hide();
      }
      $(window).scrollTop(0);
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
