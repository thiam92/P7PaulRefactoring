import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { postListComponent } from './post-list/post-list.component';
import { postFormComponent } from './post-form/post-form.component';
import { SinglepostComponent } from './single-post/single-post.component';
import { SignupComponent } from './auth/signup/signup.component';
import { LoginComponent } from './auth/login/login.component';
import { AuthGuard } from './services/auth-guard.service';

const routes: Routes = [
  { path: 'signup', component: SignupComponent },
  { path: 'login', component: LoginComponent },
  { path: 'posts', component: postListComponent, canActivate: [AuthGuard] },
  { path: 'post/:id', component: SinglepostComponent, canActivate: [AuthGuard] },
  { path: 'new-post', component: postFormComponent, canActivate: [AuthGuard] },
  { path: 'modify-post/:id', component: postFormComponent, canActivate: [AuthGuard] },
  { path: '', pathMatch: 'full', redirectTo: 'posts'},
  { path: '**', redirectTo: 'posts' }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule],
  providers: [AuthGuard]
})
export class AppRoutingModule { }
