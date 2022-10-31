const categoryNum = 6;
const clueNum = 5;

// categories is the main data structure for the app; it looks like this:

//  [
//    { title: "Math",
//      clues: [
//        {question: "2+2", answer: 4, showing: null},
//        {question: "1+1", answer: 2, showing: null}
//        ...
//      ],
//    },
//    { title: "Literature",
//      clues: [
//        {question: "Hamlet Author", answer: "Shakespeare", showing: null},
//        {question: "Bell Jar Author", answer: "Plath", showing: null},
//        ...
//      ],
//    },
//    ...
//  ]

let categories = [];

/** Get NUM_CATEGORIES random category from API.
 *
 * Returns array of category ids
 */

async function getCategoryIds() {
  //Getting 50 categoryies
  let jeopardyCategory = await axios.get(
    `http://jservice.io/api/categories?count=50`
  );
  let getCategoryId = jeopardyCategory.data.map((e) => e.id);
  return _.sampleSize(getCategoryId, categoryNum);
}

/** Return object with data about a category:
 *
 *  Returns { title: "Math", clues: clue-array }
 *
 * Where clue-array is:
 *   [
 *      {question: "Hamlet Author", answer: "Shakespeare", showing: null},
 *      {question: "Bell Jar Author", answer: "Plath", showing: null},
 *      ...
 *   ]
 */

async function getCategory(catId) {
  //Getting random 6 categories
  let selectedCat = await axios.get(
    `http://jservice.io/api/category?id=${catId}`
  );
  let randomClue = _.sampleSize(selectedCat.data.clues, clueNum);
  let clues = randomClue.map((e) => ({
    question: e.question,
    answer: e.answer,
    showing: null,
  }));
  return { title: selectedCat.data.title, clues };
}

/** Fill the HTML table#jeopardy with the categories & cells for questions.
 *
 * - The <thead> should be filled w/a <tr>, and a <td> for each category
 * - The <tbody> should be filled w/NUM_QUESTIONS_PER_CAT <tr>s,
 *   each with a question for each category in a <td>
 *   (initally, just show a "?" where the question/answer would go.)
 */

async function fillTable() {
  //categorie titles
  $("#jeopardy thead").empty();
  let $tr = $("<tr>");
  for (let i = 0; i < categoryNum; i++) {
    $tr.append($("<th>").text(categories[i].title));
  }
  $("#jeopardy thead").append($tr);
  //questions
  $("#jeopardy tbody").empty();
  for (let i = 0; i < clueNum; i++) {
    let $tr = $("<tr>");
    for (let y = 0; y < categoryNum; y++) {
      $tr.append($("<td>").attr("id", `${y}-${i}`).text("?"));
    }
    $("#jeopardy tbody").append($tr);
  }
}

/** Handle clicking on a clue: show the question or answer.
 *
 * Uses .showing property on clue to determine what to show:
 * - if currently null, show question & set .showing to "question"
 * - if currently "question", show answer & set .showing to "answer"
 * - if currently "answer", ignore click
 * */

function handleClick(e) {
  let id = e.target.id;
  let [catId, clueId] = id.split("-");
  let clue = categories[catId].clues[clueId];
  let disp;

  if (!clue.showing) {
    disp = clue.question;
    clue.showing = "question";
  } else if (clue.showing == "question") {
    disp = clue.answer;
    clue.showing = "answer";
  } else {
    return;
  }

  $(`#${catId}-${clueId}`).html(disp);
}

/** Wipe the current Jeopardy board, show the loading spinner,
 * and update the button used to fetch data.
 */

$("#start").on("click", function(){
    $("#spin-container").css("display","block")
    setTimeout(()=>{
        $("#spin-container").css("display","none")
        $("#jeopardy").css("display","block")
        $("#start").text("Restart Game").attr('id','restart')
        $("#restart").on("click", setupAndStart);
    },1000)
    

  })
/** Remove the loading spinner and update the button used to fetch data. */



/** Start game:
 *
 * - get random category Ids
 * - get data for each category
 * - create HTML table
 * */

async function setupAndStart() {
  let catIds = await getCategoryIds();

  categories = [];

  for (let catId of catIds) {
    categories.push(await getCategory(catId));
  }

  fillTable();
}

/** On click of restart button, restart game. */



/** On page load, setup and start & add event handler for clicking clues */

$(async function () {
  setupAndStart();
  $("#jeopardy").on("click", "td", handleClick);
});
