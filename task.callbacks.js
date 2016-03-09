var grunt = require('grunt');
var hooker = require('hooker');
var status = require('node-status');
module.exports = preAndPostHook = function (tasks) {
   var currentTask = undefined;
   var overall = status.addItem('progress', { type : ['bar', 'percentage'], max : tasks.length + 1 });
   var currentStatus;
   var timeStarted = null;
   /** 
    * Do something when the task has sta.
    * @param taskName The task name.
    */
   function taskStartCallback(taskName) {
    // do something 
     currentTask = taskName;
      for(var i = 0; i < tasks.length; i++){
        if(tasks[i] == currentTask){
          if(currentStatus != null){
            status.removeItem(currentStatus);
            currentStatus = null;
          }
          timeStarted = new Date().getTime();
          currentStatus = status.addItem(currentTask, { type : ['text', function(){
            return parseInt((new Date().getTime() - timeStarted) / 1000) + 's'
          }]});
          break;
        }
      }
     //status.addItem(currentTask, { type : ['bar', 'percentage']});
   }
   
   /** 
    * Do something when the task has finished.
    * @param taskResult <code>true</code> if successful, else <code>false</code>.
    */
   function taskEndCallback(taskResult) {
    for(var i = 0; i < tasks.length; i++){
      if(tasks[i] == currentTask){
        overall.inc();
        /*
        if(currentStatus != null){
          status.removeItem(currentStatus);
          currentStatus = null;
        }*/
      }
    }
    currentTask = undefined;

     // do something  
   }
   
  /** Hook into the grunt task runner. */
  hooker.hook(grunt.task, 'runTaskFn', {
    pre: function (context) {
      var taskName = context.nameArgs;
      /*
      if (currentTask !== undefined) {
        taskEndCallback(true); // true indicates the task has finished successfully.
      }*/
      taskStartCallback(taskName);
    },
    post: function (ignore, context) {
      var taskName = context.nameArgs;
      if (currentTask !== undefined) {
        taskEndCallback(true); // true indicates the task has finished successfully.
      }
    }
  });
  
  /** Hook into the success / fail writer. */
  hooker.hook(grunt.log.writeln(), ['success', 'fail'], function (res) { // check done or aborted
    var done = res === 'Done, without errors.';
    var warning = res === 'Done, but with warnings.';
    var aborted = res === 'Aborted due to warnings.';
    var error = warning || aborted;

    if (done || error) {
      if (currentTask !== undefined) {
        taskEndCallback(error ? false : true);
      }
    }
  });
  
  /** Hook into the fatal writer. */
  hooker.hook(grunt.fail, 'fatal', function () { // in case of a real failure
    if (currentTask !== undefined) {
      taskEndCallback(false);
    }
  });
}