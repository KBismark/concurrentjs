const ACTIONS = 
{
  0: function(age, ane,path){
  
      let age = 0;
      let name = 'John';
    
      console.log('My name is '+age)
    
      $passback({g,name,age}, path)
      
      
     
  },
  1:function(age,a,path){
    const a = 4;
   
  },
  2:function(age,path){
    // const b = 4;
 
  },
}

/**
 * Concurrentjs worker driver code
 */
!function () {
    let queuedMessages = [];
    let cycleScheduled = false;
  
    // Batch and send messages at once to the main thread after sometime
    function BatchPost(data,path) {
      if (!cycleScheduled) {
        cycleScheduled = true;
        setTimeout(poster, 10);
      }
      queuedMessages.push({ data: data, path: path });
    }
  
    // post queued messages
    function poster() {
      const messages = queuedMessages;
      cycleScheduled = false;
      queuedMessages = [];
      postMessage(messages);
    };
  
    self.BatchPost = BatchPost;
  
    // listens to messages from main thread
    self.onmessage = function (e) {
      const { path, args } = e.data;
      let action = ACTIONS[path];
      // perform task 
      // or
      // post unsuccessful status
      action && action(...args) || BatchPost(null,path);
    }
  }();
  // A method to pass back results
  const $passback = self.BatchPost;
  // Clears the action's task method
  const $clearpath = (path) => { ACTIONS[path] = undefined };