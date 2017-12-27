import { ComponentFactoryResolver, Compiler} from '@angular/core';
import { JitCompiler } from '@angular/compiler';
import { CompilerFactory, SystemJsNgModuleLoader } from '@angular/core';
import { JitCompilerFactory } from '@angular/platform-browser-dynamic';
import { ResourceLoader } from '@angular/compiler';

import { ComponentFactory, CompilerOptions, ModuleWithComponentFactories, Inject, InjectionToken, Optional, PACKAGE_ROOT_URL, PlatformRef, StaticProvider, TRANSLATIONS, Type, isDevMode, platformCore, ɵConsole as Console, ViewEncapsulation, Injector, NgModuleFactory, TRANSLATIONS_FORMAT, MissingTranslationStrategy } from '@angular/core';

import {StaticSymbolCache, ProviderMeta, ExternalReference, I18NHtmlParser, Identifiers, ViewCompiler, CompileMetadataResolver, UrlResolver, TemplateParser, NgModuleCompiler, JitSummaryResolver, SummaryResolver, StyleCompiler, PipeResolver, ElementSchemaRegistry, DomElementSchemaRegistry,  NgModuleResolver, HtmlParser, CompileReflector, CompilerConfig, DirectiveNormalizer, DirectiveResolver, Lexer, Parser} from '@angular/compiler';

export function resolveForwardRef(type: any): any {

  if (typeof type === 'function' && type.hasOwnProperty('__forward_ref__')) {
    return type();
  } else {
    return type;
  }
}

export function resolveDefinition(factory:any) {
    var NOOP = function () { };
    var value = factory(function () { return NOOP; });
    value.factory = factory;

    return value;
}

export class FileSystemResourceLoader extends ResourceLoader {
    private i = 0;
    get(url: string): Promise<string> {
        return new Promise((resolve, reject) => {
            resolve('');
        });
    }
}
export class JatCompiler extends JitCompiler {
  resolver:ComponentFactoryResolver
  superCompileComponents: Function;
  thisAny:any;
  // overide func
  _compileComponents(mainModule: any, allComponentFactories: object[]|null) {

      const thisAny = this.thisAny;
      this.superCompileComponents.call(this, mainModule, allComponentFactories);
      const ngModule = thisAny._metadataResolver.getNgModuleMetadata(mainModule) !;
      const transJitModules = thisAny._filterJitIdentifiers(ngModule.transitiveModule.modules);
      const transJitModulesLength:number = transJitModules.length - 1;
      transJitModules.forEach((localMod, index) => {
        // The last module is not compiled, he is dynamic
        if (transJitModulesLength == index) {
            return;
        }
        const localModuleMeta = thisAny._metadataResolver.getNgModuleMetadata(localMod) !;
        thisAny._filterJitIdentifiers(localModuleMeta.declaredDirectives).forEach((dirRef, index) => {

            const dirMeta = thisAny._metadataResolver.getDirectiveMetadata(dirRef);
            if (dirMeta.isComponent) {
                if (allComponentFactories) {

                   try {

                      const cmpFactory = thisAny.resolver.resolveComponentFactory(dirMeta.type.reference);

                      const cmpF = (cmpFactory as any).factory as any;

                      const viewDef = (resolveDefinition(cmpF.viewDefFactory) as any);
                      (<any>dirMeta.componentViewType).setDelegate(viewDef.nodes[0].element.componentView);
                      const rendererType = (resolveDefinition(viewDef.factory) as any).nodes[0].element.componentRendererType;
                      for (let prop in rendererType) {
                          (<any>dirMeta.rendererType)[prop] = rendererType[prop];
                      }

                      allComponentFactories.push(cmpF as object);
                      thisAny._addAotSummaries(dirMeta);
                  } catch(e) {
                      console.log('Please add '+dirMeta.type.reference.name+' in entryComponents');
                  }

                }
            }
        })
      })
  }

}


export class JatCompilerImpl implements Compiler {
  private _delegate: JatCompiler;
  public readonly injector: Injector;
  private superCompileComponents: Function;

