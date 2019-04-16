import { Injectable, OnDestroy } from '@angular/core';
import { Quiz, QuestionAndAnswer, QuestionAndAnswerIds, QuizFlat } from 'src/app/models/quiz';
import { Question } from 'src/app/models/question';
import { Answer } from 'src/app/models/answer';
import { DocumentSnapshot, QueryDocumentSnapshot } from 'angularfire2/firestore';
import { Observable, Subject, Subscriber, Subscription } from 'rxjs';
import { AnswerService } from '../answer/answer.service';
import { switchMap, debounceTime, map, take } from 'rxjs/operators';
import { DataService } from '../data/data.service';
import { QuestionService } from '../question/question.service';
import { Tag } from 'src/app/models/tag';
import { CollectionNames } from '../../enums/collection-names-enum';
import { TagService } from '../tag/tag.service';
export interface QuestionWithRating extends Question {
  id: string;
  tags: Tag[];
  value: string;
  correctAnswer: string;
  dateUpdated: Date;
  rating: number;
}
interface TimesQuestionAnswered {
  timesAsked: number;
  timesAnsweredCorrectly: number;
}
@Injectable({
  providedIn: 'root'
})
export class QuizService {

  questionsInQuiz = 5;
  newQuestionRatingVal = 2;

  quizzes: Quiz[];
  quizUpdates$: Subject<Quiz[]> = new Subject();
  quizzesDataSubscription: Subscription;

  quizzes$: Observable<Quiz[]> = Observable.create((subscriber: Subscriber<Quiz[]>) => {
    if (!this.quizzesDataSubscription) {
      this.setupQuizzesDataSubscription();
    }
    if (this.quizzes) {
      subscriber.next(this.quizzes);
    }
    this.quizUpdates$.subscribe((updatedQuizzes: Quiz[]) => {
      subscriber.next(updatedQuizzes);
    });
  });

  constructor(
    private _dataService: DataService,
    private _answerService: AnswerService,
    private _questionService: QuestionService,
    private _tagService: TagService
    ) {
    this._questionService.questionDeletedSubject$.subscribe((id: string) => {
      this.removeQuestionAndAnswerFromQuizzes(id);
    });
    this._tagService.tagDeletedSubject$.subscribe((id: string) => {
      this.removeTagFromQuizzes(id);
    });
  }


  private setupQuizzesDataSubscription() {
    this.quizzesDataSubscription = this.getQuizzesData$().subscribe((quizzes: Quiz[]) => {
      this.quizzes = quizzes;
      console.log('quizzes updated :', this.quizzes);
      this.quizUpdates$.next(this.quizzes);
    });
  }

  private getQuizzesData$(): Observable<Quiz[]> {
    return this._dataService.getCollectionData(CollectionNames.Quizzes).pipe(switchMap(
      (quizzesSnapshots: QueryDocumentSnapshot<QuizFlat>[]) => {
        return new Observable((subscriber) => {

          const quizPromises: Promise<Quiz>[] =
            quizzesSnapshots.map((quizSnapshot: DocumentSnapshot<QuizFlat>) => {
              const question: QuizFlat = quizSnapshot.data();
              return this.convertToNormalQuiz(question, quizSnapshot.id);
            });

          Promise.all(quizPromises).then((quizzes: Quiz[]) => {
            subscriber.next(quizzes);
          });
        });

      }
    ));
  }

  get quizzesFlat$(): Observable<QuizFlat[]> {
    return this._dataService.getCollectionData(CollectionNames.Quizzes).pipe(switchMap(
      (quizzesSnapshots: QueryDocumentSnapshot<QuizFlat>[]) => {
        return Promise.all(
          quizzesSnapshots.map(
            (quizSnapshot: QueryDocumentSnapshot<QuizFlat>) => {
              const quizFlat: QuizFlat = quizSnapshot.data();
              return quizFlat;
            }
          )
        );
      }
    ));
  }

  add(quiz: Quiz): Promise<string> {
    quiz.dateCompleted = new Date;
    const flatQuiz: QuizFlat = this.convertToFlatQuiz(quiz);
    return this._dataService.addToCollection(CollectionNames.Quizzes, flatQuiz);
  }

  update(quiz: Quiz) {
    const flatQuiz: QuizFlat = this.convertToFlatQuiz(quiz);
    return this._dataService.updateInCollection(CollectionNames.Quizzes, quiz.id, flatQuiz)
      .then(() => console.log('quiz updated'));
  }

  delete(quiz: Quiz): Promise<void> {
    return this._dataService.deleteFromCollection(CollectionNames.Quizzes, quiz.id);
  }

