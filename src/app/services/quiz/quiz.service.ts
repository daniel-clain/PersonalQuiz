import { Injectable } from '@angular/core';
import { Quiz, QuestionAndAnswer, QuizShallow, QuestionAndAnswerIds } from 'src/app/models/quiz';
import { QuestionsService } from '../questions/questions.service';
import { Question } from 'src/app/models/question';
import { Answer } from 'src/app/models/answer';
import { DocumentReference, DocumentSnapshot } from 'angularfire2/firestore';
import { Observable, Subscriber } from 'rxjs';
import { User } from 'firebase';
import { AuthService } from '../auth/auth.service';
import { AnswersService } from '../answers/answers.service';
import { FirestoreService } from '../firestore/firestore.service';
import { map } from 'rxjs/operators';

interface QuestionWithRating{
  id: string;
  userId: string;
  category: string;
  value: string;
  correctAnswer: string;
  dateUpdated: Date;
  rating: 1 | 2 | 3 | 4 | 5;

}

interface TimesAnswered{
    timesAnswered: number;
    timesAnsweredCorrectly: number;
}

@Injectable({
  providedIn: 'root'
})
export class QuizService {

  questionsInQuiz = 1;
  quizzes: Quiz[] = [];
  
  constructor(private _firestoreService: FirestoreService, private _questionsService: QuestionsService, private _authService: AuthService, private _answersService: AnswersService) {}


  get quizzes$(): Observable<Quiz[]>{
    return new Observable((subscriber: Subscriber<Quiz[]>) => {
      const subscription = this.quizzesShallow$.subscribe((quizShallow: QuizShallow[]) => {
        subscription.unsubscribe();
        this.transformQuestionsAndAnswers(quizShallow)
        .then((quizzes: Quiz[]) => subscriber.next(quizzes))
      })
    })
  }

  get quizzesShallow$(): Observable<QuizShallow[]>{
    return this._firestoreService.dataObservable('quizzes')
    .pipe(map(quizzes => {
      return quizzes.map(quiz => {
        quiz.dateCompleted = quiz.dateCompleted.toDate()
        return <QuizShallow>quiz
      })
    }))
  }

  transformQuestionsAndAnswers(quizzes: QuizShallow[]): Promise<Quiz[]>{
    return Promise.all(quizzes.map((quizShallow: QuizShallow): Promise<Quiz> => {
      return Promise.all(quizShallow.questionsAndAnswers.map((questionAndAnswerIds: QuestionAndAnswerIds): Promise<QuestionAndAnswer> => 
        Promise.all([
          <Promise<Question>>this._questionsService.getQuestionById(questionAndAnswerIds.questionId),
          <Promise<Answer>>this._answersService.getAnswerById(questionAndAnswerIds.answerId)
        ])
        .then((questionAndAnswerArray: [Question, Answer]): QuestionAndAnswer => (
          {question: questionAndAnswerArray[0], answer: questionAndAnswerArray[1]}
        ))
      ))          
      .then((questionsAndAnswers: QuestionAndAnswer[]): Quiz => {
        delete quizShallow.questionsAndAnswers
        const quiz: Quiz = Object.assign({questionsAndAnswers: questionsAndAnswers}, <QuizShallow>quizShallow)
        return quiz;
      })
    }))
  }



  generateQuiz(): Promise<Quiz>{
    const quizPromise: Promise<Quiz> = new Promise((resolve, reject) => {

      const subscription = this._questionsService.questions$.subscribe(
        async (questions: Question[]) => {
          subscription.unsubscribe()
          const ratedQuestions: QuestionWithRating[] = await this.rateQuestions(questions)
          console.log('ratedQuestions :', ratedQuestions);
          const randomQuestions: Question[] = this.getTenRandomQuestions(ratedQuestions)
          console.log('randomQuestions :', randomQuestions);

          const quizQuestions: QuestionAndAnswer[] = randomQuestions.map((question: Question) => {
            return {
              question: question,
              answer: undefined
            }
          })

          const quiz: Quiz = {
            id: null,
            userId: null,
            questionsAndAnswers: quizQuestions,
            dateCompleted: null,
          }

          resolve(quiz);
        }
      )
    })

    return quizPromise;
  }
  

