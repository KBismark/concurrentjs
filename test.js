
var s = `

const a = 9;
 
function test() {
  $: age, ane;{

    let age = 0;
    let name = 'John';
  
    console.log('My name is '+age)
  
    $passback({g,name,age}, path)
    
    
    passargs:g, age, name;
    console.log('My name is '+age)
  }
  $   :;
}

$:age,a;{
  const a = 4;
  passargs: a;
  
  age += a;
  console.log(age);
}$:;

$:age;{
  // const b = 4;
  passargs: age, b;
   age += b;
  console.log(age);
}$:;
`;

// Steps:
// 1: Replace all strings
// 2: Take out all comments
// 4: Match all concurrent codes
// 5: Parse and re-structure code

const levelpattern = /[\s;]\$\s*:\s*((([a-zA-Z$_][a-zA-Z0-9$_]*\s*,\s*)*([a-zA-Z$_][a-zA-Z0-9$_]*\s*;))|([a-zA-Z$_][a-zA-Z0-9$_]*\s*;))?\s*{(.*?)}\s*\$\s*:\s*;/gs;
const concurrentCodePattern = /[\s;]\$\s*:\s*((([a-zA-Z$_][a-zA-Z0-9$_]*\s*,\s*)*([a-zA-Z$_][a-zA-Z0-9$_]*\s*;))|([a-zA-Z$_][a-zA-Z0-9$_]*\s*;))?\s*{(.*?)}\s*\$\s*:\s*;/gs;

const BLOCK_REPLACER = `${Math.random()}${Date.now()}`;
const GLOBAL_WORKER = 'ConcurrentWokerObject';
const GLOBAL_WORKER_CALLBACK = 'ConcurrentWokerCallbackObject';
  //new Worker(URL.createObjectURL(new Blob([`self.onmessage=function(e){postMessage('Worker: '+e.data);}`], { type: 'application/javascript' })));

