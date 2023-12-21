import QuestionView from "core/js/views/questionView";
class NumberInputView extends QuestionView {
  initialize() {
    super.initialize();
    this.listenTo(this.model, "scoreUpdated", this.updateScoreInInputs);
    this.listenTo(this.model, "noScoreAvailable", this.renderGameLink);
    this.listenTo(
      this.model,
      "decisionTreeDataFetched",
      this.onDecisionTreeDataFetched
    );
    this.listenTo(this.model, "tableDataFetched", this.onTableDataFetched);
  }

  onTableDataFetched() {
    const tableData = this.model.get("_userTableData");
       const table = document.createElement("table");
       table.style.width = "100%";
       table.style.borderCollapse = "collapse";
       table.style.textAlign = "left";
    const thead = document.createElement("thead");
    const tbody = document.createElement("tbody");
    table.appendChild(thead);
    table.appendChild(tbody);

    // Header row
    const headerRow = document.createElement("tr");
    const headers = [
      "Player",
      "Confidence in model",
      "",
      "Score (run 1)",
      "Score (run 2)",
      "Score (run 3)",
      "Score (run 4)",
    ];
    headers.forEach((text) => {
      const th = document.createElement("th");
      th.textContent = text;
      th.style.borderBottom = "1px solid #ddd";
      th.style.padding = "8px";
      headerRow.appendChild(th);
    });
    thead.appendChild(headerRow);

    // Add tableData rows dynamically, including descriptor cells
    const addDataRow = (label, confidence, descriptor, results) => {
      const row = document.createElement("tr");
      row.appendChild(createCell(label, true)); // Player name or descriptor label
      row.appendChild(createCell(confidence, true)); // Confidence level

      // Descriptor cell for the row
      const descriptorCell = createCell(descriptor, true);
      descriptorCell.style.fontWeight = "bold"; // Make descriptor bold
      row.appendChild(descriptorCell);

      // Add scores or results
      results.forEach((result) => {
        row.appendChild(createCell(result)); // Score cells
      });

      tbody.appendChild(row);
    };

    // Helper function to create a cell with text content
    function createCell(text, isHeader = false) {
      const cell = document.createElement(isHeader ? "th" : "td");
      cell.textContent = text || "";
      cell.style.padding = "8px";
      return cell;
    }

    // Player's scores
    const playerResults = Object.keys(tableData.result).map(
      (run) => tableData.result[run].player
    );
    addDataRow(
      "You",
      `${tableData.confidences.player}%`,
      "% correctly classified (a)",
      playerResults
    );

    // % correctly classified (a)
    // Difference from confidence
    const diffResults = Object.keys(tableData.result).map(
      (run) => tableData.result[run].playerDiff
    );
    addDataRow("", "", "Difference from confidence (b)", diffResults);

    // Score (a - b)
    const scoreABResults = Object.keys(tableData.result).map(
      (run) => tableData.result[run].player - tableData.result[run].playerDiff
    );
    addDataRow("", "", "Score (a - b)", scoreABResults);

    // vs Machine results
    const machineResults = Object.keys(tableData.result).map((run) =>
      tableData.result[run].beatMachine ? "+10 (You win)" : "0"
    );
    addDataRow(
      "vs Machine",
      `${tableData.confidences.machine}%`,
      "",
      machineResults
    );

    // vs Human+ML results
    const hybridResults = Object.keys(tableData.result).map((run) => {
      if (tableData.result[run].beatHybrid === true) {
        return "+25 (You win)";
      } else if (tableData.result[run].beatHybrid === false) {
        return "0 (You lose)";
      } else {
        return "+0 (You lose)";
      }
    });
    addDataRow("vs Human+ML", `${tableData.confidences.hybrid}%`, "", hybridResults);

    // Total score
    const totalResults = Object.keys(tableData.result).map(
      (run) => tableData.result[run].score
    );
    addDataRow("Total", "", "", totalResults);


    this.$(".table-container").html(table);
}
  onDecisionTreeDataFetched() {
     let html = "<ul>";
const treeData = this.model.get("_userTree")
  // Root node
  html += `<li><span class="tree-item-root">${treeData.factors._}</span>`;
  html += "<ul>";

  // Level 2 nodes: Elevation <= 11 and > 11
  // Left branch (<= 11)
  html += `<li>&lt;= ${treeData.boundaries.a}<ul>`;
  html += `<li><span class="tree-item-factor">${treeData.factors.l} (${treeData.boundaries.la})</span><ul>`; // Applying 'tree-item' to factor only
  html += createBranchesHtml(treeData.predictions.ll, treeData.boundaries.la);
  html += "</ul></li></ul></li>";

  // Right branch (> 11)
  html += `<li>&gt; ${treeData.boundaries.a}<ul>`;
  html += `<li><span class="tree-item-factor">${treeData.factors.r} (${treeData.boundaries.ra})</span><ul>`; // Applying 'tree-item' to factor only
  html += createBranchesHtml(treeData.predictions.rr, treeData.boundaries.ra);
  html += "</ul></li></ul></li>";

  html += "</ul></li></ul>";
  console.log(html);
   this.$(".list-container").html(html);


// Helper function to create branches for each prediction
function createBranchesHtml(predictions, boundaryValue) {
  let html = "";

  // Assuming predictions contain only "New York" and "San Francisco"
  html += `<li>&gt;= ${boundaryValue}<ul>`;
  html += `<li><span class="tree-item-prediction">${
    predictions["San Francisco"] > predictions["New York"]
      ? "San Francisco"
      : "New York"
  }</span></li>`;
  html += `</ul></li>`;

  html += `<li>&lt;= ${boundaryValue}<ul>`;
  html += `<li><span class="tree-item-prediction">${
    predictions["New York"] >= predictions["San Francisco"]
      ? "New York"
      : "San Francisco"
  }</span></li>`;
  html += `</ul></li>`;

  return html;
}
  }

