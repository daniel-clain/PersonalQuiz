import { Component, OnInit } from '@angular/core';
import { FormGroup, FormControl } from '@angular/forms';
import { Category } from 'src/app/models/category';
import { Observable } from 'rxjs';
import { CategoryService } from 'src/app/services/category/category.service';

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

  constructor(private _categoryService: CategoryService) { }

  ngOnInit() {    
    this.categories$ = this._categoryService.categories$
  }

  submitNewCategory(){
    const category: Category = this.newCategoryForm.value
    this._categoryService.add(category).then(() => {
      console.log('new category saved')
      this.newCategoryForm.reset()
    })
    
  }
  submitUpdatedCategory(){
    
    this._categoryService.update(this.selectedCategory).then(() => console.log('new category saved'))
  }

  selectCategory(category){
    this.selectedCategory = Object.assign({}, category);
  }

  deleteCategory(){
    const deleteConfirmed: boolean = window.confirm(`Are you sure you want to delete category: \n\n ${this.selectedCategory.value}`)

    if(deleteConfirmed){
      this._categoryService.delete(this.selectedCategory).then(() => console.log('category deleted'))
    }
  }

}
