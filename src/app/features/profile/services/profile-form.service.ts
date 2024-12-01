import { Injectable } from '@angular/core';
import { FormBuilder, FormGroup, FormControl, Validators } from '@angular/forms';
import { User, ProfileFormControls, ProfileFormData } from '../../../core/interfaces/index';

@Injectable({
  providedIn: 'root'
})
export class ProfileFormService {
  constructor(private formBuilder: FormBuilder) {}

  createForm(): FormGroup {
    return this.formBuilder.group({
      name: new FormControl('', [Validators.required, Validators.minLength(2)]),
      bio: new FormControl('', [Validators.required, Validators.maxLength(500)]),
      image: new FormControl(''),
      favoriteGenres: new FormControl<string[]>([])
    });
  }

  updateFormWithUserData(form: FormGroup, user: User): void {
    form.patchValue({
      name: user.name,
      bio: user.profile.bio,
      image: user.profile.image,
      favoriteGenres: user.profile.favoriteGenres
    });
  }

  getFormData(form: FormGroup): ProfileFormData {
    return {
      name: form.get('name')?.value || '',
      bio: form.get('bio')?.value || '',
      image: form.get('image')?.value || '',
      favoriteGenres: form.get('favoriteGenres')?.value || []
    };
  }
}