  convertToNormalQuiz(flatQuiz: QuizFlat, id): Promise<Quiz> {
    return Promise.all(
      flatQuiz.questionsAndAnswersIds.map(
        (questionAndAnswerIds: QuestionAndAnswerIds): Promise<QuestionAndAnswer> => {

          return Promise.all([
            this._questionService.getQuestionById(questionAndAnswerIds.questionId),
            this._answerService.getAnswerById(questionAndAnswerIds.answerId)
          ]).then((x: [Question, Answer]) => (<QuestionAndAnswer>{ question: x[0], answer: x[1] }));
        }
      )
    )
    .then((questionsAndAnswers: QuestionAndAnswer[]) => {
      const filteredQuestionsAndAnswers = questionsAndAnswers
      .filter((questionAndAnswer: QuestionAndAnswer) => {
        const isQuestion = questionAndAnswer.question !== undefined;
        if (!isQuestion) {
          console.log('questionAndAnswer is filtered out because its question is undefined :', questionAndAnswer);
        }
        return isQuestion;
      });

      const tagsPromise: Promise<Tag[]> =  flatQuiz.tagIds ?
      Promise.all(flatQuiz.tagIds.map(tagId => this._tagService.getTagById(tagId))) :
      Promise.resolve(<Tag[]>[]);

      return tagsPromise
      .then((tags: Tag[]) => {
        const normalQuiz: Quiz = {
          id: id,
          tags: tags,
          questionsAndAnswers: filteredQuestionsAndAnswers,
          dateCompleted: flatQuiz.dateCompleted.toDate()
        };
        return normalQuiz;
      });

    });
  }

  convertToFlatQuiz(quiz: Quiz): QuizFlat {
    const questionsAndAnswersIds = quiz.questionsAndAnswers.map(
      (questionAndAnswer: QuestionAndAnswer): QuestionAndAnswerIds => {
        return {
          questionId: questionAndAnswer.question.id,
          answerId: questionAndAnswer.answer.id
        };
      }
    );
    const flatQuiz: QuizFlat = {
      questionsAndAnswersIds: questionsAndAnswersIds,
      dateCompleted: quiz.dateCompleted,
      tagIds: quiz.tags.map((tag: Tag) => tag.id)
    };
    return flatQuiz;
  }


  generateQuizQuestions(quizTags: Tag[]): Promise<QuestionAndAnswer[]> {
    return new Promise((resolve, reject) => {
      this._questionService.questions$
      .pipe(take(1), debounceTime(1))
      .subscribe(
        (questions: Question[]) => {
          if (quizTags.length) {
            const tagFilteredQuestions: Question[] = questions.filter((question: Question) => {
              return !!question.tags.find((questionTag: Tag) => {
                return !!quizTags.find((quizTag: Tag) => quizTag.id === questionTag.id);
              });
            });
            questions = tagFilteredQuestions;
          }
          if (questions.length < this.questionsInQuiz) {
            reject();
          }
          this.rateQuestions(questions)
          .then((ratedQuestions: QuestionWithRating[]) => {
            const sortedByRating = ratedQuestions.sort((a, b) => a.rating - b.rating);
            console.table(sortedByRating, ['value', 'dateUpdated', 'rating']);
            const randomQuestions: Question[] = this.getRandomQuestions(ratedQuestions);
            const quizQuestions: QuestionAndAnswer[] = randomQuestions.map((question: Question) => {
              return {
                question: question,
                answer: undefined
              };
            });
            resolve(quizQuestions);
          });
        }
      );
    });
  }

  getRandomQuestions(ratedQuestions: QuestionWithRating[]): Question[] {

    const questionsWithRandomVal: any = ratedQuestions
    .map((question: QuestionWithRating) => {
      const ques = Object.assign(question);
      ques.selectionRandomValue = Math.floor(Math.random() * ques.rating);
      delete question.rating;
      return question as any;
    })
    .sort((a, b) => a.selectionRandomValue - b.selectionRandomValue);

    console.table(questionsWithRandomVal, ['value', 'selectionRandomValue']);

    const questions: Question[] = questionsWithRandomVal
        .slice(0, this.questionsInQuiz)
        .map(ques => {
          delete ques.selectionRandomValue;
          return ques;
        });

    return questions;
  }

  rateQuestions(questions: Question[]): Promise<QuestionWithRating[]> {

    const {mostRecentDate, lastAskedDaysRange} = this.getLaskAskedDaysRange(questions);
    return Promise.all(questions
      .map(async (question: Question) => {
        const correctnessRating: number = await this.getCorrectnessRating(question);
        const lastAskedRating: number = this.getLastAskedRating(mostRecentDate, question.dateUpdated, lastAskedDaysRange);
        return {...question, rating: Math.round((correctnessRating + lastAskedRating) / 2)};
      })
    );
  }

  // questions are rated relative to time scale of total questions
  private getLaskAskedDaysRange(questions: Question[]): any {
    const datesArray = questions.map(question => question.dateUpdated);
    const sortedDates = datesArray.sort((a, b) => a.getTime() - b.getTime());
    const longestAgo = sortedDates[0];
    const mostRecentDate = sortedDates[sortedDates.length - 1];
    const diffTime = Math.abs(mostRecentDate.getTime() - longestAgo.getTime());
    const lastAskedDaysRange = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return {mostRecentDate, lastAskedDaysRange};
  }

