import { Injectable, OnDestroy } from '@angular/core';
import { Question, QuestionFlat } from 'src/app/models/question';
import { DataService } from '../data/data.service';
import { TagService } from '../tag/tag.service';
import { Tag } from 'src/app/models/tag';
import { DocumentSnapshot, QueryDocumentSnapshot } from 'angularfire2/firestore';
import { Observable, Subject, Subscriber, Subscription } from 'rxjs';
import { switchMap, map, debounceTime, take } from 'rxjs/operators';
import { CollectionNames } from '../../enums/collection-names-enum';

@Injectable({
  providedIn: 'root'
})
export class QuestionService {

  questions: Question[];
  questionUpdates$: Subject<Question[]> = new Subject();
  questionsDataSubscription: Subscription;
  questionDeletedSubject$: Subject<string> = new Subject();

  questions$: Observable<Question[]> = Observable.create((subscriber: Subscriber<Question[]>) => {
    if (!this.questionsDataSubscription) {
      this.setupQuestionsDataSubscription();
    }
    if (this.questions) {
      subscriber.next(this.questions);
    }
    this.questionUpdates$.subscribe((updatedQuestions: Question[]) => {
      subscriber.next(updatedQuestions);
    });
  });



  constructor(private _dataService: DataService, private _tagService: TagService) {
    this._tagService.tagDeletedSubject$.subscribe((id: string) => {
      this.removeTagFromQuestions(id);
    });
  }

  private setupQuestionsDataSubscription() {
    this.questionsDataSubscription = this.getQuestionsData$().subscribe((questions: Question[]) => {
      this.questions = questions;
      console.log('questions updated :', this.questions);
      this.questionUpdates$.next(this.questions);
    });
  }


  private getQuestionsData$(): Observable<Question[]> {
    return this._dataService.getCollectionData(CollectionNames.Questions).pipe(switchMap(
      (questionsSnapshot: QueryDocumentSnapshot<QuestionFlat>[]) => {
        return new Observable((subscriber) => {

          const questionPromises: Promise<Question>[] =
            questionsSnapshot.map((questionsSnapshot: DocumentSnapshot<QuestionFlat>) => {
              const flatQuestion: QuestionFlat = questionsSnapshot.data();
              if (!flatQuestion) {
                throw Error(`question ${questionsSnapshot.id} has no data`);
              }
              return this.convertToNormalQuestion(flatQuestion, questionsSnapshot.id);
            });

          Promise.all(questionPromises).then((questions: Question[]) => {
            subscriber.next(questions);
          });
        });

      }
    ));
  }

  getQuestionById(id): Promise<Question> {
    return new Promise(resolve =>
      this.questions$
      .pipe(
        map((question: Question[]) => {
          const foundQuestion: Question = question.find((questions: Question) => questions.id === id);
          if (!foundQuestion) {
            console.error(`getQuestionById(${id}) found no data`);
          }
          return foundQuestion;
        }),
        debounceTime(1),
        take(1)
      )
      .subscribe((question: Question) => resolve(question))
    );
  }

  add(question: Question): Promise<string> {
    const flatQuestion: QuestionFlat = this.convertToFlatQuestion(question);
    return this._dataService.addToCollection(CollectionNames.Questions, flatQuestion);
  }

  update(question: Question) {
    const flatQuestion: QuestionFlat = this.convertToFlatQuestion(question);
    return this._dataService.updateInCollection(CollectionNames.Questions, question.id, flatQuestion)
      .then(() => console.log('question updated'));
  }

  delete(question: Question): Promise<void> {
    return this._dataService.deleteFromCollection(CollectionNames.Questions , question.id)
    .then(() => this.questionDeletedSubject$.next(question.id));
  }

  convertToNormalQuestion(flatQuestion: QuestionFlat, id): Promise<Question> {
    return Promise.all(flatQuestion.tagIds.map((tagId: string) => this._tagService.getTagById(tagId)))
      .then((tags: Tag[]) => {
        const normalQuestion: Question = {
          id: id,
          tags: tags,
          value: flatQuestion.value,
          correctAnswer: flatQuestion.correctAnswer,
          dateUpdated: flatQuestion.dateUpdated.toDate(),

        };
        return normalQuestion;
      },
    );
  }

  convertToFlatQuestion(question: Question): QuestionFlat {
    const flatQuestion: QuestionFlat = {
      value: question.value,
      dateUpdated: new Date,
      tagIds: question.tags.map((tag: Tag) => tag.id),
      correctAnswer: question.correctAnswer
    };
    return flatQuestion;
  }

  removeTagFromQuestions(id: string): Promise<void> {
    return new Promise(resolve =>
      this.questions$
      .pipe(take(1))
      .subscribe((questions: Question[]) => {
        const updatingQuestionPromises: Promise<void>[] = [];

        questions.forEach((question: Question) => {
          question.tags.forEach((tag: Tag) => {
            if (tag.id === id) {
              const updatedQuestion: Question = Object.assign({}, question);
              updatedQuestion.tags = question.tags.filter(
                (tag: Tag) => tag.id !== id
              );
              console.log(`updating question, removed tag because tag was deleted`, question, updatedQuestion);
              this.update(updatedQuestion);
            }
          });
        });

        Promise.all(updatingQuestionPromises).then(() => resolve());

      })
    );
  }


}
