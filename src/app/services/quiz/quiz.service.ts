import { Injectable } from '@angular/core';
import { Quiz, QuestionAndAnswer, QuestionAndAnswerIds, QuizFlat } from 'src/app/models/quiz';
import { Question } from 'src/app/models/question';
import { Answer } from 'src/app/models/answer';
import { DocumentSnapshot, QueryDocumentSnapshot } from 'angularfire2/firestore';
import { Observable } from 'rxjs';
import { AnswerService } from '../answer/answer.service';
import { switchMap } from 'rxjs/operators';
import { DataService } from '../data/data.service';
import { QuestionService } from '../question/question.service';
import { Category } from 'src/app/models/category';
import { CollectionNames } from 'src/app/models/collection-enum';
export interface QuestionWithRating extends Question {
  id: string;
  category: Category;
  value: string;
  correctAnswer: string;
  dateUpdated: Date;
  rating: 1 | 2 | 3 | 4 | 5;
}
interface TimesQuestionAnswered {
  total: number;
  correctCount: number;
}
@Injectable({
  providedIn: 'root'
})
export class QuizService {

  questionsInQuiz = 2;
  quizzes: Quiz[] = [];

  constructor(private _dataService: DataService, private _questionService: QuestionService, private _answerService: AnswerService) { }

  get quizzes$(): Observable<Quiz[]> {
    return this._dataService.getCollectionData(CollectionNames.Quizzes).pipe(switchMap(
      (quizzesSnapshots: QueryDocumentSnapshot<QuizFlat>[]) => {
        return new Observable((subscriber) => {

          const quizPromises: Promise<Quiz>[] =
            quizzesSnapshots.map((quizSnapshot: DocumentSnapshot<QuizFlat>) => {
              const question: QuizFlat = quizSnapshot.data();
              return this.convertToNormalQuiz(question, quizSnapshot.id)
            })

          Promise.all(quizPromises).then((quizzes: Quiz[]) => {
            subscriber.next(quizzes)
          })
        })

      }
    ))
  }

  get quizzesFlat$(): Observable<QuizFlat[]> {
    return this._dataService.getCollectionData(CollectionNames.Quizzes).pipe(switchMap(
      (quizzesSnapshots: QueryDocumentSnapshot<QuizFlat>[]) => {
        return Promise.all(
          quizzesSnapshots.map(
            (quizSnapshot: QueryDocumentSnapshot<QuizFlat>) => {
              const quizFlat: QuizFlat = quizSnapshot.data()
              return quizFlat
            }
          )
        )
      }
    ))
  }

  add(quiz: Quiz): Promise<string> {
    quiz.dateCompleted = new Date
    const flatQuiz: QuizFlat = this.convertToFlatQuiz(quiz)
    return this._dataService.addToCollection(CollectionNames.Quizzes, flatQuiz)
  }

  update(quiz: Quiz) {
    const flatQuiz: QuizFlat = this.convertToFlatQuiz(quiz)
    return this._dataService.updateInCollection(CollectionNames.Quizzes, quiz.id, flatQuiz)
      .then(() => console.log('quiz updated'))
  }

  delete(quiz: Quiz): Promise<void> {
    return this._dataService.deleteFromCollection(CollectionNames.Quizzes, quiz.id)
  }

  convertToNormalQuiz(quiz: QuizFlat, id): Promise<Quiz> {
    return Promise.all(
      quiz.questionsAndAnswersIds.map(
        (questionAndAnswerIds: QuestionAndAnswerIds): Promise<QuestionAndAnswer> => {
          return Promise.all([
            this._questionService.getQuestionById(questionAndAnswerIds.questionId),
            this._answerService.getAnswerById(questionAndAnswerIds.answerId)
          ]).then((x: [Question, Answer]) => (<QuestionAndAnswer>{ question: x[0], answer: x[1] }))
        }
      )
    )
      .then((questionAndAnswers: QuestionAndAnswer[]) => {
        const normalQuiz: Quiz = {
          id: id,
          questionsAndAnswers: questionAndAnswers,
          dateCompleted: quiz.dateCompleted.toDate()
        }
        return normalQuiz
      })
  }

  convertToFlatQuiz(quiz: Quiz): QuizFlat {
    const questionsAndAnswersIds = quiz.questionsAndAnswers.map(
      (questionAndAnswer: QuestionAndAnswer): QuestionAndAnswerIds => {
        return {
          questionId: questionAndAnswer.question.id,
          answerId: questionAndAnswer.answer.id
        }
      }
    )
    const flatQuiz: QuizFlat = {
      questionsAndAnswersIds: questionsAndAnswersIds,
      dateCompleted: quiz.dateCompleted,
    }
    return flatQuiz
  }

