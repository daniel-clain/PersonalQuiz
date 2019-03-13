
import { TagService } from 'src/app/services/tag/tag.service';
import { QuestionService } from './../question/question.service';
import { AnswerService } from './../answer/answer.service';
import { DataService } from './../data/data.service';
import { async, TestBed } from '@angular/core/testing';
import {QuizService, QuestionWithRating} from './quiz.service';
import {Observable, Subject, Subscription, of} from 'rxjs';
import { Tag } from 'src/app/models/tag';
import { Question } from 'src/app/models/question';
import { CollectionNames } from 'src/app/enums/collection-names-enum';
import { QuizFlat } from 'src/app/models/quiz';

class MockDataService extends DataService {
  getCollectionData = (collectionName: CollectionNames): Observable<any[]> => {
    return new Observable<any[]>();
  }
  transformSnapshot = () => null;
  getCollection = () => null;
  addToCollection = () => null;
  updateInCollection = () => null;
  getCollectionDataById = () => null;
  deleteFromCollection = () => null;
  transformSnapshotSingle = () => null;
}


class MockAnswerService extends AnswerService {}
class MockQuestionService extends QuestionService {
  questionDeletedSubject$: Subject<string> = new Subject();
}
class MockTagService extends TagService {
  tags: Tag[];
  tagUpdates$: Subject<Tag[]> = new Subject();
  tagsDataSubscription: Subscription;
  tagDeletedSubject$: Subject<string> = new Subject();
}




describe('QuizService', () => {
  /* const quizService: QuizService = new QuizService(
    new MockDataService(null, null),
    new MockAnswerService(null),
    new MockQuestionService(new MockDataService(null, null),
    new MockTagService(new MockDataService(null, null))),
    new MockTagService(null)
  ); */

  let quizService: QuizService;

  beforeEach( () => {
    TestBed.configureTestingModule({
      providers: [
        { provide: DataService, useValue: new MockDataService(null, null) },
        { provide: AnswerService, useValue: new MockAnswerService(null) },
        { provide: QuestionService, useValue: new MockQuestionService(null, new MockTagService(null)) },
        { provide: TagService, useValue: new MockTagService(null) },
      ]
    });
    // Inject both the service-to-test and its (spy) dependency
    quizService = TestBed.get(QuizService);
    console.log('quiz service' + quizService);
  });


  xdescribe('test', () => {
    it('should add 2 and 5 and the result should be 7', () => {
      const testResult = quizService.test(2, 5);
      expect(testResult).toBe(7);
    });
  });

  describe('rateQuestions', () => {
    it('should rate question', done => {
      const questions: Question[] = [
        {
          id: 'x',
          value: 'value',
          tags: [],
          correctAnswer: 'correctAnswer',
          dateUpdated: new Date()
        }
      ];
      const getTimesQuestionAnsweredSpy = jasmine.createSpyObj('QuizService', ['getTimesQuestionAnswered']);
      const stubValue = 'stub value';

      spyOnProperty(quizService, 'quizzesFlat$', 'get').and.returnValue(
        Observable.create(observer => {
          const flatQuizzes: QuizFlat[] = [
            {
              dateCompleted:  {seconds: 1547551737, nanoseconds: 592000000},
              questionsAndAnswersIds: [{questionId: 'q1', answerId: 'a1'}],
              tagIds: ['Z3l5qLbLpyFRJ1JGwzAp'],
            }
          ];
          observer.next(flatQuizzes);
        })
      );

      getTimesQuestionAnsweredSpy.getTimesQuestionAnswered.and.returnValue(stubValue);
      const result: Promise<QuestionWithRating[]> = quizService.rateQuestions(questions);
      result.then((promiseVal: QuestionWithRating[]) => {

        console.log('promiseVal :', promiseVal);
        expect(promiseVal).toBeTruthy();
        done();
      });
    });
  });
});
