import { Component, Input } from '@angular/core';
import { OptionValues } from '../models/smashdle.models';

@Component({
  selector: 'app-view-record',
  templateUrl: './view-record.component.html',
  styleUrl: './view-record.component.scss',
})
export class ViewRecordComponent {
  @Input() public attempt: OptionValues[][] = [];

  public optionValueIcon: Record<string, string> = {
    [OptionValues.GREEN]: 'fa fa-check',
    [OptionValues.RED]: 'fa fa-times',
    [OptionValues.YELLOW]: 'fa fa-exclamation',
    [OptionValues.UP]: 'fa fa-arrow-up',
    [OptionValues.DOWN]: 'fa fa-arrow-down',
  };

  public optionValueBg: Record<string, string> = {
    [OptionValues.GREEN]: 'bg-success',
    [OptionValues.RED]: 'bg-danger',
    [OptionValues.YELLOW]: 'bg-warning',
    [OptionValues.UP]: 'bg-info',
    [OptionValues.DOWN]: 'bg-info',
  };
}
