import { TagService } from 'src/app/services/tag/tag.service';
import { QuestionService } from './../question/question.service';
import { AnswerService } from './../answer/answer.service';
import { DataService } from './../data/data.service';
import { async, TestBed } from '@angular/core/testing';
import { QuizService } from './quiz.service';

class MockDataService extends DataService {
  
}
class MockAnswerService extends AnswerService {}
class MockQuestionService extends QuestionService {}
class MockTagService extends TagService {}

describe('QuizService', () => {
  let quizService: QuizService = new QuizService(MockDataService, MockAnswerService, MockQuestionService, MockTagService);

  /* beforeEach(async() => {
    TestBed.configureTestingModule({
      providers: [
        QuizService,
        { provide: DataService, useValue: MockDataService },
        { provide: AnswerService, useValue: MockAnswerService },
        { provide: QuestionService, useValue: MockQuestionService },
        { provide: TagService, useValue: MockTagService }
      ]
    });
    quizService = TestBed.get(QuizService);
    console.log('quizService :', quizService);
  }); */

  describe('test', () => {
    it('should add 2 and 5 and the result should be 7', () => {
      const testResult = quizService.test(2, 5);
      expect(testResult).toBe(7);
    });
  });
});
