import QuestionModel from "core/js/models/questionModel";
import Adapt from "core/js/adapt";

class mlGameModel extends QuestionModel {
  initialize(...args) {
    super.initialize(...args);

    this.get("_buttons")._submit.buttonText = "Awaiting Score";
    const userId = Adapt.spoor.scorm.scorm.get("cmi.core.student_id");
    this.set("_userId", userId);
    if (this.get("testUserId")) {
      this.set("_userId", this.get("testUserId"));
    }
    this.set("_maxScore", 600);
    this.set("_canSubmit", false);
  }

  async fetchScore() {
    const baseUrl = this.get("baseUrl");
    const gameId = this.get("gameId");
    const userId = this.get("_userId");
    const url = baseUrl + gameId + "/result?userId=" + userId;

    try {
      const response = await fetch(url);
      const data = await response.json();
      if (data && data.score !== undefined && data.score !== null) {
        this.set('_canSubmit',true);
        this.set("_userTree", data.tree);
        this.trigger("decisionTreeDataFetched", data.tree);
        this.set("_userTableData", data);
        this.setQuestionAsSubmitted();
        this.markQuestion();
        this.trigger("tableDataFetched", data);
        this.setScore(data.score);
        this.trigger("scoreUpdated", data.score);
        this.markAsComplete();
        this.setupFeedback();
      } else {
        this.showGameLink();
        setTimeout(() => this.fetchScore(), 5000);
        this.trigger("noScoreAvailable");
      }
    } catch (error) {
      console.error("Error fetching score:", error);
      this.showGameLink();
      this.trigger("noScoreAvailable");
      setTimeout(() => this.fetchScore(), 5000);
    }
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

  restoreUserAnswers() {
    if (!this.get("_isSubmitted")) return;
    const userAnswer = this.get("_userAnswer");
    const genericAnswers = this.get("_answers");
    this.get("_items").forEach((item) => {
      const answerIndex = userAnswer[item._index];
      if (answerIndex >= mlgameModel.genericAnswerIndexOffset) {
        item.userAnswer =
          genericAnswers[answerIndex - mlgameModel.genericAnswerIndexOffset];
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
    return this.get("_canSubmit");
  }

  canReset() {
    return false;
  }

  isCorrect() {
    return true;
  }

  isPartlyCorrect() {
    return true;
  }

  setScore(score) {
    if (typeof score === "number" && !isNaN(score)) {
      this.set("_score", score);

      if (Adapt.spoor && Adapt.spoor.scorm && Adapt.spoor.scorm.scorm) {
        Adapt.spoor.scorm.scorm.set("cmi.core.score.raw", score);
      }
    } else {
      console.warn(
        "Invalid or undefined score, not updating SCORM score:",
        score
      );
    }
  }
  get maxScore() {
    return 600;
  }

  /**
   * @type {number}
   */
  get minScore() {
    return 0;
  }

  markAsComplete() {
    this.set("_isComplete", true);
  }

  resetUserAnswer() {
    // TODO
  }

  showGameLink() {
    const gameLink =
      "https://mlgame.learndata.info/game/63cf10e9631a60aab279c391/";
    this.set("_gameLink", gameLink);
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
