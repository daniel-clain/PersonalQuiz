import { Component, OnInit } from '@angular/core';
import { Observable, of } from 'rxjs';
import { AuthService } from 'src/app/services/auth/auth.service';
import { FormGroup, FormControl } from '@angular/forms';
import { Question, QuestionFlat } from 'src/app/models/question';
import { switchMap, map } from 'rxjs/operators';
import { Category, CategoryFlat } from 'src/app/models/category';
import { AngularFirestore, QueryDocumentSnapshot, DocumentData, DocumentSnapshot } from 'angularfire2/firestore';
import { AngularFireAuth } from 'angularfire2/auth';
import { DataService } from 'src/app/services/data/data.service';
import { QuestionService } from 'src/app/services/question/question.service';
import { CategoryService } from 'src/app/services/category/category.service';


@Component({
  selector: 'app-question-management',
  templateUrl: './question-management.component.html'
})
export class QuestionManagementComponent implements OnInit {

  questions$: Observable<Question[]>
  categories$: Observable<Category[]>

  newQuestionForm = new FormGroup({
    value: new FormControl(''),
    correctAnswer: new FormControl(''),
    category: new FormControl('')
  });

  selectedSubsection: string;
  selectedQuestion: Question;


  constructor(private _authService: AuthService, private _afs: AngularFirestore, private _afa: AngularFireAuth, private _dataService: DataService, private _questionService: QuestionService, private _categoryService: CategoryService) { }


  ngOnInit() {
    this.questions$ = this._questionService.questions$;

    this.categories$ = this._categoryService.categories$


  }
  compareCategorySelect(selectCategory: Category, questionCategory: Category) {
    return selectCategory && questionCategory && selectCategory.id === questionCategory.id
  }


  submitNewQuestion() {
    const {value, category, correctAnswer} = this.newQuestionForm.value
    const question: Question = {
      id: null,
      value: value,
      category: category,
      correctAnswer: correctAnswer,
      dateUpdated: new Date,
    }
    this._questionService.add(question).then(() => {
      console.log('new question saved')
      this.newQuestionForm.reset()
    })

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
  }

}
