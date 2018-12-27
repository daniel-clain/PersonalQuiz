import { Injectable } from '@angular/core';
import { Question, QuestionFlat } from 'src/app/models/question';
import { DataService } from '../data/data.service';
import { CategoryService } from '../category/category.service';
import { Category } from 'src/app/models/category';
import { DocumentReference, DocumentSnapshot, QueryDocumentSnapshot } from 'angularfire2/firestore';
import { Observable } from 'rxjs';
import { switchMap } from 'rxjs/operators';
import { CollectionNames } from 'src/app/models/collection-enum';

@Injectable({
  providedIn: 'root'
})
export class QuestionService {

  constructor(private _dataService: DataService, private _categoryService: CategoryService) { }

  get questions$(): Observable<Question[]> {
    return this._dataService.getCollectionData(CollectionNames.Questions).pipe(switchMap(
      (questionsSnapshot: QueryDocumentSnapshot<QuestionFlat>[]) => {
        return new Observable((subscriber) => {

          const questionPromises: Promise<Question>[] =
            questionsSnapshot.map((questionsSnapshot: DocumentSnapshot<QuestionFlat>) => {
              const flatQuestion: QuestionFlat = questionsSnapshot.data();
              return this.convertToNormalQuestion(flatQuestion, questionsSnapshot.id)
            })

          Promise.all(questionPromises).then((questions: Question[]) => {
            subscriber.next(questions)
          })
        })

      }
    ))
  }

  getQuestionById(id): Promise<Question> {
    return this._dataService.getCollectionDataById(CollectionNames.Questions, id)
      .then((flatQuestion: QuestionFlat) => this.convertToNormalQuestion(flatQuestion, id))

  }

  add(question: Question): Promise<string> {
    const flatQuestion: QuestionFlat = this.convertToFlatQuestion(question)
    return this._dataService.addToCollection(CollectionNames.Questions, flatQuestion)
  }

  update(question: Question) {
    const flatQuestion: QuestionFlat = this.convertToFlatQuestion(question)
    return this._dataService.updateInCollection(CollectionNames.Questions, question.id, flatQuestion)
      .then(() => console.log('question updated'))
  }

  delete(question: Question): Promise<void> {
    return this._dataService.deleteFromCollection(CollectionNames.Questions, question.id)
  }



  convertToNormalQuestion(question: QuestionFlat, id): Promise<Question> {
    return this._categoryService.getCategoryById(question.categoryId)
      .then((category: Category) => {
        const normalQuestion: Question = {
          id: id,
          category: category,
          value: question.value,
          correctAnswer: question.correctAnswer,
          dateUpdated: question.dateUpdated.toDate(),

        }
        return normalQuestion
      },
      )

  }

  convertToFlatQuestion(question: Question): QuestionFlat {
    const flatQuestion: QuestionFlat = {
      value: question.value,
      dateUpdated: new Date,
      categoryId: question.category.id,
      correctAnswer: question.correctAnswer
    }
    return flatQuestion
  }
}