  updateScoreInInputs(score) {
    this.model.get("_items").forEach((item, index) => {
      item.userAnswer = score;

      const $input = this.$(`.js-numberinput-numberbox:eq(${index})`);
      $input.val(score);

      this.model.setItemUserAnswer(index, score);
    });
  }
  events() {
    return {
      "focus .js-numberinput-numberbox": "clearValidationError",
      "change .js-numberinput-numberbox": "onInputChanged",
      "keyup .js-numberinput-numberbox": "onInputChanged",
    };
  }

  renderGameLink() {
    const gameLink = this.model.get("_gameLink");
    if (gameLink) {
      this.$(".game-link-container").html(
        `<div> <span>No score found</span> <a href="${gameLink}" target="_blank">Play the Game</a><span> to receive a score</span></div>`
      );
    }
  }

  onQuestionPreRender() {
    const presetScore = this.model.get("_score");
    this.model.get("_items").forEach((item) => {
      item.userAnswer = presetScore;
    });
  }

  updateInputFieldsWithPresetScore() {
    const presetScore = this.model.get("_score");
    this.model.get("_items").forEach((item, index) => {
      const $input = this.$(`.js-numberinput-numberbox:eq(${index})`);
      $input.val(presetScore);
    });
  }

  setupQuestion() {
    this.model.setupRandomisation();
  }

  disableQuestion() {
    this.setAllItemsEnabled(false);
  }

  enableQuestion() {
    this.setAllItemsEnabled(true);
  }

  setAllItemsEnabled(isEnabled) {
    this.model.get("_items").forEach((item, index) => {
      const $itemInput = this.$(".js-numberinput-numberbox").eq(index);

      $itemInput.prop("disabled", !isEnabled);
    });
  }
  onQuestionRendered() {
    super.onQuestionRendered();
    this.updateInputFieldsWithPresetScore();
    this.setReadyStatus();
  }

  updateInputFieldsWithPresetScore() {
    const presetScore = this.model.get("_score");
    this.model.get("_items").forEach((item, index) => {
      const $input = this.$(`.js-numberinput-numberbox:eq(${index})`);
      $input.val(presetScore);
    });
  }

  clearValidationError() {
    this.$(".js-numberinput-numberbox").removeClass("has-error");
  }

  onCannotSubmit() {
    this.showValidationError();
  }

  showValidationError() {
    this.$(".js-numberinput-numberbox").addClass("has-error");
  }

  showMarking() {
    if (!this.model.get("_canShowMarking")) return;

    this.model.get("_items").forEach((item, i) => {
      const $item = this.$(".js-numberinput-item").eq(i);
      $item
        .removeClass("is-correct is-incorrect")
        .addClass(item._isCorrect ? "is-correct" : "is-incorrect");
    });
  }

  resetQuestion() {
    this.$(".js-numberinput-numberbox")
      .prop("disabled", !this.model.get("_isEnabled"))
      .val("");

    this.model.set({
      _isAtLeastOneCorrectSelection: false,
      _isCorrect: undefined,
    });
  }

  showCorrectAnswer() {
    const correctAnswers = this.model.get("_answers");

    this.model.get("_items").forEach((item, index) => {
      const correctAnswer = correctAnswers
        ? correctAnswers[index][0]
        : item._answers[0];
      this.$(".js-numberinput-numberbox").eq(index).val(correctAnswer);
    });
  }

  hideCorrectAnswer() {
    this.model.get("_items").forEach((item, index) => {
      this.$(".js-numberinput-numberbox").eq(index).val(item.userAnswer);
    });
  }

  onInputChanged(e) {
    const $input = $(e.target);
    const inputVal = $input.val();
    const index = $input.parents(".js-numberinput-item").index();

    if (inputVal !== "" && !$.isNumeric(inputVal)) {
      $input.val("");
      this.showValidationError("Please enter a valid number.");
    } else {
      this.model.setItemUserAnswer(index, inputVal);
    }
  }
}

NumberInputView.template = "numberinput.jsx";

export default NumberInputView;
