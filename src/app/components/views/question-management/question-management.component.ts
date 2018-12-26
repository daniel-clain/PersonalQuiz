import { Component, OnInit } from '@angular/core';
import { QuestionsService } from 'src/app/services/questions/questions.service';
import { Observable } from 'rxjs';
import { AuthService } from 'src/app/services/auth/auth.service';
import { FormGroup, FormControl } from '@angular/forms';
import { Question } from 'src/app/models/question';
import { User } from 'firebase';
import { map } from 'rxjs/operators';
import { CategoryService } from 'src/app/services/category/category.service';
import { Category } from 'src/app/models/category';


@Component({
  selector: 'app-question-management',
  templateUrl: './question-management.component.html'
})
export class QuestionManagementComponent implements OnInit {

  selectedQuestion: Question;
  questions$: Observable<Question[]>
  selectedSubsection: string;
  categories: Category[];
  
  newQuestionForm = new FormGroup({
    value: new FormControl(''),
    correctAnswer: new FormControl(''),
    category: new FormControl('')
  });

  constructor(private _questionService: QuestionsService, private _authService: AuthService, private _categoryService: CategoryService) {}


  ngOnInit() {

    this.questions$ = this._questionService.questions$

    this._categoryService.categories$.subscribe((categories: Category[]) => {
      this.categories = categories
    })



  }


  loginWithPopup(){
    this._authService.loginWithPopup()
  }

  submitNewQuestion(){
    const subscription = this._authService.user
    .pipe(map((user: User) => user.uid)).subscribe(

      (userId: string) => {
        const newQuestion: Question =
        Object.assign(this.newQuestionForm.value, {
          userId: userId,
          dateUpdated: new Date()
        })

        this._questionService.addNewQuestion(newQuestion)
        .then(() => this.newQuestionForm.reset())

        subscription.unsubscribe()
      }
    )    
  }
  submitUpdatedQuestion(){
    const subscription = this.questions$.subscribe(
      (questions: Question[]) => {
        const questionToUpdate = questions.find(question => question.id === this.selectedQuestion.id);
        
        questionToUpdate.value = this.selectedQuestion.value
        questionToUpdate.category = this.selectedQuestion.category
        questionToUpdate.correctAnswer = this.selectedQuestion.correctAnswer
        questionToUpdate.dateUpdated = new Date()

        this._questionService.updateQuestion(questionToUpdate)
        subscription.unsubscribe()
      }
    )
  }

  selectQuestion(question){
    this.selectedQuestion = Object.assign({}, question);
  }

  deleteQueston(questionId){

    const deleteConfirmed: boolean = window.confirm(`Are you sure you want to delete question: \n\n "${this.selectedQuestion.value}`)

    if(deleteConfirmed){
      this._questionService.deleteQuestion(questionId)
      .then(function() {
        console.log("Document successfully deleted!");
      }).catch(function(error) {
        console.error("Error removing document: ", error);
      });
    }
  }

  setSubsection(subsection){
    this.selectedSubsection = subsection
  }

}
