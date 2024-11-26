/**
 * The following program was written by the Department of Collection Services & Digital Initiatives at the Boston College Law Library.
 * It is a web application that presents a curated selection of the publications of the faculty of Boston College Law School.
 * It is displayed on its own page:
 * (https://www.bc.edu/law-publications)

   Last edited on 26 November 2024.
 */

var columns = [
  {
    data: "hash",
    title: "Hash",
    // (type, row) args are *required*!
    // I don't know why.
    render: function (data, type, row) {
      if (data === undefined) {
        data = "";
      }
      return data;
    },
    visible: false,
  },
  {
    data: "doctype",
    title: "DocType",
    render: function (data, type, row) {
      if (data === undefined) {
        data = "";
      }
      return data;
    },
    visible: false,
  },
  {
    data: "priority",
    title: "Priority",
    render: function (data, type, row) {
      if (data === undefined) {
        data = "";
      }
      return data;
    },
    visible: false,
  },
  {
    data: "author",
    title: "Author",
    render: function (data, type, row) {
      if (data === undefined) {
        data = "";
      }
      return data;
    },
    visible: false,
  },
  {
    data: "coauthors",
    title: "Coauthors",
    render: function (data, type, row) {
      if (data === undefined) {
        data = "";
      }
      return data;
    },
    visible: false,
  },
  {
    data: "partwork",
    title: "Partwork",
    render: function (data, type, row) {
      // Books (=1) and other works (=7) are "whole works"
      // which do not exist within a journal/review or edited volume.
      // We separated the columns  for convenience
      // So pull from 'wholework' column to fill this field
      if (row["priority"] == 1 || row["priority"] == 7) {
        if (row["vol"] !== "") {
          data = `${row["wholework"]}, Vol. ${row["vol"]}`;
        } else {
          data = row["wholework"];
        }
      } else if (data === undefined) {
        data = "";
      }
      if (row["link"] !== "" && row["link"] !== undefined) {
        // <svg> is the "link-out" icon
        data = `<a class="work-entry" href="${row["link"]}" 
                            style="text-decoration:underline;">${data} 
                            <svg style="vertical-align:middle;" viewBox="0 -256 1850 1850" width="1em" height="1em">
                                <g transform="matrix(1,0,0,-1,30.372881,1426.9492)">
                                <path d="M 1408,608 V 288 Q 1408,169 1323.5,84.5 1239,0 1120,0 
                                H 288 Q 169,0 84.5,84.5 0,169 0,288 v 832 Q 0,1239 84.5,1323.5 169,1408 288,1408 
                                h 704 q 14,0 23,-9 9,-9 9,-23 v -64 q 0,-14 -9,-23 -9,-9 -23,-9 
                                H 288 q -66,0 -113,-47 -47,-47 -47,-113 V 288 q 0,-66 47,-113 47,-47 113,-47 
                                h 832 q 66,0 113,47 47,47 47,113 v 320 q 0,14 9,23 9,9 23,9 h 64 q 14,0 23,-9 9,-9 9,-23 
                                z m 384,864 V 960 q 0,-26 -19,-45 -19,-19 -45,-19 -26,0 -45,19 
                                L 1507,1091 855,439 q -10,-10 -23,-10 -13,0 -23,10 L 695,553 q -10,10 -10,23 0,13 10,23 
                                l 652,652 -176,176 q -19,19 -19,45 0,26 19,45 19,19 45,19 
                                h 512 q 26,0 45,-19 19,-19 19,-45 z" inkscape:connector-curvature="0" style="fill:currentColor"/>
                                </g>
                            </svg>
                        </a>`;
      }
      return data;
    },
  },
  {
    data: "wholework",
    title: "Wholework",
    render: function (data, type, row) {
      if (data === undefined) {
        data = "";
      }
      return data;
    },
    visible: false,
  },
  {
    data: "publisher",
    title: "Publisher",
    render: function (data, type, row) {
      if (data === undefined) {
        data = "";
      }
      return data;
    },
    visible: false,
  },
  {
    data: "vol",
    title: "Volume-Issue",
    render: function (data, type, row) {
      if (data === undefined) {
        data = "";
      }
      return data;
    },
    visible: false,
  },
  {
    data: "iss",
    title: "Volume-Issue",
    render: function (data, type, row) {
      if (data === undefined) {
        data = "";
      }
      return data;
    },
    visible: false,
  },
  {
    data: "fpage",
    title: "First Page",
    render: function (data, type, row) {
      if (data === undefined) {
        data = "";
      }
      return data;
    },
    visible: false,
  },
  {
    data: "lpage",
    title: "Last Page",
    render: function (data, type, row) {
      if (data === undefined) {
        data = "";
      }
      return data;
    },
    visible: false,
  },
  {
    data: "year",
    title: "Year",
    render: function (data, type, row) {
      if (data === undefined) {
        data = "";
      }
      return data;
    },
    visible: false,
  },
  {
    data: "link",
    title: "Link",
    render: function (data, type, row) {
      if (data === undefined) {
        data = "";
      }
      return data;
    },
    visible: false,
  },
  {
    data: "citationdisplay",
    title: "CitationDisplay",
    render: function (data, type, row) {
      // Attach formatting to "[field]_info" variables

      // Format coauthor information
      coauthor_info = "";
      var coauthors = String(row["coauthors"]).split(";");
      if (coauthors.length === 1 && coauthors[0] !== "") {
        coauthor_info = `With ${coauthors[0]}`;
      } else if (coauthors.length > 1) {
        authors_before_and = coauthors.slice(0, -1);
        coauthor_info = `With ${authors_before_and.join(
          ", "
        )} and ${coauthors.pop()}`;
      }
      if (
        coauthor_info !== "" &&
        coauthor_info.charAt(coauthor_info.length - 1) !== "."
      ) {
        coauthor_info += ". ";
      }

      // Format information about "standalone works"
      // (book/journal/media --- all "stand-alone" units)
      var wholework_info = `<i>${row["wholework"]}</i>`;

      // If work at hand is a book (=1) or other media (=7)
      // Remove info because it's placed in the Title field instead
      if (row["priority"] == 1 || row["priority"] == 7) {
        wholework_info = "";
      } else if (row["doctype"] === "bookchapter") {
        wholework_info = "In " + wholework_info;
      }

      var number_info = "";

      // if work is book or other media, suppress volume/issue info (vol already included in as partwork)
      if (row["priority"] == 1 || row["priority"] == 7) {
        number_info = "";
      } else if (row["vol"] !== "" && row["iss"] !== "") {
        number_info = `, vol. ${row["vol"]}, no. ${row["iss"]}`;
      } else if (row["vol"] !== "") {
        number_info = `, vol. ${row["vol"]}`;
      } else if (row["iss"] !== "") {
        number_info = `, no. ${row["iss"]}`;
      }

      var publisher_info = "";
      if (row["publisher"] !== "") {
        if (row["doctype"] === "bookchapter") {
          publisher_info = `. ${row["publisher"]}`;
        } else {
          publisher_info = ` ${row["publisher"]}`;
        }
      }

      var year_info = "";
      if (row["year"] !== "") {
        year_info = ` (${row["year"].replace("*", "")})`;
      }

      var page_info = "";
      if (row["fpage"] !== "" && row["lpage"] !== "") {
        page_info = `: ${row["fpage"]}–${row["lpage"]}`;
      } else if (row["fpage"] !== "") {
        page_info = `: ${row["fpage"]}`;
      } else if (row["lpage"] !== "") {
        page_info = `: ${row["lpage"]}`;
      }

      data = `${coauthor_info}${wholework_info}${number_info}${page_info}${publisher_info}${year_info}`;

      // Add period if string doesn't end in period
      if (data.charAt(data.length - 1) !== ".") {
        data += ".";
      }

      return data;
    },
  },
];

