import * as React from 'react';
import {
  ScheduleComponent, ViewsDirective, ViewDirective, Day, Week, WorkWeek, Month, Agenda, Inject
} from '@syncfusion/ej2-react-schedule';
import { registerLicense } from '@syncfusion/ej2-base';
 
const Test = () => {
    registerLicense("Ngo9BigBOggjHTQxAR8/V1NDaF5cWWtCf1NpR2NGfV5ycEVHYlZSTHxfRU0SNHVRdkdnWXZccHRUQ2NZVkVwW0A=");
    const data = [{
        Id: 1,
        Subject: 'Scrum Meeting',
        Location: 'Office',
        StartTime: new Date(2024, 8, 20, 9, 30),
        EndTime: new Date(2024, 8, 20, 10, 30),
        RecurrenceRule: 'FREQ=WEEKLY;BYDAY=MO,TU,WE,TH,FR;INTERVAL=1'
    }];
 
  return (
    <div>
      <ScheduleComponent height='650px' eventSettings={{dataSource:data}}>
        <ViewsDirective>
          <ViewDirective option='Day' />
          <ViewDirective option='Week' />
          <ViewDirective option='WorkWeek' />
          <ViewDirective option='Month' />
          <ViewDirective option='Agenda' />
        </ViewsDirective>
        <Inject services={[Day, Week, WorkWeek, Month, Agenda]} />
      </ScheduleComponent>
      <link href="https://cdn.syncfusion.com/ej2/material.css" rel="stylesheet" type="text/css"/>
    </div>
  );
}

export default Test;