  // the longer its been since a question has been asked, the lower its rating should be
  private getLastAskedRating(mostRecent: Date, questionDate: Date, dayRange: number): number {
    if (dayRange === 0) {
      return 10;
    }
    const diffTime = Math.abs(mostRecent.getTime() - questionDate.getTime());
    const lastAskedDaysSinceMostRecent = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    if (lastAskedDaysSinceMostRecent === 0) {
      return 10;
    }
    return Math.round(10 - lastAskedDaysSinceMostRecent / dayRange * 10);
  }
   // the more a question is answered incorrectly, the lower its rating should be
   private async getCorrectnessRating(question: Question): Promise<number> {

    const timesQuestionAnswered: TimesQuestionAnswered = await this.getTimesQuestionAnswered(question.id);
    const { timesAsked,  timesAnsweredCorrectly} = timesQuestionAnswered;
    if (timesAsked <= 3) {
      return 0;
    }
    return Math.round(timesAnsweredCorrectly / timesAsked * 10);

  }


  getTimesQuestionAnswered(questionId): Promise<TimesQuestionAnswered> {
    return new Promise(resolve =>
      this.quizzesFlat$
      .pipe(take(1))
      .subscribe((quizzes: QuizFlat[]) => {
        const { timesQuestionAnswered, getAnswerPromises } = quizzes.reduce(
          (x, quiz: QuizFlat) => {
            quiz.questionsAndAnswersIds.forEach((qaid: QuestionAndAnswerIds) => {
              if (qaid.questionId === questionId) {
                x.timesQuestionAnswered.timesAsked++;
                x.getAnswerPromises.push(this._answerService.getAnswerById(qaid.answerId));
              }
            });
            return x;
          }, { timesQuestionAnswered: <TimesQuestionAnswered>{ timesAsked: 0, timesAnsweredCorrectly: 0 }, getAnswerPromises: [] }
        );
        Promise.all(<Promise<Answer>[]>getAnswerPromises)
          .then((answers: Answer[]) => {
            timesQuestionAnswered.timesAnsweredCorrectly = answers.reduce((count, answer: Answer) => {
              if (answer.correct) {
                count++;
              }
              return count;
            }, 0);
            resolve(timesQuestionAnswered);
          });
      })
    );
  }

  saveQuizResults(quiz: Quiz): Promise<Quiz> {
    return this.saveAnswers(quiz)
      .then((savedQuiz: Quiz) => {
        quiz.dateCompleted = new Date;
        return this.add(savedQuiz)
        .then(quizId => {
          savedQuiz.id = quizId;
          return savedQuiz;
        });
      })
      ;
  }

  saveAnswers(quiz: Quiz): Promise<Quiz> {
    return Promise.all(quiz.questionsAndAnswers.map(
      (questionAndAnswer: QuestionAndAnswer): Promise<QuestionAndAnswer> => {
        return this._answerService.add(questionAndAnswer.answer)
          .then((answerId: string): QuestionAndAnswer => {
            questionAndAnswer.answer.id = answerId;
            return questionAndAnswer;
          });
      }
    )).then((questionsAndAnswers: QuestionAndAnswer[]): Quiz => {
      quiz.questionsAndAnswers = questionsAndAnswers;
      return quiz;
    });
  }

  removeQuestionAndAnswerFromQuizzes(id: string): Promise<void> {
    return new Promise(resolve =>
      this.quizzes$
      .pipe(take(1))
      .subscribe((quizzes: Quiz[]) => {

        const deletingAnswersPromises: Promise<void>[] = [];
        const updatingQuizPromises: Promise<void>[] = [];

        quizzes.forEach((quiz: Quiz) => {
          quiz.questionsAndAnswers.forEach((questionAndAnswer: QuestionAndAnswer) => {
            if (questionAndAnswer.question.id === id) {
              deletingAnswersPromises.push(this._answerService.delete(questionAndAnswer.answer));
              const updatedQuiz: Quiz = Object.assign({}, quiz);
              updatedQuiz.questionsAndAnswers = quiz.questionsAndAnswers.filter(
                (qAndA: QuestionAndAnswer) => qAndA.question.id !== id
              );
              console.log(`updating quiz, removed questionAndAnswer because question was deleted`, quiz, updatedQuiz);
              updatingQuizPromises.push(this.update(updatedQuiz));
            }
          });
        });

        Promise.all([...deletingAnswersPromises, ...updatingQuizPromises]).then(() => resolve());

      })
    );
  }

  removeTagFromQuizzes(id: string): Promise<void> {
    return new Promise(resolve =>
      this.quizzes$
      .pipe(take(1))
      .subscribe((quizzes: Quiz[]) => {

        quizzes.forEach((quiz: Quiz) => {
          quiz.tags.forEach((tag: Tag) => {
            if (tag.id === id) {
              const updatedQuiz: Quiz = Object.assign({}, quiz);
              updatedQuiz.tags = quiz.tags.filter((t: Tag) => t.id !== id);
              console.log(`updating quiz, removed tag because tag was deleted`, quiz, updatedQuiz);
              this.update(updatedQuiz).then(() => resolve());
            }
          });
        });
      })
    );
  }

}
