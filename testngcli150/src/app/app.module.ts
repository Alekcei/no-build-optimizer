import { NgModule, ReflectiveInjector, InjectionToken, SystemJsNgModuleLoader  } from '@angular/core';
import { provideRoutes,  } from '@angular/router';
import { AppComponent } from './app.component';
import { TestModule } from './test.module';
import { BrowserModule } from '@angular/platform-browser';
import { CommonModule } from '@angular/common';
import { FormsModule }   from '@angular/forms';
//import { TestChildComponent } from './testchild.component';
@NgModule({
  declarations: [
    AppComponent //, TestChildComponent
  ],
  imports: [
    BrowserModule,
    CommonModule, 
    FormsModule,
    TestModule
  ],
  providers: [
      {provide:SystemJsNgModuleLoader, useClass:SystemJsNgModuleLoader},
      provideRoutes([
          { loadChildren: 'app/test.module#TestModule' },
      ])
  ],
  exports:[FormsModule],
  bootstrap: [AppComponent]
})
export class AppModule {
  constructor(){
   // ReflectiveInjector.resolveAndCreate([{ provider: 'JitCompilerAndAot', useValue:5}]);
  }
}