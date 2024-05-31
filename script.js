const testWrapper = document.querySelector(".test-wrapper");
const testArea = document.querySelector("#test-area");
var originText = document.querySelector("#origin-text p").innerHTML;
const resetButton = document.querySelector("#reset");
const theTimer = document.querySelector(".timer");
const origTestArea=document.querySelector("#test-area");
const theBestTimes=document.querySelector("#bestTimes");
const typoTracker=document.querySelector("#numErrors");
const beginButton = document.querySelector(".beginButton");
const sliceIndex=3;//use this to get the first 3 elements of the sorted list
var textIndex=0;//index for different text in array
var minutes=0;
var seconds=0;
var hundreths=0;
//used to keep track of whether timer is on
var start;
var timeArray=[];//array to store the total seconds for each test
var defaultIndex=-1;//increments to 0 if a non backspace input is pressed
var isBackspacePressed=false;
var correctCounter;//used to keep track of how many correct inputs there are
var incorrectCounter=0;//used to keep count of typos
const textArray=["The text to test.","This is a bit longer text. How fast can you complete it?","Let's try something with punctuation, shall we?"];
var backspace=false;
var spacebar=true;

//check if backspace is being pressed
document.addEventListener("keydown", function(event) {
  if (event.key === "Backspace") {
    // Backspace key was pressed
    backspace= true;
    spacebar=false;
  }
  //if spacebar was pressed
  else if(event.key===" "){
    spacebar=true;
    backspace=false;
  }
  //if any other key was pressed
  else{
    backspace=false;
    spacebar=false;
  }
});

//function to use another string to test
function newText(){
  //reset all the values to default
  clickedReset();
  //go to next text element in array
  ++textIndex;
  theBestTimes.innerHTML="Top 3 times will be placed here";//reset the text so that the fastest times will be displayed only for the new text you selected
  timeArray=[];//clear out the times for previous text
  if (textIndex==textArray.length){//if end of array is reached reset to the beggining 
    textIndex=0;
  }
  //change text contents in html to string in array in the textIndex value
  document.querySelector("#origin-text p").innerHTML=textArray[textIndex];
  originText=document.querySelector("#origin-text p").innerHTML;
  
  
}

// Add leading zero to numbers 9 or below (purely for aesthetics):
function convertToCorrectFormat(min,sec,huns){
  //change each number value to a string
  let minString= min.toString();
  let secString=sec.toString();
  let hunString=huns.toString();
  
  //check to see if number is less than 10, if so, add a 0 on front so it can match the desired format MM:SS:HH
  if (min<10){
    minString= "0"+minString;
  }
  if (sec<10){
    secString= "0"+secString;
  }
  if (huns<10){
    hunString= "0"+hunString;
  }
  //check to see the hundredths value has any decimal values even after calculation.
  //there were cases where even after fixing the number to only be 2 digits and no decimals, some hundredths values 
  //will come out as 22.000000001 for example. this is to protect against that by only keeping the first 2 digits.
  let checkForDecimal=hunString.includes(".");
  if (checkForDecimal){
    hunString=hunString.substr(0,2);
  }
  //add the strings together so it can match the desired clock format
  let formattedString=minString +":"+secString+":"+hunString;
  return formattedString;
  
}
  



// Run a standard minute/second/hundredths timer:
function startTimer(){
  ++hundreths
  //increment seconds and reset hundredths once they reach their respective limits
  if (hundreths >99){
    ++seconds;
    hundreths=0;
  }
  if (seconds==60){
    minutes++;
    seconds=0;
  }
  //display the minutes,seconds,hundredths in  00:00:00 format,which is returned from this function
  theTimer.innerHTML= convertToCorrectFormat(minutes,seconds,hundreths);
  
  

}

