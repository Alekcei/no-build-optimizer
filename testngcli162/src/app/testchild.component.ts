import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-testchild',
  template: `
  	<div class="main" style="text-align:center">
 {{value}}
</div>

  `,
  styleUrls: ['./testchild.component.less']
})
export class TestChildComponent {
	@Input()
	value:string = 'inner value'
}