  constructor(
      injector: Injector, private _metadataResolver: CompileMetadataResolver,
      templateParser: TemplateParser, styleCompiler: StyleCompiler, viewCompiler: ViewCompiler,
      ngModuleCompiler: NgModuleCompiler, summaryResolver: SummaryResolver<Type<any>>,
      compileReflector: CompileReflector, compilerConfig: CompilerConfig, _console: Console, 
      resolver: ComponentFactoryResolver, loader: SystemJsNgModuleLoader) {

    this._delegate = new JatCompiler(
        _metadataResolver, templateParser, styleCompiler, viewCompiler, ngModuleCompiler,
        summaryResolver, compileReflector, compilerConfig, _console,
        this.getExtraNgModuleProviders.bind(this));

    this._delegate.superCompileComponents = ((this._delegate as any).__proto__.__proto__)._compileComponents;
    this._delegate.resolver = resolver;
    this._delegate.thisAny = this._delegate;

    this.injector = injector;
  }

  private getExtraNgModuleProviders() {
    return [this._metadataResolver.getProviderMetadata(
        new ProviderMeta(Compiler, {useValue: this}))];
  }

  compileModuleSync<T>(moduleType: Type<T>): NgModuleFactory<T> {
    return this._delegate.compileModuleSync(moduleType) as NgModuleFactory<T>;
  }
  compileModuleAsync<T>(moduleType: Type<T>): Promise<NgModuleFactory<T>> {
    return this._delegate.compileModuleAsync(moduleType) as Promise<NgModuleFactory<T>>;
  }
  compileModuleAndAllComponentsSync<T>(moduleType: Type<T>): ModuleWithComponentFactories<T> {
    const result = this._delegate.compileModuleAndAllComponentsSync(moduleType);
    return {
      ngModuleFactory: result.ngModuleFactory as NgModuleFactory<T>,
      componentFactories: result.componentFactories as ComponentFactory<any>[],
    };
  }
  compileModuleAndAllComponentsAsync<T>(moduleType: Type<T>): Promise<ModuleWithComponentFactories<T>> {

    console.log('resolveForwardRef(moduleType)', resolveForwardRef(moduleType));
    return this._delegate.compileModuleAndAllComponentsAsync(moduleType)
        .then((result) => ({
                ngModuleFactory: result.ngModuleFactory as NgModuleFactory<T>,
                componentFactories: result.componentFactories as ComponentFactory<any>[],
              }));
  }
  loadAotSummaries(summaries: () => any[]) { this._delegate.loadAotSummaries(summaries); }
  hasAotSummary(ref: Type<any>): boolean { return this._delegate.hasAotSummary(ref); }
  getComponentFactory<T>(component: Type<T>): ComponentFactory<T> {
    return this._delegate.getComponentFactory(component) as ComponentFactory<T>;
  }
  clearCache(): void { this._delegate.clearCache(); }
  clearCacheFor(type: Type<any>) { this._delegate.clearCacheFor(type); }
}

export function createJatCompiler(compiler: Compiler, resolver:ComponentFactoryResolver, loader:SystemJsNgModuleLoader) {

  let isAot = !((compiler as any)._delegate instanceof JitCompiler)
  if (!isAot) {
    return compiler
  }

  const jatFactory  = new JitCompilerFactory();
  (jatFactory as any)._defaultOptions.splice(1,1);
  const jatCompiler = jatFactory.createCompiler([{
        useJit: true,
        providers: [
            { provide: SystemJsNgModuleLoader, useValue: loader },
            { provide: ComponentFactoryResolver, useValue: resolver},
            { provide: ResourceLoader, useValue: new FileSystemResourceLoader() },
            { provide: Compiler, useClass: JatCompilerImpl, deps: [Injector, CompileMetadataResolver,
                                TemplateParser, StyleCompiler,
                                ViewCompiler, NgModuleCompiler,
                                SummaryResolver, CompileReflector, CompilerConfig,
                                Console, ComponentFactoryResolver, SystemJsNgModuleLoader]},
        ]
  }]);

  return jatCompiler;
}