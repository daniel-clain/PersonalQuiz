import {AuthService} from './../auth/auth.service';
import { TagService } from 'src/app/services/tag/tag.service';
import { QuestionService } from './../question/question.service';
import { AnswerService } from './../answer/answer.service';
import { DataService } from './../data/data.service';
import { async, TestBed } from '@angular/core/testing';
import {QuizService, QuestionWithRating} from './quiz.service';
import { AngularFirestore, AngularFirestoreCollection, DocumentData } from 'angularfire2/firestore';
import { CollectionNames } from 'src/app/enums/collection-names-enum';
import { Observable, Subject, Subscription } from 'rxjs';
import { Tag } from 'src/app/models/tag';
import { Question } from 'src/app/models/question';

class MockDataService extends DataService {
  getCollectionData = () => null;
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



fdescribe('QuizService', () => {
  const quizService: QuizService = new QuizService(
    new MockDataService(null, null),
    new MockAnswerService(null),
    new MockQuestionService(new MockDataService(null, null), new MockTagService(new MockDataService(null, null))),
    new MockTagService(null)
  );


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
      getTimesQuestionAnsweredSpy.getTimesQuestionAnswered.and.returnValue(stubValue);
      const result: Promise<QuestionWithRating[]> = quizService.rateQuestions(questions);
      result.then(promiseVal => {

        console.log('promiseVal :', promiseVal);
        expect(result).toBe(7);
        done();
      });
    });
  });
});