// Define two custom functions (asc and desc) for string sorting
jQuery.fn.dataTableExt.oSort["string-case-asc"] = function (x, y) {
  return x < y ? -1 : x > y ? 0 : 0;
};

jQuery.fn.dataTableExt.oSort["string-case-desc"] = function (x, y) {
  return x < y ? 1 : x > y ? -1 : 0;
};

function titleCase(str) {
  return str
    .split(" ")
    .map((w) => w[0].toUpperCase() + w.substr(1).toLowerCase())
    .join(" ");
}

function categoryFormat(str) {
  if (str == "bookreview") {
    return "Book Reviews";
  } else if (str == "bookchapter") {
    return "Book Chapters";
  } else if (str == "conference") {
    return "Presentations";
  } else if (str == "testimony") {
    return "Congressional Testimonies";
  } else if (str == "otherwork") {
    return "Symposia, Blog Posts, Media";
  } else if (str == "video") {
    return "On Video";
  } else {
    return titleCase(str) + "s";
  }
}

function updateLayout(hash) {
  if (hash) {
    $(
      ".topicSearch:contains('" +
        hash.replace("#", "").replaceAll("-", " ") +
        "')"
    ).trigger("click");
    document.getElementById("data-table-container").style.display = "table";
    document.getElementById(
      "selected-publications-header-desktop"
    ).style.display = "block";
    $("#selected-publications-header-mobile").addClass("yes-hash");
    document.getElementById("welcome-blurb").style.display = "none";
  } else {
    // Otherwise, add "selected" to id="all" button
    $("#all").addClass("selected");
    document.getElementById("data-table-container").style.display = "none";
    document.getElementById(
      "selected-publications-header-desktop"
    ).style.display = "none !important";
    $("#selected-publications-header-mobile").removeClass("yes-hash");
    document.getElementById("welcome-blurb").style.display = "block";
  }
}

