import { Component, inject } from '@angular/core';
import { RouterLink, ActivatedRoute } from '@angular/router';

interface ErrorPageData {
  status?: number;
  heading?: string;
  message?: string;
}

@Component({
  selector: 'app-error-page',
  imports: [RouterLink],
  templateUrl: './error-page.html',
  styleUrl: './error-page.scss',
})
export class ErrorPage {
  #data = inject(ActivatedRoute).snapshot.data as ErrorPageData;

  status = this.#data.status ?? 404;
  heading = this.#data.heading ?? 'Page not found';
  message = this.#data.message ?? "The page you're looking for doesn't exist or was moved.";
}
