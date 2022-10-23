import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { postsService } from '../services/posts.service';
import { post } from '../models/post.model';
import { AuthService } from '../services/auth.service';
import { catchError, EMPTY, switchMap, tap } from 'rxjs';

@Component({
  selector: 'app-post-form',
  templateUrl: './post-form.component.html',
  styleUrls: ['./post-form.component.scss']
})
export class postFormComponent implements OnInit {

  postForm!: FormGroup;
  mode!: string;
  loading!: boolean;
  post!: post;
  errorMsg!: string;
  imagePreview!: string;

  constructor(private formBuilder: FormBuilder,
              private route: ActivatedRoute,
              private router: Router,
              private posts: postsService,
              private auth: AuthService) { }

  ngOnInit() {
    this.loading = true;
    this.route.params.pipe(
      switchMap(params => {
        if (!params['id']) {

          this.mode = 'new';
          this.initEmptyForm();
          this.loading = false;
          return EMPTY;
        } else {
          this.mode = 'edit';
          return this.posts.getpostById(params['id'])
        }
      }),
      tap(post => {
        if (post) {
          this.post = post;
          this.initModifyForm(post);
          this.loading = false;
        }
      }),
      catchError(error => this.errorMsg = JSON.stringify(error))
    ).subscribe();
  }

  initEmptyForm() {
    this.postForm = this.formBuilder.group({
      name: [null, Validators.required],
      description: [null, Validators.required],
      image: [null],
    });
  }

  initModifyForm(post: post) {
    this.postForm = this.formBuilder.group({
      name: [post.name, Validators.required],
      description: [post.description, Validators.required],
      image: [post.imageUrl],
    });
    this.imagePreview = this.post.imageUrl;
  }

  onSubmit() {
    this.loading = true;
    const newpost = new post();
    newpost.name = this.postForm.get('name')!.value;
    newpost.description = this.postForm.get('description')!.value;
    newpost.userId = this.auth.getUserId();
    if (this.mode === 'new') {
      this.posts.createpost(newpost, this.postForm.get('image')!.value).pipe(
        tap(({ message }) => {
          console.log(message);
          this.loading = false;
          this.router.navigate(['/posts']);
        }),
        catchError(error => {
          console.error(error);
          this.loading = false;
          this.errorMsg = error.message;
          return EMPTY;
        })
      ).subscribe();
    } else if (this.mode === 'edit') {
      this.posts.modifypost(this.post._id, newpost, this.postForm.get('image')!.value).pipe(
        tap(({ message }) => {
          console.log(message);
          this.loading = false;
          this.router.navigate(['/posts']);
        }),
        catchError(error => {
          console.error(error);
          this.loading = false;
          this.errorMsg = error.message;
          return EMPTY;
        })
      ).subscribe();
    }
  }

  onFileAdded(event: Event) {
    const file = (event.target as HTMLInputElement).files![0];
    this.postForm.get('image')!.setValue(file);
    this.postForm.updateValueAndValidity();
    const reader = new FileReader();
    reader.onload = () => {
      this.imagePreview = reader.result as string;
    };
    reader.readAsDataURL(file);
  }
}