/* Autocomplete function taken from w3schools
creates a search bar with a dropdown of substring matches */

function autocomplete(inp, arr) {
  /*the autocomplete function takes two arguments,
    the text field element and an array of possible autocompleted values:*/
  var currentFocus;
  /*execute a function when someone writes in the text field:*/
  inp.addEventListener("input", function (e) {
    var a,
      b,
      i,
      val = this.value;
    /*close any already open lists of autocompleted values*/
    closeAllLists();
    if (!val) {
      return false;
    }
    currentFocus = -1;
    /*create a DIV element that will contain the items (values):*/
    a = document.createElement("DIV");
    a.setAttribute("id", this.id + "autocomplete-list");
    a.setAttribute("class", "autocomplete-items");
    /*append the DIV element as a child of the autocomplete container:*/
    this.parentNode.appendChild(a);
    /*for each item in the array...*/
    arr.forEach(function (arrayItem) {
      if (arrayItem.name.toUpperCase().includes(val.toUpperCase())) {
        b = document.createElement("DIV");
        b.innerHTML = arrayItem.name;

        /*insert a input field that will hold the current array item's value:*/
        b.innerHTML += "<input type='hidden' value='" + arrayItem.name + "'>";
        /*execute a function when someone clicks on the item value (DIV element):*/
        b.addEventListener("click", function (e) {
          /*insert the value for the autocomplete text field:*/
          inp.value = this.getElementsByTagName("input")[0].value;
          /* update hash to select correct faculty */
          window.location.hash = "#" + arrayItem.hash;

          /*update page layout */
          updateLayout(window.location.hash);

          /*close the list of autocompleted values,
                    (or any other open lists of autocompleted values:*/
          closeAllLists();
        });
        a.appendChild(b);
      }
    });
  });

  /*execute a function presses a key on the keyboard:*/
  inp.addEventListener("keydown", function (e) {
    var x = document.getElementById(this.id + "autocomplete-list");
    if (x) x = x.getElementsByTagName("div");
    if (e.keyCode == 40) {
      /*If the arrow DOWN key is pressed,
          increase the currentFocus variable:*/
      currentFocus++;
      /*and and make the current item more visible:*/
      addActive(x);
    } else if (e.keyCode == 38) {
      //up
      /*If the arrow UP key is pressed,
          decrease the currentFocus variable:*/
      currentFocus--;
      /*and and make the current item more visible:*/
      addActive(x);
    } else if (e.keyCode == 13) {
      /*If the ENTER key is pressed, prevent the form from being submitted,*/
      e.preventDefault();
      if (currentFocus > -1) {
        /*and simulate a click on the "active" item:*/
        if (x) x[currentFocus].click();
      }
    }
  });
  function addActive(x) {
    /*a function to classify an item as "active":*/
    if (!x) return false;
    /*start by removing the "active" class on all items:*/
    removeActive(x);
    if (currentFocus >= x.length) currentFocus = 0;
    if (currentFocus < 0) currentFocus = x.length - 1;
    /*add class "autocomplete-active":*/
    x[currentFocus].classList.add("autocomplete-active");
  }
  function removeActive(x) {
    /*a function to remove the "active" class from all autocomplete items:*/
    for (var i = 0; i < x.length; i++) {
      x[i].classList.remove("autocomplete-active");
    }
  }
  function closeAllLists(elmnt) {
    /*close all autocomplete lists in the document,
      except the one passed as an argument:*/
    var x = document.getElementsByClassName("autocomplete-items");
    for (var i = 0; i < x.length; i++) {
      if (elmnt != x[i] && elmnt != inp) {
        x[i].parentNode.removeChild(x[i]);
      }
    }
  }
  /*execute a function when someone clicks in the document:*/
  document.addEventListener("click", function (e) {
    closeAllLists(e.target);
  });
}

