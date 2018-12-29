import { Component, OnInit } from '@angular/core';
import { FormGroup, FormControl } from '@angular/forms';
import { Tag } from 'src/app/models/tag';
import { Observable } from 'rxjs';
import { TagService } from 'src/app/services/tag/tag.service';

@Component({
  selector: 'app-tag-management',
  templateUrl: './tag-management.component.html'
})
export class TagManagementComponent implements OnInit {

  selectedTag: Tag
  tags$: Observable<Tag[]>
  
  newTagForm = new FormGroup({
    value: new FormControl(''),
  });

  constructor(private _tagService: TagService) { }

  ngOnInit() {    
    this.tags$ = this._tagService.tags$
  }

  submitNewTag(){
    const tag: Tag = this.newTagForm.value
    this._tagService.add(tag).then(() => {
      console.log('new tag saved')
      this.newTagForm.reset()
    })
    
  }
  submitUpdatedTag(){
    
    this._tagService.update(this.selectedTag).then(() => console.log('new tag saved'))
  }

  selectTag(tag){
    this.selectedTag = Object.assign({}, tag);
  }

  deleteTag(){
    const deleteConfirmed: boolean = window.confirm(`Are you sure you want to delete tag: \n\n ${this.selectedTag.value}`)

    if(deleteConfirmed){
      this._tagService.delete(this.selectedTag).then(() => console.log('tag deleted'))
    }
  }

}
