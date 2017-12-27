import { Component, OnInit, ViewContainerRef, ViewChild, ComponentRef, COMPILER_OPTIONS, CompilerOptions, 
         InjectionToken, 
         Inject,
         Injector,
         ReflectiveInjector,
         ApplicationRef,
         ComponentFactoryResolver, Compiler} from '@angular/core';

import { CommonModule } from '@angular/common';
import { BrowserModule } from '@angular/platform-browser';
import { FormsModule }   from '@angular/forms';
import { NgModule } from '@angular/core';


import { TestModule } from './test.module';
import { TestComponent } from './test.component';
import { TestChildComponent } from './testchild.component';

import { CustomNgModule, CustomComponent } from './decorators.component';
import {createJatCompiler, resolveForwardRef, resolveDefinition} from './JatFactory/jat_factory'

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit {
  title = 'app';
  @ViewChild('petitionContent1', { read: ViewContainerRef })
  containerRef1: ViewContainerRef;
  
  @ViewChild('petitionContent2', { read: ViewContainerRef })
  containerRef2: ViewContainerRef;
  private innerRef: ComponentRef<any>;
  private injector: ReflectiveInjector;
  private jitCompiler: any;

  constructor(private vcRef: ViewContainerRef, private appRef: ApplicationRef, private resolver: ComponentFactoryResolver,
               private inj: Injector, private compiler: Compiler) {

      //this.jitCompiler = compiler 
      this.jitCompiler = createJatCompiler(compiler, resolver, null);
  }


  ngOnInit() {
  

         this.createDinamicPetitionComponent(`  <div *ngIf="true">
           <app-testchild value="LocalValue"></app-testchild>
           <app-testchild *ngIf="true" value="LocalValue2"></app-testchild>
           </div>`, 
           this.injector, this.innerRef, this.containerRef1);

         this.createDinamicPetitionComponent(`<h1 class="main" (click)="dinamicVariable='This is dinamic variable'"><app-test></app-test> 
              
           </h1>
           <div *ngIf="dinamicVariable">
            {{dinamicVariable}}
          </div>
           `,
                                           this.injector, this.innerRef, this.containerRef2);
  }

  createDinamicPetitionComponent(htmlForm, injector, innerRef, containerRef) {

      if (innerRef) {
          innerRef.destroy();
      }
      @CustomComponent({
          selector: 'app-dinamic-petition-edit',
          template: htmlForm,
          styles: ['']
      })
      class DynamicPetitionEditComponent {}

      @CustomNgModule({
          imports:  [CommonModule, FormsModule, BrowserModule, TestModule], //[TestModule],
          declarations: [DynamicPetitionEditComponent],
      })
      class DynamicHtmlModule {}
      this.jitCompiler.compileModuleAndAllComponentsAsync(DynamicHtmlModule)
      .then(factory => {

          const compFactory = factory.componentFactories.find(x => {
            return (x.componentType === DynamicPetitionEditComponent);
          });

          innerRef = containerRef.createComponent(compFactory, 0, injector, []);
       });
  }


}