function getLevelPattern(level, code) { 
  const actualLevel = level;
  const data = [];
    let $ = '';
    while (level-- > 0) {
      $ += '\\$';
    }
  const nextLevel$ = $ + '\\$';
  const pass = "passargs";

  const startingPattern = `[\\s;]${$}\\s*:\\s*((([a-zA-Z$_][a-zA-Z0-9$_]*\\s*,\\s*)*([a-zA-Z$_][a-zA-Z0-9$_]*\\s*;))|([a-zA-Z$_][a-zA-Z0-9$_]*\\s*;))?\\s*{`;
  const endingPattern = `(.*?)}\\s*${$}\\s*:\\s*;`;
  const nextLevelStartingParttern = `[\\s;]${nextLevel$}\\s*:\\s*((([a-zA-Z$_][a-zA-Z0-9$_]*\\s*,\\s*)*([a-zA-Z$_][a-zA-Z0-9$_]*\\s*;))|([a-zA-Z$_][a-zA-Z0-9$_]*\\s*;))?\\s*{`;
  const nextlevelEndingPattern = `(.*?)}\\s*${nextLevel$}\\s*:\\s*;`;

 
  const concurrentArgsPattern = `[\\s;]${$}\\s*:\\s*((([a-zA-Z$_][a-zA-Z0-9$_]*\\s*,\\s*)*([a-zA-Z$_][a-zA-Z0-9$_]*))|([a-zA-Z$_][a-zA-Z0-9$_]*))?\\s*;`;
  const passStartingPattern = `[\\s;]${pass}\\s*:\\s*((([a-zA-Z$_][a-zA-Z0-9$_]*\\s*,\\s*)*([a-zA-Z$_][a-zA-Z0-9$_]*))|([a-zA-Z$_][a-zA-Z0-9$_]*))?\\s*;`;
  const concurrentCodePattern = `${startingPattern}(.*?)${passStartingPattern}|${endingPattern}`;
  // ((${passStartingPattern})|(${endingPattern}))
  // Match level blocks
  const levelBlocks = code.match(new RegExp(`${startingPattern}${endingPattern}`, 'gs'));
  
  if (levelBlocks) {
    let tempData,block;
    let nextLevelBlocks = [];
    for (let i = 0; i < levelBlocks.length; i++){
      block = levelBlocks[i];
      code = code.replace(block, `${BLOCK_REPLACER}${i}${BLOCK_REPLACER}`);
      // Match next level blocks
      // nextLevelBlocks = block.match(new RegExp(`${nextLevelStartingParttern}${nextlevelEndingPattern}`, 'gs'));
      // if (nextLevelBlocks) {
      //   for (let i = 0; i < nextLevelBlocks.length; i++){
      //     block = block.replace(nextLevelBlocks[i], ' '); // ${BLOCK_REPLACER}${i}${BLOCK_REPLACER}
      //   }
      //   nextLevelBlocks = getLevelPattern(actualLevel + 1, nextLevelBlocks.join('\n')).data;
      // } else {
      //   nextLevelBlocks = [];
      // }
      tempData = {
        // .replace(new RegExp(`${BLOCK_REPLACER}[0-9]+${BLOCK_REPLACER}`, 'gs'), ' ')
        concurrent: block.match(new RegExp(concurrentCodePattern, 'gs'))[0],
        callback: block.match(new RegExp(`${passStartingPattern}(.*?)${endingPattern}`, 'gs'))[0],
        passArgs: '',
        concurrentArgs: '',
        children: nextLevelBlocks
      };
      tempData.passArgs = tempData.callback.match(new RegExp(passStartingPattern, 'gs'));
      if (tempData.passArgs) {
        tempData.passArgs = tempData.passArgs[0].replace(new RegExp(`[\\s;]${pass}\\s*:\\s*`),'').replace(/;$/,'')
      }
      tempData.concurrentArgs = tempData.concurrent.match(new RegExp(concurrentArgsPattern, 'gs'));
      if (tempData.concurrentArgs) {
        tempData.concurrentArgs = tempData.concurrentArgs[0].replace(new RegExp(`[\\s;]${$}\\s*:\\s*`),'').replace(/;$/,'')
      }
      tempData.callback = tempData.callback.replace(new RegExp(passStartingPattern),'').replace(new RegExp(endingPattern),'')
      tempData.concurrent = tempData.concurrent.replace(new RegExp(startingPattern),'').replace(new RegExp(`${passStartingPattern}|${endingPattern}`),'')
      //tempData.children = 
      data.push(tempData)
    }
  }
  

  

  return {data, code};
}

function RemoveStrings(code) {
  let strings = code.match(stringsPattern);
  if (strings) {
    for (let i = 0; i < strings.length; i++){
      code = code.replace(strings[i], `${stringRand}${i}${stringRand}`);
    }
    
  } else {
    strings = [];
  }
  return { strings, code };
}
function ReplaceStrings({ code, strings }) {
  for (let i = 0; i < strings.length; i++){
    code = code.replace(`${stringRand}${i}${stringRand}`,strings[i]);
  }
  return code;
}

function RemoveComments(code) {
  let comments = code.match(commentsPattern);
  if (comments) {
    for (let i = 0; i < comments.length; i++){
      code = code.replace(comments[i], `${commentRand}${i}${commentRand}`);
    }
    
  } else {
    comments = [];
  }
  return { comments, code };
}
function ReplaceComments({ code, comments }) {
  for (let i = 0; i < comments.length; i++){
    code = code.replace(`${commentRand}${i}${commentRand}`,comments[i]);
  }
  return code;
}


