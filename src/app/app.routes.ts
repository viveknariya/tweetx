import { Routes } from '@angular/router';
import { LoginComponent } from './login/login.component';
import { NotfoundComponent } from './notfound/notfound.component';
import { SignupComponent } from './signup/signup.component';
import { UserComponent } from './user/user.component';
import { FeedComponent } from './feed/feed.component';
import { ProfileComponent } from './profile/profile.component';
import { ProfileFollowersComponent } from './profile-followers/profile-followers.component';
import { ProfileFollowingComponent } from './profile-following/profile-following.component';
import { ProfilePostComponent } from './profile-post/profile-post.component';
import { DahsboardComponent } from './dahsboard/dahsboard.component';

export const routes: Routes = [
  {
    path: '',
    redirectTo: 'signup',
    pathMatch: 'full',
  },
  {
    path: 'login',
    component: LoginComponent,
  },
  {
    path: 'signup',
    component: SignupComponent,
  },
  {
    path: 'dashboard',
    component: DahsboardComponent,
    children: [
      { path: '', redirectTo: 'feed', pathMatch: 'full' },
      {
        path: 'user',
        component: UserComponent,
      },
      {
        path: 'feed',
        component: FeedComponent,
      },
      {
        path: 'profile',
        component: ProfileComponent,
        children: [
          { path: '', redirectTo: 'post', pathMatch: 'full' },
          {
            path: 'followers',
            component: ProfileFollowersComponent,
          },
          {
            path: 'following',
            component: ProfileFollowingComponent,
          },
          {
            path: 'post',
            component: ProfilePostComponent,
          },
        ],
      },
    ],
  },
  {
    path: '**',
    component: NotfoundComponent,
  },
];