// ================== START OF EXECUTION ================== //

$(document).ready(function () {
  $("#demo").html(
    '<div id="faculty-search-wrapper" class="autocomplete"></div>'
  );
  $("#faculty-search-wrapper").html(
    '<span id="search-icon-wrapper" class="input"><i class="glyphicon glyphicon-search"></i></span>'
  );
  $("#faculty-search-wrapper").after(
    '<h3 id="selected-publications-header-mobile" class="selected-publications-header">Selected Publications</h3>'
  );
  $("#search-icon-wrapper").after(
    '<input id="myInput" class="expand" type="text" placeholder="Faculty name..."></input>'
  );
  document
    .querySelector("#search-icon-wrapper")
    .addEventListener("click", function () {
      document.querySelector("#myInput").classList.toggle("expand");
    });
  $("#selected-publications-header-mobile").after(
    '<div id="columns-wrapper"></div>'
  );
  $("#columns-wrapper").html('<div id="first-column" class="col-md-4"></div>');
  $("#first-column").after(
    '<div id="second-column" class="col-md-8"><table id="data-table-container" class="display table table-bordered table-striped row-border" cellpadding="0" cellspacing="0" border="0"></table></div>'
  );
  $("#selected-publications-header-mobile").after(
    '<p id="welcome-blurb">Welcome to the Selected Faculty Publications page. Please search for a faculty member.</p>'
  );
  $("#data-table-container").before(
    '<h3 id="selected-publications-header-desktop" class="selected-publications-header">Selected Publications</h3>'
  );
  var faculty_info_list = [];
  var faculty_names = [];

  // If hash exists, add "selected" to appropriate button
  if (window.location.hash) {
    document.querySelector("#myInput").classList.remove("expand");
  }

  $.ajax({
    url: "https://sheets.googleapis.com/v4/spreadsheets/1nKPgpNotU2NRH7fY-_bAjvFEc95M3MF_5uREiMyvoiw/values/faculty!A:F?key=AIzaSyD8Y28YJpVhE4XlVlOoA74Ws47YdPz5nGA",
    type: "GET",
    async: false, // Important!
    success: function (data) {
      data.values.forEach(function (item, index) {
        entry = {
          hash: item[0],
          name: item[1],
          title: item[2],
          image: item[3],
          profile: item[4],
          cv: item[5],
        };
        faculty_info_list.push(entry);

        entry = {
          hash: item[0],
          name: item[1],
        };

        faculty_names.push(entry);
      });
    },
    error: function (error) {
      console.log(`Error ${error}`);
    },
  });

  // remove header row
  faculty_info_list.shift();
  faculty_names.shift();

  function createMenu() {
    // Add credit image
    $("#data-table-container").after(
      '<img src="https://www.bc.edu/content/dam/bc1/schools/law/js/library/publication-lists/built_by_bcll_400.png" alt="this application was built by the staff of the Boston College Law Library" width="150" id="library-credit">'
    );

    updateLayout(window.location.hash);
  }

  // Create datatable
  var pubTable = $("#data-table-container").dataTable({
    // FTR = Filter input; display Table; pRocess display element
    dom: "ftr",
    autoWidth: false,
    pageLength: 999, // Number of rows in page
    ajax: {
      // Pull data from Google Sheet via Sheets API v4
      url: "https://sheets.googleapis.com/v4/spreadsheets/1nKPgpNotU2NRH7fY-_bAjvFEc95M3MF_5uREiMyvoiw/values/pubs!A:N?key=AIzaSyD8Y28YJpVhE4XlVlOoA74Ws47YdPz5nGA",
      cache: true,
      dataSrc: function (json) {
        var myData = json["values"];
        myData = myData.map(function (n, i) {
          myObject = {
            hash: n[0],
            doctype: n[1],
            priority: n[2],
            author: n[3],
            coauthors: n[4],
            partwork: n[5],
            wholework: n[6],
            publisher: n[7],
            vol: n[8],
            iss: n[9],
            fpage: n[10],
            lpage: n[11],
            year: n[12],
            link: n[13],
            citationdisplay: n[13],
          };
          return myObject;
        });
        myData.splice(0, 1); // Remove header row
        return myData;
      }, // END dataSrc
    }, // END ajax
    columns: columns,

    // Sort by hash, then by priority, then by doctype, then by year, then by title
    order: [
      [0, "asc"],
      [2, "asc"],
      [1, "asc"],
      [12, "desc"],
      [5, "asc"],
    ],

    // When the table has fully loaded
    initComplete: function (settings) {
      createMenu();
      autocomplete(document.getElementById("myInput"), faculty_names);
    },

    // Each time the table is (re-)drawn
    drawCallback: function (settings) {
      var api = this.api();
      var rows = api.rows({ page: "current" }).nodes();
      var last = null;

      // Insert work type header ("Articles", etc)
      api
        .column(1, { page: "current" })
        .data()
        .each(function (group, i) {
          if (last !== group) {
            $(rows)
              .eq(i)
              .before(
                `<tr class="group"><td colspan="2">${categoryFormat(
                  String(group)
                )}</td></tr>`
              );
            last = group;
          }
        });

      var tables = $(".dataTable").DataTable();

      // Create "left-list" if it doesn't exist
      // Necessary for search functionality?
      if ($(".left-list")[0]) {
      } else {
        $("div.dataTables_filter").wrap('<div class="left-list"></div>');
        $("div.left-list").before(
          '<div id="topics-list"><ul id="top-list" class="buttons"></ul></div>'
        );
      }

      if (
        $("ul#top-list li").length <= 1 &&
        api.columns(0).data()[0].length > 0
      ) {
        var subjectList = api
          .columns(0, { search: "applied" })
          .data()
          .eq(0) // Reduce the 2D array into a 1D array of data
          .sort() // Sort data alphabetically
          .unique(); // Reduce to unique values
        var cList = $("ul#top-list");
        var liAll = $("<li/>") // Add link for all areas
          .appendTo(cList);
        var spanAll = $("<span/>")
          .addClass("selected allTopics btn btn-default btn-red short_name")
          .attr("id", "all")
          .text("All Topics")
          .appendTo(liAll);

        // Create subject menu
        $.each(subjectList, function (i) {
          var li = $("<li/>").appendTo(cList);
          var span = $('<span class="btn btn-default btn-red"></span>')
            .addClass("topicSearch")
            .text(subjectList[i].toLowerCase());
          if (subjectList[i].length < 22) {
            span.addClass("short_name");
          }
          span.appendTo(li);
        });

        // Add function to search buttons
        $("span.topicSearch").click(function () {
          $("#top-list span").removeClass("selected");
          $(this).addClass("selected");

          var search = $(this).text();
          tables.search("");
          tables.column(0).search(search, true, false).draw();
          history.pushState(
            "",
            document.title,
            "#" + search.replaceAll(" ", "-")
          );

          if (document.getElementById("faculty-info-card")) {
            $("#faculty-info-card").remove();
          }

          $("#first-column").html(
            '<div id="faculty-info-card" class="card d-flex flex-column"><div class="card-body p-4"><div id="image-and-blurb" class="d-flex text-black"></div></div></div>'
          );
          $("#image-and-blurb").html(
            '<div id="image-wrapper" class="flex-shrink-0"><img id="faculty-image" class="img-circle"></div>'
          );
          $("#image-wrapper").after(
            '<div id="faculty-info-wrapper" class="flex-grow-1 ms-3"></div>'
          );
          $("#faculty-info-wrapper").html(
            '<div id="faculty-text-wrapper"><h3></h3><p style="color: #2b2a2a;"></p></div><div id="buttons-wrapper" class="d-flex pt-1 align-bottom">'
          );

          var faculty_info = faculty_info_list.find(
            ({ hash }) => "#" + hash === window.location.hash
          );

          if (faculty_info.cv === undefined || faculty_info.cv === "") {
            $("#buttons-wrapper").html(
              '<a id="profile-button" class="btn btn-primary btn-red me-1 flex-1 mt-auto" type="button">Profile</a>'
            );
            $("#profile-button").attr("href", faculty_info.profile);
          } else {
            $("#buttons-wrapper").html(
              '<a id="profile-button" class="btn btn-primary btn-red me-1 flex-1 mt-auto" type="button">Profile</a><a id="cv-button" class="btn btn-primary btn-red flex-1 mt-auto" type="button">CV</a>'
            );
            $("#profile-button").attr("href", faculty_info.profile);
            $("#cv-button").attr("href", faculty_info.cv);
          }
          $("#image-wrapper img").attr("src", faculty_info.image);
          $("#faculty-info-wrapper h3").html(faculty_info.name);
          $("#faculty-info-wrapper p").html(faculty_info.title);
        });
      }
    }, // END drawCallback
  }); // END faqTable
}); //end $(document).ready
