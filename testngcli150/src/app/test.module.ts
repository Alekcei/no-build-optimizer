import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { BrowserModule } from '@angular/platform-browser';

import { NgModule, ComponentFactoryResolver } from '@angular/core';
import { TestComponent } from './test.component';
import { TestChildComponent } from './testchild.component';


const declarations = [TestComponent, TestChildComponent];
@NgModule({
  id: 'app/test.module#TestModule',
  imports: [
    CommonModule,
    BrowserModule
  ],
  providers: [],
  declarations: declarations,
  entryComponents: declarations,
  exports:declarations,
})
export class TestModule {}