  private getTenRandomQuestions(ratedQuestions: QuestionWithRating[]){
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
      return question;
    })
    
    return questions;
  }


  saveQuizResults(quiz: Quiz): Promise<any>{
    return new Promise((resolve, reject) => {
      const subscription = this._authService.user.subscribe((user: User) => {
        subscription.unsubscribe()
        const waitToSaveAnswers: Promise<{questionId: string, answerId: string}>[] = quiz.questionsAndAnswers
        .map((questionAndAnswer: QuestionAndAnswer) => {
          questionAndAnswer.answer.userId = user.uid
          return this._answersService.saveAnswer(questionAndAnswer.answer)
          .then(answerId => {
            return {
              questionId: questionAndAnswer.question.id,
              answerId: answerId
            }
          })
        })
        console.log('waitToSaveAnswers :', waitToSaveAnswers);
    
        Promise.all(waitToSaveAnswers).then(
          (questionsAndAnswersIds: []) => {
            console.log('questionsAndAnswersIds :', questionsAndAnswersIds)
            const quizToSave = {
              userId: user.uid,
              questionsAndAnswers: questionsAndAnswersIds,
              dateCompleted: new Date()
            }
            return this._firestoreService.create('quizzes', quizToSave)
            .then((quizSaveResponse: DocumentReference) => {
              console.log('quizSaveResponse :', quizSaveResponse); 
              quizSaveResponse.get()
              .then((snapShot: DocumentSnapshot<any>) => {
                const quizData = snapShot.data()
                quizData.id = snapShot.id;
                const quiz: QuizShallow = quizData;

                resolve(quiz)
              })
            })
          }
        )
      })
    })
  }


  private rateQuestions(questions: Question[]){
    
    return Promise.all(questions
      .map(async (question: Question) => {
        let rating;
        let questionWithRating: QuestionWithRating;

        let {timesAnswered, timesAnsweredCorrectly} = await this.numberOfTimesAnswered(question.id)
        
        if(timesAnswered === 0){
          rating = 2;
        } else {
          const percentageCorrect = timesAnsweredCorrectly/timesAnswered*100;
          rating = Math.floor(percentageCorrect/100*5)
        }
        console.log(`question: ${question.value} has been answered correctly ${timesAnsweredCorrectly} out of ${timesAnswered}. It has a selection rating of ${rating}`);

        questionWithRating = Object.assign({rating: rating}, question)

        return questionWithRating
      })
    )
  }

  numberOfTimesAnswered(questionId): Promise<{timesAnswered: number, timesAnsweredCorrectly: number}>{
    return new Promise((resolve, reject) => {

      const subscription = this.quizzesShallow$.subscribe((quizzes: QuizShallow[]) => {
        subscription.unsubscribe();

        const quizzesWithQuestion: QuizShallow[] = quizzes.filter((quiz: QuizShallow) => {
         const questionFoundInQuiz = quiz.questionsAndAnswers
         .find((questionAndAnswerIds: QuestionAndAnswerIds) => questionAndAnswerIds.questionId === questionId)
         return !!questionFoundInQuiz
        })

        Promise.all(quizzesWithQuestion.map((quiz: QuizShallow): Promise<Answer> => (
          this._answersService.getAnswerById(quiz.questionsAndAnswers[0].answerId)
        ))).then((answers: Answer[]) => {
          const timesAnsweredObj = answers.reduce((timesAnsweredObj: TimesAnswered, answer: Answer) => {
            timesAnsweredObj.timesAnswered++
            timesAnsweredObj.timesAnsweredCorrectly = timesAnsweredObj.timesAnsweredCorrectly + (answer.markedAs ? 1 : 0)
            return timesAnsweredObj
          }, <TimesAnswered>{timesAnswered: 0, timesAnsweredCorrectly: 0})

          resolve(timesAnsweredObj)
        })
      })

    })
  }


}
