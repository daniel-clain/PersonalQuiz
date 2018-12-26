import { Component, OnInit } from '@angular/core';
import { AuthService } from 'src/app/services/auth/auth.service';
import { User } from 'firebase';
import { map } from 'rxjs/operators';
import { CategoryService } from 'src/app/services/category/category.service';
import { FormGroup, FormControl } from '@angular/forms';
import { Category } from 'src/app/models/category';
import { Observable } from 'rxjs';

@Component({
  selector: 'app-category-management',
  templateUrl: './category-management.component.html'
})
export class CategoryManagementComponent implements OnInit {

  selectedCategory: Category
  categories$: Observable<Category[]>
  
  newCategoryForm = new FormGroup({
    value: new FormControl(''),
  });

  constructor(private _authService: AuthService, private _categoryService: CategoryService) { }

  ngOnInit() {    
    this.categories$ = this._categoryService.categories$;
  }

  submitNewCategory(){
    const subscription = this._authService.user
    .pipe(map((user: User) => user.uid)).subscribe(

      (userId: string) => {
        const newCategory: Category =
        Object.assign(this.newCategoryForm.value, {
          userId: userId
        })

        this._categoryService.addNewCategory(newCategory)
        .then(() => this.newCategoryForm.reset())

        subscription.unsubscribe()
      }
    )  
  }

  submitUpdateCategory(){
    console.log('this.selectedCategory :', this.selectedCategory);
    this._categoryService.updateCategory(this.selectedCategory).then(() => console.log('category updated'))
  }

  selectCategory(category: Category){
    this.selectedCategory = Object.assign({}, category);
  }

  deleteCategory(categoryId){
    const deleteConfirmed: boolean = window.confirm(`Are you sure you want to delete category: \n\n "${this.selectedCategory.value}`)

    if(deleteConfirmed){
      this._categoryService.deleteCategory(categoryId).then(() => console.log("Document successfully deleted!"))
    }
  }

}
