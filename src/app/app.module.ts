import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AppComponent } from './app.component';
import { AuthModule, provideAuth0 } from '@auth0/auth0-angular';
import { environment as env } from '../environments/environment';
import { BrowserModule } from '@angular/platform-browser';
import { HTTP_INTERCEPTORS, HttpClientModule } from '@angular/common/http';
import { AuthInterceptorService } from './services/auth-interceptor.service';
import { InsertRecordComponent } from './insert-record/insert-record.component';
import { FormsModule } from '@angular/forms';
import { DailyScoreComponent } from './daily-score/daily-score.component';
import { ViewRecordComponent } from './view-record/view-record.component';
import { HeaderComponent } from './header/header.component';

@NgModule({
  declarations: [
    AppComponent,
    InsertRecordComponent,
    DailyScoreComponent,
    ViewRecordComponent,
    HeaderComponent,
  ],
  imports: [
    CommonModule,
    BrowserModule,
    HttpClientModule,
    FormsModule,
    AuthModule.forRoot({
      ...env.auth,
    }),
  ],
  providers: [
    provideAuth0({
      domain: env.auth.domain,
      clientId: env.auth.clientId,
      authorizationParams: {
        redirect_uri: window.location.origin,
        audience: env.auth.authorizationParams.audience,
      },
    }),
    {
      provide: HTTP_INTERCEPTORS,
      useClass: AuthInterceptorService,
      multi: true,
    },
  ],
  bootstrap: [AppComponent],
})
export class AppModule {}
