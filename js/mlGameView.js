import QuestionView from "core/js/views/questionView";
class mlGameView extends QuestionView {
  initialize() {
    super.initialize();
    this.listenTo(this.model, "scoreUpdated", this.updateScore);
    this.listenTo(this.model, "decisionTreeDataFetched", this.onDecisionTreeDataFetched );
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

  translateDecisionTree(treeData, factorKey) {
    const node = {};

    const factor = treeData.factors[factorKey];
    if (factorKey == "_") {
      factorKey = "";
    }
    const boundary = treeData.boundaries[factorKey + "a"];
    const prediction = treeData.predictions[factorKey];

    if (factor) {
      node.factor = factor;
      node.boundary = boundary;
      node.left = this.translateDecisionTree(treeData, factorKey + "l");
      node.right = this.translateDecisionTree(treeData, factorKey + "r");
    }

    if (prediction) {
      node.prediction = prediction.prediction;
    }

    return node;
  }

  translateToNestedLists(treeNode,level) {
    const ul = document.createElement("ul");
    if (treeNode.factor) {
      if (level == 3) {
        this.$(".list-container").css("min-width", "1400px");
        this.$(".list-container").css("left", "-200px");
        this.$(".list-container").css("position", "relative");
      }
      this.$(".list-container").css("min-height", level * 150 + "px");
      level = level + 1;
      const li = document.createElement("li");
      const factorSpan = document.createElement("span");
      factorSpan.classList.add("tree-item-factor");
      factorSpan.textContent = `${treeNode.factor}`;
      li.appendChild(factorSpan);
      const boundaryUl = document.createElement("ul");

      if (treeNode.left) {
        const boundaryLi = document.createElement("li");
        boundaryLi.textContent = "<=" + treeNode.boundary;
        const newLeftUl = this.translateToNestedLists(treeNode.left,level);
        boundaryLi.appendChild(newLeftUl);
        boundaryUl.appendChild(boundaryLi);
        li.appendChild(boundaryUl);
      }

      if (treeNode.right) {
        const boundaryLi = document.createElement("li");
        boundaryLi.textContent = ">" + treeNode.boundary;
        const rightUl = this.translateToNestedLists(treeNode.right,level);
        boundaryLi.appendChild(rightUl);
        boundaryUl.appendChild(boundaryLi);
        li.appendChild(boundaryUl);
      }

      ul.appendChild(li);
    } else if (treeNode.prediction) {
      const li = document.createElement("li");
      const predictionSpan = document.createElement("span");
      predictionSpan.classList.add("tree-item-prediction");
      predictionSpan.textContent = treeNode.prediction;
      li.appendChild(predictionSpan);
      ul.appendChild(li);
    }

    return ul;
  }

  onDecisionTreeDataFetched() {
    const treeData = this.translateDecisionTree(this.model.get("_userTree"),"_");
    this.$(".list-container").html(this.translateToNestedLists(treeData,1));
  }

  updateScore(score) {
    this.$(".js-btn-action").click();
    this.$(".js-btn-action").text("Result found");
    this.$(".component__instruction").hide();
    this.$(".your-score").html(score);
    this.$(".score-container").show();
    this.model.setQuestionAsSubmitted()
    this.model.updateButtons();
    this.$(".js-btn-marking").addClass("is-full-width2");
  }

  events() {
  }

  renderGameLink() {
    const userId = this.model.get("_userId");
    const gameLink = this.model.get("_gameLink");
    console.log(gameLink);
    if (gameLink) {
      this.$(".game-link-container").html(
        `<button><a style="border-bottom: none;" href="${gameLink}?userId=${userId}" target="_blank">Click here to access the game</a></button>`
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
      const $input = this.$(`.js-mlgame-numberbox:eq(${index})`);
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
      const $itemInput = this.$(".js-mlgame-numberbox").eq(index);

      $itemInput.prop("disabled", !isEnabled);
    });
  }

  onQuestionRendered() {
    super.onQuestionRendered();
    this.renderGameLink();
    this.setReadyStatus();
    this.model.fetchScore();
  }

  updateInputFieldsWithPresetScore() {
    const presetScore = this.model.get("_score");
    this.model.get("_items").forEach((item, index) => {
      const $input = this.$(`.js-mlgame-numberbox:eq(${index})`);
      $input.val(presetScore);
    });
  }

  clearValidationError() {
    this.$(".js-mlgame-numberbox").removeClass("has-error");
  }

  onCannotSubmit() {
    this.showValidationError();
  }

  showValidationError() {
    this.$(".js-mlgame-numberbox").addClass("has-error");
  }

  showMarking() {
    if (!this.model.get("_canShowMarking")) return;

    this.model.get("_items").forEach((item, i) => {
      const $item = this.$(".js-mlgame-item").eq(i);
      $item
      .removeClass("is-correct is-incorrect")
      .addClass(item._isCorrect ? "is-correct" : "is-incorrect");
    });
  }

  resetQuestion() {
    this.$(".js-mlgame-numberbox")
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
      this.$(".js-mlgame-numberbox").eq(index).val(correctAnswer);
    });
  }

  hideCorrectAnswer() {
    this.model.get("_items").forEach((item, index) => {
      this.$(".js-mlgame-numberbox").eq(index).val(item.userAnswer);
    });
  }

  onInputChanged(e) {
    const $input = $(e.target);
    const inputVal = $input.val();
    const index = $input.parents(".js-mlgame-item").index();

    if (inputVal !== "" && !$.isNumeric(inputVal)) {
      $input.val("");
      this.showValidationError("Please enter a valid number.");
    } else {
      this.model.setItemUserAnswer(index, inputVal);
    }
  }
}

mlGameView.template = "mlgame.jsx";

export default mlGameView;
