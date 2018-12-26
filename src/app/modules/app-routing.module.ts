import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { AuthGuard } from '../guards/auth.guard';

import { LoginComponent } from './../components/views/login/login.component';
import { QuizComponent } from '../components/views/quiz/quiz.component';
import { QuestionManagementComponent } from '../components/views/question-management/question-management.component';

const routes: Routes = [
  {
    path: '',
    redirectTo: '/quiz',
    pathMatch: 'full'
  },
  {
    data: {title: 'Login'},
    path: 'login',
    component: LoginComponent
  },
  {
    data: {title: 'Quiz'},
    canActivate: [AuthGuard],
    path: 'quiz',
    component: QuizComponent
  },
  {
    data: {title: 'Question Management'},
    canActivate: [AuthGuard],
    path: 'question-management',
    component: QuestionManagementComponent
  }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
