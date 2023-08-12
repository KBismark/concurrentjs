

const a = 9;
 
function test() {
  if(!ConcurrentWokerCallbackObject[0]){
    ConcurrentWokerCallbackObject[0] = function(g, age, name,path){
      console.log('My name is '+age)
  
    }
 };
 ConcurrentWokerObject.postMessage({path:0,args:[age, ane,0]});
}
 if(!ConcurrentWokerCallbackObject[1]){
    ConcurrentWokerCallbackObject[1] = function(a,path){
    
    age += a;
    console.log(age);
  
    }
 };
 ConcurrentWokerObject.postMessage({path:1,args:[age,a,1]});
 if(!ConcurrentWokerCallbackObject[2]){
    ConcurrentWokerCallbackObject[2] = function(age, b,path){
     age += b;
    console.log(age);
  
    }
 };
 ConcurrentWokerObject.postMessage({path:2,args:[age,2]});