  generateQuiz(): Promise<Quiz> {
    return this.decideQuizQuestions().then(
      (questionsAndAnswers: QuestionAndAnswer[]) => {
        const quiz: Quiz = {
          id: null,
          dateCompleted: null,
          questionsAndAnswers: questionsAndAnswers
        }
        return quiz
      }
    )
  }

  decideQuizQuestions(): Promise<QuestionAndAnswer[]> {
    return new Promise((resolve, reject) => {
      const subscription = this._questionService.questions$.subscribe(
        (questions: Question[]) => {
          subscription.unsubscribe()
          this.rateQuestions(questions).then(
            (ratedQuestions: QuestionWithRating[]) => {
              const randomQuestions: Question[] = this.getRandomQuestions(ratedQuestions)
              const quizQuestions: QuestionAndAnswer[] = randomQuestions.map((question: Question) => {
                return {
                  question: question,
                  answer: undefined
                }
              })
              resolve(quizQuestions);
            }
          )
        }
      )
    })
  }

  getRandomQuestions(ratedQuestions: QuestionWithRating[]): Question[] {
    const questions: Question[] =
      ratedQuestions
        .map((question: QuestionWithRating) => {
          let ques = Object.assign(question)
          ques.selectionRandomValue = Math.floor(Math.random() * ques.rating)
          console.log(`question: ${question.value}, randomValue: ${ques.selectionRandomValue}`);
          return ques
        })
        .sort((a, b) => a.selectionRandomValue - b.selectionRandomValue)
        .slice(0, this.questionsInQuiz)
        .map((question: QuestionWithRating) => {
          delete question.rating;
          return <Question>question;
        })

    return questions;
  }

  rateQuestions(questions: Question[]) {

    return Promise.all(questions
      .map(async (question: Question) => {
        let rating;
        let questionWithRating: QuestionWithRating;

        const timesQuestionAnswered: TimesQuestionAnswered = await this.getTimesQuestionAnswered(question.id)
        const { total, correctCount } = timesQuestionAnswered

        if (total === 0) {
          rating = 2;
        } else {
          const percentageCorrect = correctCount / total * 100;
          rating = Math.floor(percentageCorrect / 100 * 5)
        }
        console.log(`question: ${question.value} has been answered correctly ${correctCount} out of ${total}. It has a selection rating of ${rating}`);

        questionWithRating = Object.assign({ rating: rating }, question)

        return questionWithRating
      })
    )
  }

  getTimesQuestionAnswered(questionId): Promise<TimesQuestionAnswered> {
    return new Promise((resolve, reject) => {
      const subscription = this.quizzesFlat$.subscribe((quizzes: QuizFlat[]) => {
        subscription.unsubscribe();
        const { timesQuestionAnswered, getAnswerPromises } = quizzes.reduce(
          (x, quiz: QuizFlat) => {
            quiz.questionsAndAnswersIds.forEach((qaid: QuestionAndAnswerIds) => {
              if (qaid.questionId == questionId) {
                x.timesQuestionAnswered.total++
                x.getAnswerPromises.push(this._answerService.getAnswerById(qaid.answerId))
              }
            })
            return x;
          }, { timesQuestionAnswered: { total: 0, correctCount: 0 }, getAnswerPromises: [] }
        )
        Promise.all(<Promise<Answer>[]>getAnswerPromises)
          .then((answers: Answer[]) => {
            timesQuestionAnswered.correctCount = answers.reduce((count, answer: Answer) => {
              answer.correct == true ? count++ : null
              return count
            }, 0)
            resolve(timesQuestionAnswered)
          })
      })
    })
  }

  saveQuizResults(quiz: Quiz): Promise<Quiz> {
    return this.saveAnswers(quiz)
      .then((quiz: Quiz) => {
        quiz.dateCompleted = new Date
        return this.add(quiz)
      })
      .then(quizId => {
        quiz.id = quizId
        return quiz
      })
  }

  saveAnswers(quiz: Quiz): Promise<Quiz> {
    return Promise.all(quiz.questionsAndAnswers.map(
      (questionAndAnswer: QuestionAndAnswer): Promise<QuestionAndAnswer> => {
        return this._answerService.add(questionAndAnswer.answer)
          .then((answerId: string): QuestionAndAnswer => {
            questionAndAnswer.answer.id = answerId
            return questionAndAnswer
          })
      }
    )).then((questionsAndAnswers: QuestionAndAnswer[]): Quiz => {
      quiz.questionsAndAnswers = questionsAndAnswers
      return quiz
    })
  }

}
