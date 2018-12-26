import { Component, OnInit } from '@angular/core';
import { QuizService } from 'src/app/services/quiz/quiz.service';
import { Quiz, QuestionAndAnswer } from 'src/app/models/quiz';
import { FormGroup, FormControl } from '@angular/forms';
import { Answer } from 'src/app/models/answer';
import { Observable } from 'rxjs';
import { Question } from 'src/app/models/question';
import { CategoryService } from 'src/app/services/category/category.service';
import { Category } from 'src/app/models/category';

@Component({
  selector: 'app-quiz',
  templateUrl: './quiz.component.html',
  styleUrls: ['./quiz.component.scss']
})
export class QuizComponent implements OnInit {

  quiz: Quiz;
  questionNumber: number;
  showCorrectAnswer = false;
  showQuizResults = false;
  selectedQuiz: Quiz;
  selectedQuestion: Question;
  selectedSubsection: string;
  questionsInQuiz: number;
  categories: Category[]

  quizzes$: Observable<Quiz[]>

  questionAnswerForm = new FormGroup({
    value: new FormControl('')
  });

  constructor(private _quizService: QuizService, private _categoryService: CategoryService) {
    this.questionsInQuiz = this._quizService.questionsInQuiz    
    this._categoryService.categories$.subscribe((categories: Category[]) => {
      this.categories = categories
    })
  }

  async ngOnInit(){
    this.quizzes$ = this._quizService.quizzes$
    this.quiz = await this._quizService.generateQuiz();
    this.questionNumber = 1;
  }

  startNewQuiz(){
    this.showQuizResults = false;
    delete this.quiz;
    delete this.questionNumber
    this._quizService.generateQuiz().then((quiz: Quiz) => {
      this.quiz = quiz;
      this.questionNumber = 1;
    })
  }
  
  
  submitAnswer(){
    const answer: Answer =
    Object.assign(this.questionAnswerForm.value, {
      markedAs: undefined
    })
    const question: QuestionAndAnswer = this.quiz.questionsAndAnswers[this.questionNumber - 1]
    question.answer = answer;
  }

  markAnswer(answerMarking){
    const {answer}: QuestionAndAnswer = 
      this.quiz.questionsAndAnswers[this.questionNumber - 1];
    answer.markedAs = (answerMarking === 'correct' ? true : false);
  }

  nextQuestion(){
    this.questionAnswerForm.reset();
    this.questionNumber ++;

  }

  completeQuiz(){
    this.questionAnswerForm.reset();
    this._quizService.saveQuizResults(this.quiz)
    .then((savedQuiz: Quiz) => {
      this.showQuizResults = true;
      this.setSubsection('Quizzes List')
      this.selectedQuiz = savedQuiz
    })
  }

  
  selectQuiz(quiz){
    this.selectedQuiz = Object.assign({}, quiz);
  }

  
  selectQuestion(question){
    this.selectedQuestion = Object.assign({}, question);
  }

  getQuizMark(questionsAndAnswers: QuestionAndAnswer[]){
    let quizMark: number;
    quizMark = questionsAndAnswers.reduce((mark: number, questionAndAnswer: QuestionAndAnswer) => {
      if(questionAndAnswer.answer.markedAs) mark++
      return mark
    }, 0)
    return quizMark
  }

  
  setSubsection(subsection){
    this.selectedSubsection = subsection
  }


}
