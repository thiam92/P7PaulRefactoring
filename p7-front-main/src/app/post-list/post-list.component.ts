import { Component, OnInit } from '@angular/core';
import { postsService } from '../services/posts.service';
import { catchError, Observable, of, tap } from 'rxjs';
import { post } from '../models/post.model';
import { Router } from '@angular/router';

@Component({
  selector: 'app-post-list',
  templateUrl: './post-list.component.html',
  styleUrls: ['./post-list.component.scss']
})
export class postListComponent implements OnInit {

  posts$!: Observable<post[]>;
  loading!: boolean;
  errorMsg!: string;

  constructor(private post: postsService,
              private router: Router) { }

  ngOnInit() {
    this.loading = true;
    this.posts$ = this.post.posts$.pipe(
      tap(() => {
        this.loading = false;
        this.errorMsg = '';
      }),
      catchError(error => {
        this.errorMsg = JSON.stringify(error);
        this.loading = false;
        return of([]);
      })
    );
    this.post.getposts();
  }

  onClickpost(id: string) {
    this.router.navigate(['post', id]);
  }

}
