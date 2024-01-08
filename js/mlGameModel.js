import QuestionModel from "core/js/models/questionModel";
import Adapt from "core/js/adapt";

class mlGameModel extends QuestionModel {
  initialize(...args) {
    super.initialize(...args);
    
    this.get("_buttons")._submit.buttonText = "Awaiting Score";
    
    const userId = Adapt.spoor.scorm.scorm.get("cmi.core.student_id");
    this.set("_userId", userId);

    this.pollForScore();
  }

  async fetchScore() {
    // const userId = "ForJack"
    const url = `https://mlgame.learndata.info/game/63cf10e9631a60aab279c391/result?userId=${userId}`;

    try {
      const response = await fetch(url);
      const data = await response.json();
      if (data && data.score !== undefined && data.score !== null) {
        // console.log("Score", data.score);
        this.set("_userTree", data.tree);
        this.trigger("decisionTreeDataFetched", data.tree);
        this.set("_userTableData", data);
        this.trigger("tableDataFetched", data);
        this.setScore(data.score);
        this.trigger("scoreUpdated", data.score);
        this.markAsComplete();
        console.log("submitScore");
      } else {
        this.showGameLink();
        this.trigger("noScoreAvailable");
      }
    } catch (error) {
      console.error("Error fetching score:", error);
      this.showGameLink();

      this.trigger("noScoreAvailable");
    }
  }
  setScore(score) {
    this.set("_score", score);
  }

  /**
   * @param {string} [type] 'hard' resets _isComplete and _isInteractionComplete, 'soft' resets _isInteractionComplete only.
   * @param {boolean} [canReset] Defaults to this.get('_canReset')
   * @returns {boolean}
   */
  reset(type = "hard", canReset = this.get("_canReset")) {
    const wasReset = super.reset(type, canReset);
    if (!wasReset) return false;
    this.set({
      _isAtLeastOneCorrectSelection: false,
      _isCorrect: null,
    });
    return true;
  }

  markGenericAnswers() {
    this.get("_items").forEach((item) => {
      item._isCorrect = true;
    });
  }
  setupQuestionItemIndexes() {
    this.get("_items").forEach((item, index) => {
      if (item._index === undefined) item._index = index;
      if (item._answerIndex === undefined) item._answerIndex = -1;
    });
  }

  restoreUserAnswers() {
    if (!this.get("_isSubmitted")) return;

    const userAnswer = this.get("_userAnswer");
    const genericAnswers = this.get("_answers");
    this.get("_items").forEach((item) => {
      const answerIndex = userAnswer[item._index];
      if (answerIndex >= mlgameModel.genericAnswerIndexOffset) {
        item.userAnswer =
          genericAnswers[
            answerIndex - mlgameModel.genericAnswerIndexOffset
          ];
        item._answerIndex = answerIndex;
      } else if (answerIndex > -1) {
        item.userAnswer = item._answers[answerIndex];
        item._answerIndex = answerIndex;
      } else {
        if (item.userAnswer === undefined) item.userAnswer = "******";
        item._answerIndex = -1;
      }
      if (item.userAnswer instanceof Array)
        item.userAnswer = item.userAnswer[0];
    });

    this.setQuestionAsSubmitted();
    this.markQuestion();
    this.setScore();
    this.setupFeedback();
  }

  setupRandomisation() {
    if (!this.get("_isRandom") || !this.get("_isEnabled")) return;

    this.set("_items", _.shuffle(this.get("_items")));
  }

  canSubmit() {
    return this.get("_items").every(({ userAnswer }) => userAnswer);
  }
  setItemUserAnswer(itemIndex, userAnswer) {
    const item = this.get("_items")[itemIndex];
    if ($.isNumeric(userAnswer)) {
      item.userAnswer = userAnswer;
    } else {
      item.userAnswer = "";
      item._isCorrect = false;
    }
    this.checkCanSubmit();
  }

  storeUserAnswer() {
    const items = this.get("_items");

    this.isCorrect();

    const userAnswer = new Array(items.length);
    items.forEach(
      ({ _index, _answerIndex }) => (userAnswer[_index] = _answerIndex)
    );
    this.set("_userAnswer", userAnswer);
  }

  isCorrect() {
    return true;
  }

  isPartlyCorrect() {
    return this.get("_isAtLeastOneCorrectSelection");
  }

  markGenericAnswers() {
    let numberOfCorrectAnswers = 0;
    const correctAnswers = this.get("_answers").slice();
    const usedAnswerIndexes = [];

    this.get("_items").forEach((item) => {
      correctAnswers.forEach((answerGroup, answerIndex) => {
        if (usedAnswerIndexes.includes(answerIndex)) return;

        if (this.checkAnswerIsCorrect(answerGroup, item.userAnswer) === false)
          return;

        usedAnswerIndexes.push(answerIndex);
        item._isCorrect = true;
        item._answerIndex =
          answerIndex + mlgameModel.genericAnswerIndexOffset;

        this.set({
          _numberOfCorrectAnswers: ++numberOfCorrectAnswers,
          _isAtLeastOneCorrectSelection: true,
        });
      });
      if (!item._isCorrect) item._isCorrect = false;
    });
  }

  markSpecificAnswers() {
    this.get("_items").forEach((item) => {
      item._isCorrect = true;
    });
  }

  checkAnswerIsCorrect(possibleAnswers, userAnswer) {
    const uAnswer = this.cleanupUserAnswer(userAnswer);

    const answerIsCorrect = possibleAnswers.some((cAnswer) => {
      return this.cleanupUserAnswer(cAnswer) === uAnswer;
    });
    return answerIsCorrect;
  }

  cleanupUserAnswer(userAnswer) {
    if (this.get("_allowsAnyCase")) {
      userAnswer = userAnswer.toLowerCase();
    }
    if (this.get("_allowsPunctuation")) {
      userAnswer = userAnswer.replace(/[.,-/#!$£%^&*;:{}=\-_`~()]/g, "");

      userAnswer = userAnswer.replace(/(  +)+/g, " ");
    }

    return userAnswer.trim();
  }
  pollForScore() {
    const pollInterval = 10000;
    this.pollingIntervalId = setInterval(() => {
      this.fetchScore();
    }, pollInterval);
  }
  setScore(score) {
    this.set("_score", score);
  }

  markAsComplete() {
    this.set("_isComplete", true);
  }

  resetUserAnswer() {
    this.get("_items").forEach((item) => {
      item._isCorrect = false;
      item.userAnswer = "";
    });
  }

  showGameLink() {
    const gameLink =
      "https://mlgame.learndata.info/game/63cf10e9631a60aab279c391/";
    this.set("_gameLink", gameLink);
  }

  clearPolling() {
    clearInterval(this.pollingIntervalId);
  }

  /**
   * used by adapt-contrib-spoor to get the user's answers in the format required by the cmi.interactions.n.student_response data field
   * returns the user's answers as a string in the format 'answer1[,]answer2[,]answer3'
   * the use of [,] as an answer delimiter is from the SCORM 2004 specification for the fill-in interaction type
   */

  getResponse() {
    return this.get("_items")
      .map(({ userAnswer }) => userAnswer)
      .join("[,]");
  }

  /**
   * used by adapt-contrib-spoor to get the type of this question in the format required by the cmi.interactions.n.type data field
   */
  getResponseType() {
    return "fill-in";
  }
}

mlGameModel.genericAnswerIndexOffset = 65536;

export default mlGameModel;
