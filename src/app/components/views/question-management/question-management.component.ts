import { Component, OnInit } from '@angular/core';
import { Observable } from 'rxjs';
import { Question } from 'src/app/models/question';
import { Tag } from 'src/app/models/tag';
import { QuestionService } from 'src/app/services/question/question.service';
import { TagService } from 'src/app/services/tag/tag.service';


@Component({
  selector: 'app-question-management',
  templateUrl: './question-management.component.html'
})
export class QuestionManagementComponent implements OnInit {

  questions$: Observable<Question[]>
  tags$: Observable<Tag[]>

  selectedSubsection: string;
  selectedQuestion: Question;

  newQuestion: Question = {
    id: null,
    value: null,
    correctAnswer: null,
    tags: [],
    dateUpdated: null
  }

  constructor(private _questionService: QuestionService, private _tagService: TagService) { }

  ngOnInit() {
    this.questions$ = this._questionService.questions$;
    this.tags$ = this._tagService.tags$
  }

  toggleQuestionTag(question: Question, clickedTag: Tag){
    const questionAlreadyHasTag = question.tags.find((tag: Tag) => tag.id === clickedTag.id)
    if(questionAlreadyHasTag)
      question.tags = question.tags.filter((tag: Tag) => tag.id !== clickedTag.id)
    else
      question.tags.push(clickedTag)
  }

  doesQuestionHaveTag(question: Question, tag: Tag): boolean{
    return !!question.tags.find((questionTag: Tag) => questionTag.id === tag.id)
  }


  submitNewQuestion() {
    const question: Question = Object.assign({}, this.newQuestion)
    question.dateUpdated = new Date
    this._questionService.add(question).then(() => {
      console.log('new question saved')
      this.resetNewQuestion()
    })
  }

  resetNewQuestion(){
    this.newQuestion = {
      id: null,
      value: null,
      correctAnswer: null,
      tags: [],
      dateUpdated: null
    }
  }

  submitUpdatedQuestion() {
    this.selectedQuestion.dateUpdated = new Date
    this._questionService.update(this.selectedQuestion).then(() => console.log('question has been saved'))
  }

  deleteQuestion() {
    const deleteConfirmed: boolean = window.confirm(
      `Are you sure you want to delete question: \n\n ${this.selectedQuestion.value}`)

    if (deleteConfirmed) {
      this._questionService.delete(this.selectedQuestion).then(() => console.log('question deleted'))
    }
  }

  selectQuestion(question) {
    this.selectedQuestion = Object.assign({}, question);
  }

  setSubsection(subsection) {
    this.selectedSubsection = subsection
    delete this.selectedQuestion;
  }

}
