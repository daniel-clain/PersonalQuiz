import { Component, OnInit } from '@angular/core';
import { QuizService } from 'src/app/services/quiz/quiz.service';
import { Quiz, QuestionAndAnswer } from 'src/app/models/quiz';
import { FormGroup, FormControl } from '@angular/forms';
import { Answer } from 'src/app/models/answer';
import { Observable } from 'rxjs';
import { Question } from 'src/app/models/question';
import { Tag } from 'src/app/models/tag';
import { TagService } from 'src/app/services/tag/tag.service';
import { QuizStates } from 'src/app/enums/quiz-states-enum';

@Component({
  selector: 'app-quiz',
  templateUrl: './quiz.component.html',
  styleUrls: ['./quiz.component.scss']
})
export class QuizComponent implements OnInit {


  quizState: QuizStates;

  questionNumber: number;
  showCorrectAnswer = false;
  selectedQuiz: Quiz;
  selectedQuestion: Question;
  questionsInQuiz: number;
  tags$: Observable<Tag[]>;
  quizzes$: Observable<Quiz[]>;

  newQuiz: Quiz = {
    id: null,
    questionsAndAnswers: [],
    dateCompleted: null,
    tags: []
  };


  questionAnswerForm = new FormGroup({
    value: new FormControl('')
  });


  constructor(private _quizService: QuizService, private _tagService: TagService) {
  }

  ngOnInit() {
    this.quizState = QuizStates['Ready To Start'];

    this.quizzes$ = this._quizService.quizzes$;
    this.tags$ = this._tagService.tags$;
    this.questionsInQuiz = this._quizService.questionsInQuiz;
  }

  startQuiz() {
    this._quizService.generateQuizQuestions(this.newQuiz.tags)
    .then((questionsAndAnswers: QuestionAndAnswer[]) => {
      this.newQuiz.questionsAndAnswers = questionsAndAnswers;
      this.quizState = QuizStates['Quiz In Progress'];
      this.questionNumber = 1;
    })
    .catch(() => this.quizState = QuizStates['Not Enough Questions']);
  }


  submitAnswer() {
    const answer: Answer = {
      id: undefined,
      value: this.questionAnswerForm.value.value,
      correct: undefined,
    };
    const question: QuestionAndAnswer = this.newQuiz.questionsAndAnswers[this.questionNumber - 1];
    question.answer = answer;
  }

  markAnswer(answerMarking) {
    const {answer}: QuestionAndAnswer =
      this.newQuiz.questionsAndAnswers[this.questionNumber - 1];
    answer.correct = (answerMarking === 'correct' ? true : false);
  }

  nextQuestion() {
    this.questionAnswerForm.reset();
    this.questionNumber ++;

  }

  completeQuiz() {
    this.questionAnswerForm.reset();
    this._quizService.saveQuizResults(this.newQuiz)
    .then((savedQuiz: Quiz) => {
      console.log('savedQuiz :', savedQuiz);
      this.selectedQuiz = savedQuiz;
      delete this.questionNumber;
      this.quizState = QuizStates['Post-Quiz Summary'];
      this.newQuiz = {
        id: null,
        questionsAndAnswers: [],
        dateCompleted: null,
        tags: []
      };
    });
  }


  selectQuiz(quiz) {
    this.selectedQuiz = Object.assign({}, quiz);
  }


  selectQuestion(question) {
    this.selectedQuestion = Object.assign({}, question);
  }

  getQuizMark(questionsAndAnswers: QuestionAndAnswer[]) {
    let quizMark: number;
    quizMark = questionsAndAnswers.reduce((mark: number, questionAndAnswer: QuestionAndAnswer) => {
      if (questionAndAnswer.answer.correct) { mark++; }
      return mark;
    }, 0);
    return quizMark;
  }


  doesQuestionHaveTag(question: Question, tag: Tag): boolean {
    return !!question.tags.find((questionTag: Tag) => questionTag.id === tag.id);
  }

  doesQuizHaveTag(quiz: Quiz, tag: Tag): boolean {
    return !!quiz.tags.find((quizTag: Tag) => quizTag.id === tag.id);
  }

  toggleQuizTag(quiz: Question, clickedTag: Tag) {
    const quizAlreadyHasTag = quiz.tags.find((tag: Tag) => tag.id === clickedTag.id);
    if (quizAlreadyHasTag) {
      quiz.tags = quiz.tags.filter((quizTag: Tag) => quizTag.id !== clickedTag.id);
    } else {
      quiz.tags.push(clickedTag);
    }
  }


}
