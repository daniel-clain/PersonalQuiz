/* import { async, TestBed } from '@angular/core/testing';
import { QuizService, QuestionWithRating } from './quiz.service'
import { Question } from 'src/app/models/question';

describe('QuizService', () => {
    describe('getRandomQuestions', () => {

        beforeEach(async(() => {
            TestBed.configureTestingModule({providers: [QuizService]})
        }))

        it('should take a rated questions object and return a list of questions', () => {
            
            const quizInstance: QuizService = TestBed.get(QuizService);
            const questionsWithRating: QuestionWithRating[] = [
                {value: 'x', correctAnswer: 'x', dateUpdated: new Date, id: 'x', rating: 1, tag: {id: 'x', value: 'x'}},
                {value: 'x', correctAnswer: 'x', dateUpdated: new Date, id: 'x', rating: 2, tag: {id: 'x', value: 'x'}},
                {value: 'x', correctAnswer: 'x', dateUpdated: new Date, id: 'x', rating: 3, tag: {id: 'x', value: 'x'}},
            ]
            const result: Question[] = quizInstance.getRandomQuestions(questionsWithRating)

            expect(result.length).toBeTruthy()
        })

        xit('should have a higher probability to return questions with a low rating', () => {

        })


    })
}) */
