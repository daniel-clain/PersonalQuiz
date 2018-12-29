import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { AppRoutingModule } from './modules/app-routing.module';

import { environment } from '../environments/environment';

import { AngularFireModule } from '@angular/fire';
import { AngularFirestoreModule } from 'angularfire2/firestore';
import { AngularFireAuthModule } from 'angularfire2/auth';

import { AuthGuard } from './guards/auth.guard'

// Views
import { AppComponent } from './components/views/app/app.component';
import { LoginComponent } from './components/views/login/login.component';
import { QuizComponent } from './components/views/quiz/quiz.component';
import { QuestionManagementComponent } from './components/views/question-management/question-management.component';

// Partials
import { MainMenuComponent } from './components/partials/main-menu/main-menu.component';
import { TagManagementComponent } from './components/partials/tag-management/tag-management.component';


@NgModule({
  declarations: [
    AppComponent,
    LoginComponent,
    MainMenuComponent,
    QuizComponent,
    TagManagementComponent,
    QuestionManagementComponent
  ],
  imports: [
    AngularFireModule.initializeApp(environment.firebase),
    AngularFirestoreModule,
    AngularFireAuthModule,
    BrowserModule,
    AppRoutingModule,
    ReactiveFormsModule,
    FormsModule
  ],
  providers: [AuthGuard],
  bootstrap: [AppComponent]
})
export class AppModule { }