const stringRand = `STRING__${Math.random()}__`
const stringsPattern = /('((?<=\\)'|[^'\n])*')|("((?<=\\)"|[^"\n])*")|(`((?<=\\)`|[^`])*`)/gs;
const commentRand = `COMMENT__${Math.random()}__`
const commentsPattern = /(\/\*(.*?)\*\/)|(\/\/(.*?)\n)/gs;

setTimeout(() => {
  const s = "Hello my name is \'Kwaben\na\\' god\'s"
  console.log(s.match(stringsPattern));
}, 100);


function ParseConcurrentCode(mainCode) {
  let codeStringData = RemoveStrings(mainCode);
  let codeCommentData = RemoveComments(codeStringData.code);
  codeStringData = codeStringData.strings;
  mainCode = codeCommentData.code;
  codeCommentData = codeCommentData.comments;
  // Get level 1 blocks
  let { data, code } = getLevelPattern(1, mainCode);
  let workerCode = '{';
  let callbackCode = '';
  let block = null,passArgs = null,path = null, concurrentArgs = null;
  // Generate worker code
  for (let i = 0; i < data.length; i++) { 
    path = i;
    block = data[i];
    passArgs = block.passArgs.trim().split(',');
    passArgs.push('path');
    passArgs = passArgs.join(',');
    concurrentArgs = block.concurrentArgs.trim().split(',');
    concurrentArgs.push('path');
    // Generate concurrent code
    workerCode += `\n  ${path}:function(${concurrentArgs.join(',')}){${block.concurrent.replace(/\n/gs, '\n  ')}\n  },`;
    concurrentArgs.pop();
    concurrentArgs.push(path);
    // Generate callback code
    callbackCode = ` if(!${GLOBAL_WORKER_CALLBACK}[${path}]){\n    ${GLOBAL_WORKER_CALLBACK}[${path}] = function(${passArgs}){${block.callback.replace(/\n/gs,'\n  ')}\n    }\n };`+
    `\n ${GLOBAL_WORKER}.postMessage({path:${path},args:[${concurrentArgs.join(',')}]});`;
    // Replace concurrent_replacers with callback code
    code = code.replace(`${BLOCK_REPLACER}${i}${BLOCK_REPLACER}`, callbackCode);
  }
  workerCode += '\n}'
  code = ReplaceStrings({ code: ReplaceComments({ code: code, comments: codeCommentData }), strings: codeStringData });
  workerCode = ReplaceStrings({ code: ReplaceComments({ code: workerCode, comments: codeCommentData }), strings: codeStringData });
  return { workerCode, code };
}

const fs = require('fs');
const pth = 'C:/Users/Winfred/Desktop/kbis/code/concurrentjs/'
const path = require('path');

function writeCode(basePath,mainCode) {
  const { workerCode, code } = ParseConcurrentCode(mainCode);
  fs.writeFileSync(basePath + 'code.js', code);
  fs.writeFileSync(basePath + 'worker.task.js', 'const ACTIONS = \n'+workerCode+fs.readFileSync(path.join(__dirname,'/worker.driver.js'),'utf8'));
}
//
// const pattern = getLevelPattern(1);
// console.log(ParseConcurrentCode(s));
//console.log(GetContexts())

writeCode(pth, s);

(function () {
  // URL.createObjectURL
window.URL = window.URL || window.webkitURL;

// "Server response", used in all examples
var response = "self.onmessage=function(e){postMessage('Worker: '+e.data);}";

var blob;
try {
    blob = new Blob([response], {type: 'application/javascript'});
} catch (e) { // Backwards-compatibility
    window.BlobBuilder = window.BlobBuilder || window.WebKitBlobBuilder || window.MozBlobBuilder;
    blob = new BlobBuilder();
    blob.append(response);
    blob = blob.getBlob();
}
var worker = new Worker(URL.createObjectURL(blob));

// Test, used in all examples:
worker.onmessage = function(e) {
    alert('Response: ' + e.data);
};
  worker.postMessage('Test');
  

  return {
    CreateNewThread() {
      $: {
        const data = {};
        fetch().then(() => {

          $passback(data,$path)
        })
        $passargs: data;
        for (let i in data) {
            
        }
      }$: ;
    }
  }

})