function startFunction(){
  typoTracker.innerHTML="Number of errors: "+incorrectCounter;
  //if timer has already started, start it and set the first question
  //set interval will keep repeating the start timer function every 10 milliseconds
  if (!start){
    start=setInterval(startTimer,10);
  }
  //this gets the entire string typed so far inside the test area
  let latestInput=testArea.value;
  //make sure the index matches the last index # in latest input so that the last letter entered can be evaluated 
  defaultIndex=latestInput.length-1;
  correctCounter=0;
  
  //if default index>-1, that means the typing has begun, so the program begins to check if the input is valid
  if (defaultIndex>-1){
    if (defaultIndex==0){//if one letter is entered, check to see if it is matching to its corresponding index in orign text
      //if the latest letter at index i matches the letter in origintext's index i, then increment the correct counter
      if (latestInput[defaultIndex] == originText[defaultIndex]){
        correctCounter++;
        
      }
    }
    for (let i=0; i<=defaultIndex;i++){//iterate over your input if it is more than 1 letter, begin to see if it so far matches origin text
      //if last letter in latest input matches the letter in the same index position, increment correct counter
      if (latestInput[i] == originText[i]){
        //keep border color the same if input is correct
        document.querySelector(".test-wrapper").style.borderColor = "grey";
        correctCounter++;
      }
      //if backspace or spacebar is pressed, ignore and continue the loop.
      //this is to make sure that they are not counted as errors
      else{
        //change the border color to red when a user makes an error
        document.querySelector(".test-wrapper").style.borderColor = "red";
        if (backspace){
          break;
        }
        if (spacebar){
          break;
        }
        
        //update the error counter if no match is found
        ++incorrectCounter;
        typoTracker.innerHTML="Number of errors: "+incorrectCounter;
        break;
      }
  }
    //if the number of correct inputs match the length of the target text, then end the timer and enter completedtext function
    if (correctCounter==originText.length){
      completedText();
    }
    
  }
  
  
}
//function when correct text is typed
function completedText(){
  //go to function to play ding noise when done
  finishedSound();
  //change the border outline to green when test is finished.
  document.querySelector(".test-wrapper").style.borderColor = "green";
  //convert to the time to seconds
  timeToSecs(minutes,seconds,hundreths);
  let sortedArray=timeArray.sort(function(a, b){return a-b});//sort the seconds in ascending order
  let sliceResult=sortedArray.slice(0,sliceIndex);
  secondsToClock(sliceResult)
  //stop timer
  clearInterval(start);
  minutes=0;
  seconds=0;
  hundreths=0;
  //timer is no longer on, so set start to null
  start=null;
  theTimer.innerHTML="00:00:00";
  testArea.value = ""; // Clear the text in the test area
  testArea.placeholder = "The clock starts when you start typing.";
  typoTracker.innerHTML="Number of errors: "+incorrectCounter;
  incorrectCounter=0;
}

//convert the seconds in array to proper time format
function secondsToClock(secondsArray){
  //array to keep track of fastest times in MM:SS;HH format
  let scoreList=[];
  //go through each of the variables in the seconds array and convert them to
  //apppropriate time format
  for(let i=0;i<secondsArray.length;i++){
    //calculate the hundredths value by getting the 2 numbers after the decimal place in each seconds array element
    let decimalValue =  (secondsArray[i]-Math.floor(secondsArray[i])).toFixed(2);//https://stackoverflow.com/questions/4512306/get-decimal-portion-of-a-number-with-javascript
    //make sure the decimal value is only 2 digits
    decimalValue*=Math.round(100).toFixed(2);
    //get the minutes and seconds from the total seconds
    //trunc and floor helps me get rid of decimals
    let mins=Math.floor(secondsArray[i]/60);
    let secs= Math.trunc(secondsArray[i]%60);
    scoreList.push(convertToCorrectFormat(mins,secs,decimalValue));
  }
  theBestTimes.innerHTML=scoreList.join("<br>");//put each result in new line
  
}





// Reset everything:
function clickedReset(){
  //reset all the values to their default ones
  clearInterval(start);
  minutes=0;
  seconds=0;
  hundreths=0;
  start=null;
  theTimer.innerHTML="00:00:00";
  testArea.value = ""; // Clear the text in the test area
  testArea.placeholder = "The clock starts when you start typing.";
  typoTracker.innerHTML="# of errors will be placed here";
  document.querySelector(".test-wrapper").style.borderColor = "grey";
  incorrectCounter=0;
}
//function to convert the time on the clock into seconds
function timeToSecs(min,sec,huns){
  let seconds=0;
  //convert the values to seconds and add to array
  seconds+=min*60;
  seconds+=sec;
  seconds+=huns/100;
  timeArray.push(seconds);
  
}
//function to play sound when test is complete
function finishedSound(){
  var ding= new Audio('https://cdn.glitch.global/b6d37e84-844a-48a5-a5d9-c381951a3c44/ding-sound-effect_1.mp3?v=1714607577713');
  ding.play();

}


// Event listeners for keyboard input and the reset button:
testArea.addEventListener("input",startFunction );
resetButton.addEventListener("click", clickedReset);

